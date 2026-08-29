"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BLOKKEN } from "@/content/blokken";
import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { Json } from "@/lib/supabase/types";

import { paginaNaam } from "./editor";

/**
 * Bewerken en publiceren van site-inhoud (BOUWPROMPT §14).
 *
 * De werkwijze is concept → publiceren. Wijzigingen gaan naar `draft_value`;
 * de publieke site leest uitsluitend `value`. Zo kan een beheerder rustig aan
 * een tekst werken zonder dat bezoekers halve zinnen zien.
 *
 * Publiceren kopieert het concept naar `value` en ververst de betreffende
 * pagina's meteen, zodat de wijziging binnen enkele seconden online staat —
 * zonder nieuwe uitrol.
 */

export type EditorResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, deleted_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (data?.role !== "admin" || data.deleted_at !== null) return null;
  return { supabase, adminId: gebruiker.id };
}

const GEEN_RECHTEN: EditorResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

/** Ververst de publieke pagina's waar dit blok op staat. */
function verversPagina(pageKey: string) {
  const naam = paginaNaam(pageKey);
  revalidatePath(naam.pad);
  // De paginavoet staat op elke pagina, dus die verversen we in het geheel.
  if (pageKey === "footer") revalidatePath("/", "layout");
  revalidatePath(`/admin/site-editor/${pageKey}`);
}

/** Is dit een blok dat de site daadwerkelijk toont? */
function kentBlok(pageKey: string, blockKey: string) {
  return BLOKKEN.find(
    (blok) => blok.page_key === pageKey && blok.block_key === blockKey,
  );
}

const opslaanSchema = z.object({
  page_key: z.string().min(1),
  block_key: z.string().min(1),
  waarde: z.string(),
});

/**
 * Slaat een concept op. De waarde komt als JSON binnen omdat een blok een
 * tekst, een stuk HTML, een afbeelding of een lijst kan zijn.
 */
export async function bewaarConcept(
  _vorige: EditorResultaat,
  formData: FormData,
): Promise<EditorResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = opslaanSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return { status: "fout", bericht: "Controleer de invoer." };
  }

  const definitie = kentBlok(parsed.data.page_key, parsed.data.block_key);
  if (!definitie) {
    // Een blok dat de site niet toont, kan ook niet worden bewerkt: de
    // structuur ligt vast in code (§14).
    return { status: "fout", bericht: "Dit blok bestaat niet." };
  }

  let waarde: Json;
  try {
    waarde = JSON.parse(parsed.data.waarde) as Json;
  } catch {
    return { status: "fout", bericht: "De inhoud kon niet worden gelezen." };
  }

  const { supabase, adminId } = context;

  const { error } = await supabase.from("content_blocks").upsert(
    {
      page_key: parsed.data.page_key,
      block_key: parsed.data.block_key,
      kind: definitie.kind,
      // Bestaat de rij nog niet, dan komt de startinhoud in `value` te staan;
      // de publieke site blijft daarmee tonen wat hij al toonde.
      value: definitie.value as unknown as Json,
      draft_value: waarde,
      updated_by: adminId,
    },
    { onConflict: "page_key,block_key", ignoreDuplicates: false },
  );

  if (error) {
    return {
      status: "fout",
      bericht: "Het concept kon niet worden opgeslagen.",
    };
  }

  revalidatePath(`/admin/site-editor/${parsed.data.page_key}`);
  return { status: "gelukt", bericht: "Concept opgeslagen." };
}

const zichtbaarheidSchema = z.object({
  page_key: z.string().min(1),
  block_key: z.string().min(1),
  zichtbaar: z.enum(["ja", "nee"]),
});

/**
 * Zet een blok aan of uit op de pagina.
 *
 * Gaat naar `draft_zichtbaar` en niet meteen naar `zichtbaar`: de schakelaar
 * hoort bij dezelfde publiceerknop als de teksten ernaast. Zou één klik direct
 * op de site staan, dan verdwijnt een sectie terwijl de bijbehorende
 * tekstwijziging nog als concept wacht.
 *
 * Alleen blokken die in de code als `verbergbaar` staan aangemerkt mogen weg.
 * Een kop of een prijs verbergen laat een half scherm achter; dat hoort geen
 * keuze te zijn die per ongeluk gemaakt kan worden.
 */
