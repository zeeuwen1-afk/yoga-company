"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BLOKTYPEN, bloktype, SJABLOON } from "@/content/docent-blokken";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { Json } from "@/lib/supabase/types";

/**
 * Bewerkingen op de eigen docentenpagina (§ docentenpagina's).
 *
 * Elke actie hieronder schrijft uitsluitend in de conceptkolommen. De bezoeker
 * ziet `inhoud`, `volgorde` en `zichtbaar`, en die veranderen pas bij
 * publiceren — ook bij een verplaatsing of een verwijdering. Zo kan een docent
 * rustig schuiven zonder dat er iemand meekijkt over zijn schouder.
 *
 * Wie mag wat, staat niet hier maar in de policies. Deze acties zeggen wat we
 * bedoelen; de database bepaalt wat er gebeurt.
 */

export type PaginaResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

const GERESERVEERD = [
  "nieuw",
  "admin",
  "portaal",
  "docenten",
  "docent",
  "onze-docenten",
  "pagina",
  "voorbeeld",
  "api",
  "lessen",
  "tarieven",
  "contact",
  "inloggen",
  "registreren",
  "over-ons",
  "veiligheid",
];

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Kies een adres van minstens twee tekens")
  .max(60, "Houd het adres kort")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Alleen kleine letters, cijfers en koppeltekens",
  )
  .refine(
    (s) => !GERESERVEERD.includes(s),
    "Dit adres is al in gebruik door de site",
  );

/**
 * De pagina aanmaken, met een sjabloon erin.
 *
 * Bewust niet leeg: een leeg scherm met "voeg een blok toe" levert een pagina
 * op die maanden half af blijft staan.
 */