export async function zetZichtbaarheid(
  _vorige: EditorResultaat,
  formData: FormData,
): Promise<EditorResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = zichtbaarheidSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "fout", bericht: "Controleer de invoer." };
  }

  const definitie = kentBlok(parsed.data.page_key, parsed.data.block_key);
  if (!definitie) return { status: "fout", bericht: "Dit blok bestaat niet." };

  if (definitie.verbergbaar !== true) {
    return {
      status: "fout",
      bericht: "Dit blok hoort bij de indeling van de pagina en kan niet weg.",
    };
  }

  const { supabase, adminId } = context;
  const wordtZichtbaar = parsed.data.zichtbaar === "ja";

  const { data: bestaand } = await supabase
    .from("content_blocks")
    .select("zichtbaar")
    .eq("page_key", parsed.data.page_key)
    .eq("block_key", parsed.data.block_key)
    .maybeSingle();

  const nuZichtbaar = bestaand?.zichtbaar ?? true;

  const { error } = await supabase.from("content_blocks").upsert(
    {
      page_key: parsed.data.page_key,
      block_key: parsed.data.block_key,
      kind: definitie.kind,
      value: definitie.value as unknown as Json,
      // Terug naar de stand die al online staat is geen wijziging meer; dan
      // hoort het blok ook niet als concept te blijven tellen.
      draft_zichtbaar: wordtZichtbaar === nuZichtbaar ? null : wordtZichtbaar,
      updated_by: adminId,
    },
    { onConflict: "page_key,block_key", ignoreDuplicates: false },
  );

  if (error) {
    return { status: "fout", bericht: "De schakelaar kon niet worden gezet." };
  }

  revalidatePath(`/admin/site-editor/${parsed.data.page_key}`);
  return {
    status: "gelukt",
    bericht: wordtZichtbaar
      ? "Dit blok staat weer op de pagina zodra je publiceert."
      : "Dit blok verdwijnt van de pagina zodra je publiceert.",
  };
}

/** Publiceert alle concepten van één pagina (BOUWPROMPT §14). */
export async function publiceerPagina(pageKey: string) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data: concepten } = await supabase
    .from("content_blocks")
    .select("block_key, draft_value, value, draft_zichtbaar, zichtbaar")
    .eq("page_key", pageKey)
    .or("draft_value.not.is.null,draft_zichtbaar.not.is.null");

  if (!concepten || concepten.length === 0) {
    return {
      status: "fout" as const,
      bericht: "Er staan geen wijzigingen klaar om te publiceren.",
    };
  }

  // Per blok: concept naar gepubliceerd, en het concept opruimen. Dat geldt
  // voor de inhoud én voor de schakelaar — een blok kan alleen verborgen zijn,
  // alleen gewijzigd, of allebei.
  for (const concept of concepten) {
    const { error } = await supabase
      .from("content_blocks")
      .update({
        value: (concept.draft_value ?? concept.value) as Json,
        draft_value: null,
        zichtbaar: concept.draft_zichtbaar ?? concept.zichtbaar,
        draft_zichtbaar: null,
        updated_by: adminId,
      })
      .eq("page_key", pageKey)
      .eq("block_key", concept.block_key);

    if (error) {
      return {
        status: "fout" as const,
        bericht: "Publiceren is halverwege misgegaan. Probeer het opnieuw.",
      };
    }
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "blok_gepubliceerd",
    entiteit: "content_blocks",
    entiteitId: pageKey,
    meta: {
      aantalBlokken: concepten.length,
      blokken: concepten.map((concept) => concept.block_key),
    },
  });

  verversPagina(pageKey);

  return {
    status: "gelukt" as const,
    bericht: `${concepten.length} ${
      concepten.length === 1 ? "wijziging staat" : "wijzigingen staan"
    } nu op de website.`,
  };
}

/** Gooit de concepten van één pagina weg (BOUWPROMPT §14, "Herstel"). */
export async function herstelPagina(pageKey: string) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase } = context;

  const { error } = await supabase
    .from("content_blocks")
    .update({ draft_value: null, draft_zichtbaar: null })
    .eq("page_key", pageKey)
    .or("draft_value.not.is.null,draft_zichtbaar.not.is.null");

  if (error) {
    return {
      status: "fout" as const,
      bericht: "De concepten konden niet worden weggegooid.",
    };
  }

  revalidatePath(`/admin/site-editor/${pageKey}`);
  return {
    status: "gelukt" as const,
    bericht: "De concepten zijn weggegooid. De website is onveranderd.",
  };
}