export async function maakPagina(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = slugSchema.safeParse(formData.get("slug"));

  if (!parsed.success) {
    return { status: "fout", bericht: parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", gebruiker.id)
    .maybeSingle();

  const { error } = await supabase.from("docent_paginas").insert({
    profile_id: gebruiker.id,
    slug: parsed.data,
    seo_titel: profiel
      ? `${profiel.first_name} ${profiel.last_name} — yogadocent`
      : null,
  });

  if (error) {
    return {
      status: "fout",
      bericht:
        error.code === "23505"
          ? "Dit adres is al door iemand anders gekozen. Probeer een andere."
          : "Je hebt een lopend abonnement nodig om een pagina te maken.",
    };
  }

  const blokken = SJABLOON.map((type, index) => {
    const definitie = bloktype(type)!;
    const start = { ...definitie.start } as Record<string, unknown>;

    if (type === "kop_portret" && profiel) {
      start.titel = `${profiel.first_name} ${profiel.last_name}`;
    }

    return {
      pagina_id: gebruiker.id,
      type,
      // Meteen op volgorde, zodat publiceren genoeg is om live te gaan.
      volgorde: index + 1,
      inhoud: start as Json,
    };
  });

  await supabase.from("docent_blokken").insert(blokken);

  revalidatePath("/docenten/pagina");
  return {
    status: "gelukt",
    bericht: `Je pagina staat klaar op /docent/${parsed.data}. Hij is nog niet zichtbaar — pas de teksten aan en publiceer.`,
  };
}

const blokSchema = z.object({
  blok_id: z.uuid(),
  inhoud: z.string(),
});

export async function bewaarBlok(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = blokSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "fout", bericht: "Controleer de invoer." };
  }

  let inhoud: Json;
  try {
    inhoud = JSON.parse(parsed.data.inhoud) as Json;
  } catch {
    return { status: "fout", bericht: "De inhoud kon niet worden gelezen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("docent_blokken")
    .update({ concept_inhoud: inhoud })
    .eq("id", parsed.data.blok_id);

  if (error) {
    return {
      status: "fout",
      bericht: "Opslaan lukte niet. Heb je nog een lopend abonnement?",
    };
  }

  revalidatePath("/docenten/pagina");
  return { status: "gelukt", bericht: "Opgeslagen als concept." };
}

const verplaatsSchema = z.object({
  blok_id: z.uuid(),
  richting: z.enum(["omhoog", "omlaag"]),
});

/**
 * Een blok een plaats omhoog of omlaag.
 *
 * Geen slepen als enige weg: pijltjes werken op een telefoon, met een
 * toetsenbord, en voor wie niet zo handig is met een muis. Het wisselen
 * gebeurt hier en niet in de database, omdat het om twee rijen gaat die
 * allebei van dezelfde docent zijn — RLS dekt dat af.
 */
export async function verplaatsBlok(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = verplaatsSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { status: "fout", bericht: "Er ging iets mis." };

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) {
    return { status: "fout", bericht: "Je sessie is verlopen." };
  }

  const { data: blokken } = await supabase
    .from("docent_blokken")
    .select("id, type, volgorde, concept_volgorde, concept_verwijderd")
    .eq("pagina_id", gebruiker.id);

  if (!blokken) return { status: "fout", bericht: "Er ging iets mis." };

  const geordend = blokken
    .filter((b) => !b.concept_verwijderd)
    .map((b) => ({
      id: b.id,
      type: b.type,
      plek:
        b.type === "kop_portret"
          ? -1
          : (b.concept_volgorde ?? b.volgorde ?? 9999),
    }))
    .sort((a, b) => a.plek - b.plek);

  const index = geordend.findIndex((b) => b.id === parsed.data.blok_id);
  if (index < 0) return { status: "fout", bericht: "Dit blok bestaat niet." };

  if (geordend[index]!.type === "kop_portret") {
    return {
      status: "fout",
      bericht:
        "De kop met je portret blijft bovenaan staan — daar staat je naam in.",
    };
  }

  const doel = parsed.data.richting === "omhoog" ? index - 1 : index + 1;

  // De kop staat op plaats 0 en blijft daar; omhoog gaan tot plaats 1.
  if (doel < 1 || doel >= geordend.length) {
    return {
      status: "gelukt",
      bericht: "Dit blok staat al helemaal aan het eind.",
    };
  }

  const a = geordend[index]!;
  const b = geordend[doel]!;

  // Nieuwe nummers uitdelen over de hele lijst, zodat er geen gaten of
  // dubbelingen ontstaan als er eerder blokken zijn weggegooid.
  const nieuw = [...geordend];
  nieuw[index] = b;
  nieuw[doel] = a;

  for (const [plek, blok] of nieuw.entries()) {
    if (blok.type === "kop_portret") continue;
    await supabase
      .from("docent_blokken")
      .update({ concept_volgorde: plek + 1 })
      .eq("id", blok.id);
  }

  revalidatePath("/docenten/pagina");
  return {
    status: "gelukt",
    bericht: "Verplaatst. Publiceer om het online te zetten.",
  };
}

const zichtbaarSchema = z.object({
  blok_id: z.uuid(),
  zichtbaar: z.enum(["ja", "nee"]),
});

export async function zetZichtbaar(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = zichtbaarSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { status: "fout", bericht: "Er ging iets mis." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("docent_blokken")
    .update({ concept_zichtbaar: parsed.data.zichtbaar === "ja" })
    .eq("id", parsed.data.blok_id);

  if (error) return { status: "fout", bericht: "Dat lukte niet." };

  revalidatePath("/docenten/pagina");
  return {
    status: "gelukt",
    bericht:
      parsed.data.zichtbaar === "ja"
        ? "Weer zichtbaar na publiceren."
        : "Verborgen. Hij verdwijnt van je pagina zodra je publiceert.",
  };
}

const toevoegenSchema = z.object({
  type: z.enum(
    BLOKTYPEN.filter((b) => !b.verankerd).map((b) => b.type) as [
      string,
      ...string[],
    ],
  ),
});

export async function voegBlokToe(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = toevoegenSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "fout", bericht: "Kies een soort blok." };
  }

  const definitie = bloktype(parsed.data.type)!;
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { status: "fout", bericht: "Je sessie is verlopen." };

  const { data: bestaand } = await supabase
    .from("docent_blokken")
    .select("volgorde, concept_volgorde")
    .eq("pagina_id", gebruiker.id);

  const hoogste = (bestaand ?? []).reduce(
    (max, b) => Math.max(max, b.concept_volgorde ?? b.volgorde ?? 0),
    0,
  );

  // `volgorde` blijft leeg: het blok bestaat voorlopig alleen als concept en
  // is publiek dus onzichtbaar tot er gepubliceerd wordt.
  const { error } = await supabase.from("docent_blokken").insert({
    pagina_id: gebruiker.id,
    type: parsed.data.type,
    volgorde: null,
    concept_volgorde: hoogste + 1,
    concept_inhoud: definitie.start as Json,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Toevoegen lukte niet. Heb je nog een lopend abonnement?",
    };
  }

  revalidatePath("/docenten/pagina");
  return {
    status: "gelukt",
    bericht: `${definitie.naam} toegevoegd, onderaan. Verplaats hem waar je hem hebben wilt.`,
  };
}

export async function verwijderBlok(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const id = z.uuid().safeParse(formData.get("blok_id"));
  if (!id.success) return { status: "fout", bericht: "Er ging iets mis." };

  const supabase = await createClient();

  const { data: blok } = await supabase
    .from("docent_blokken")
    .select("type")
    .eq("id", id.data)
    .maybeSingle();

  if (blok?.type === "kop_portret") {
    return {
      status: "fout",
      bericht: "De kop met je portret kan niet weg — daar staat je naam in.",
    };
  }

  // Nog niet echt weggooien: pas bij publiceren. Tot dat moment kun je je
  // bedenken, en de bezoeker ziet het blok intussen al niet meer.
  const { error } = await supabase
    .from("docent_blokken")
    .update({ concept_verwijderd: true })
    .eq("id", id.data);

  if (error) return { status: "fout", bericht: "Dat lukte niet." };

  revalidatePath("/docenten/pagina");
  return {
    status: "gelukt",
    bericht: "Weggehaald. Tot je publiceert kun je je nog bedenken.",
  };
}

export async function publiceerPagina(
  _vorige: PaginaResultaat,
): Promise<PaginaResultaat> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  const { data, error } = await supabase.rpc("publiceer_docentpagina");

  if (error) return { status: "fout", bericht: error.message };

  const { data: pagina } = await supabase
    .from("docent_paginas")
    .select("slug")
    .eq("profile_id", gebruiker?.id ?? "")
    .maybeSingle();

  revalidatePath("/docenten/pagina");
  if (pagina?.slug) {
    revalidatePath(`/docent/${pagina.slug}`);
    revalidatePath("/onze-docenten");
  }

  return {
    status: "gelukt",
    bericht: `Gepubliceerd. Je pagina staat online met ${data} ${
      data === 1 ? "blok" : "blokken"
    }.`,
  };
}

/** Wat een foto maximaal mag wegen. De bucket zelf staat op 20 MB en dat is
 *  niet per map in te stellen, dus de grens staat hier én als check op
 *  `docent_media`. */
const MAX_BYTES = 3 * 1024 * 1024;
const TOEGESTAAN = ["image/jpeg", "image/png", "image/webp"];

export async function uploadFoto(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const bestand = formData.get("foto");

  if (!(bestand instanceof File) || bestand.size === 0) {
    return { status: "fout", bericht: "Kies een bestand." };
  }

  if (!TOEGESTAAN.includes(bestand.type)) {
    return {
      status: "fout",
      bericht: "Alleen jpg, png of webp. Andere bestanden laten we niet toe.",
    };
  }

  if (bestand.size > MAX_BYTES) {
    return {
      status: "fout",
      bericht: `Deze foto is ${Math.round(bestand.size / 1024 / 1024)} MB. Houd het onder de 3 MB — verklein hem eerst.`,
    };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { status: "fout", bericht: "Je sessie is verlopen." };

  // Het pad begint met `docent/{eigen id}/`. De storage-policy weigert alles
  // daarbuiten, dus een docent kan het bestand van een collega niet
  // overschrijven door een foto met dezelfde naam te uploaden.
  const veiligeNaam = bestand.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60);
  const pad = `docent/${gebruiker.id}/${Date.now()}-${veiligeNaam}`;

  const { error: uploadFout } = await supabase.storage
    .from("public-media")
    .upload(pad, bestand, { contentType: bestand.type, upsert: false });

  if (uploadFout) {
    return {
      status: "fout",
      bericht: "Uploaden lukte niet. Probeer het opnieuw.",
    };
  }

  const { error } = await supabase.from("docent_media").insert({
    profile_id: gebruiker.id,
    pad,
    bestandsnaam: bestand.name,
    bytes: bestand.size,
    alt: String(formData.get("alt") ?? "") || null,
  });

  if (error) {
    // Het bestand staat er wel maar de administratie niet; opruimen zodat er
    // geen wees achterblijft in de opslag.
    await supabase.storage.from("public-media").remove([pad]);
    return {
      status: "fout",
      bericht: "Uploaden lukte niet. Probeer het opnieuw.",
    };
  }

  revalidatePath("/docenten/pagina");
  return { status: "gelukt", bericht: "Foto toegevoegd aan je beeldbank." };
}

const seoSchema = z.object({
  seo_titel: z.string().trim().max(70).optional().or(z.literal("")),
  seo_omschrijving: z.string().trim().max(180).optional().or(z.literal("")),
});

export async function bewaarSeo(
  _vorige: PaginaResultaat,
  formData: FormData,
): Promise<PaginaResultaat> {
  const parsed = seoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "fout",
      bericht:
        "Houd de titel onder de 70 en de omschrijving onder de 180 tekens.",
    };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { status: "fout", bericht: "Je sessie is verlopen." };

  const { error } = await supabase
    .from("docent_paginas")
    .update({
      seo_titel: parsed.data.seo_titel || null,
      seo_omschrijving: parsed.data.seo_omschrijving || null,
    })
    .eq("profile_id", gebruiker.id);

  if (error) return { status: "fout", bericht: "Opslaan lukte niet." };

  revalidatePath("/docenten/pagina");
  return { status: "gelukt", bericht: "Opgeslagen." };
}
