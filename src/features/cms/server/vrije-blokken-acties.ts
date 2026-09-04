"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import {
  bloktype,
  heeftVrijeBlokken,
  MAX_VRIJE_BLOKKEN,
} from "@/content/vrije-blokken";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { Json } from "@/lib/supabase/types";

import { paginaNaam } from "./editor";

/**
 * Beheer van de vrije blokken onder aan een pagina.
 *
 * Alles wat hier gebeurt landt in de conceptkolommen. De bezoeker ziet er niets
 * van tot er wordt gepubliceerd, en dat is dezelfde knop die de vaste blokken
 * publiceert — anders zou je twee keer moeten publiceren voor één pagina, en
 * dat vergeet iedereen precies één keer.
 */

export type VrijBlokResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

const GEEN_RECHTEN: VrijBlokResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

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

function ververs(pageKey: string) {
  revalidatePath(paginaNaam(pageKey).pad);
  revalidatePath(`/admin/site-editor/${pageKey}`);
  revalidatePath(`/voorbeeld/${pageKey}`);
}

/** Een blok toevoegen. Het staat meteen als concept klaar, nog niet online. */
export async function voegVrijBlokToe(
  pageKey: string,
  type: string,
): Promise<VrijBlokResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  if (!heeftVrijeBlokken(pageKey)) {
    return { status: "fout", bericht: "Op deze pagina kan dat niet." };
  }
  if (!bloktype(type)) {
    return { status: "fout", bericht: "Dit soort blok kennen we niet." };
  }

  const { supabase, adminId } = context;

  const { count } = await supabase
    .from("pagina_blokken")
    .select("id", { count: "exact", head: true })
    .eq("page_key", pageKey);

  if ((count ?? 0) >= MAX_VRIJE_BLOKKEN) {
    return {
      status: "fout",
      bericht: `Er passen ${MAX_VRIJE_BLOKKEN} blokken onder een pagina. Haal er eerst een weg.`,
    };
  }

  const { error } = await supabase.from("pagina_blokken").insert({
    page_key: pageKey,
    type,
    // Geen volgorde: daarmee is hij nog niet gepubliceerd. Hij krijgt zijn
    // plaats zodra er wordt gepubliceerd.
    volgorde: null,
    inhoud: {},
  });

  if (error) {
    return { status: "fout", bericht: "Het blok kon niet worden toegevoegd." };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "blok_gepubliceerd",
    entiteit: "pagina_blokken",
    meta: { pagina: pageKey, type, handeling: "toegevoegd" },
  });

  ververs(pageKey);
  return { status: "gelukt", bericht: "Blok toegevoegd. Nog niet online." };
}

const bewaarSchema = z.object({
  id: z.string().uuid(),
  pageKey: z.string().min(1),
  inhoud: z.string(),
});

/** De inhoud van een blok bewaren, als concept. */
export async function bewaarVrijBlok(
  _vorige: VrijBlokResultaat,
  formData: FormData,
): Promise<VrijBlokResultaat> {
  const parsed = bewaarSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "fout", bericht: "Er ging iets mis bij het bewaren." };
  }

  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  let inhoud: Json;
  try {
    inhoud = JSON.parse(parsed.data.inhoud) as Json;
  } catch {
    return { status: "fout", bericht: "De inhoud kon niet worden gelezen." };
  }

  const { error } = await context.supabase
    .from("pagina_blokken")
    .update({ concept_inhoud: inhoud })
    .eq("id", parsed.data.id)
    .eq("page_key", parsed.data.pageKey);

  if (error) {
    return { status: "fout", bericht: "Het blok kon niet worden bewaard." };
  }

  ververs(parsed.data.pageKey);
  return { status: "gelukt", bericht: "Bewaard als concept." };
}

/**
 * Een blok een plaats omhoog of omlaag.
 *
 * De volgorde wordt in één keer opnieuw genummerd in plaats van twee rijen om
 * te wisselen. Dat is een schrijfactie meer en een hele klasse fouten minder:
 * gaten, dubbele nummers en blokken die na een verwijdering van plaats wippen.
 */
export async function verplaatsVrijBlok(
  pageKey: string,
  blokId: string,
  richting: "omhoog" | "omlaag",
): Promise<VrijBlokResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase } = context;

  const { data: rijen } = await supabase
    .from("pagina_blokken")
    .select("id, volgorde, concept_volgorde, concept_verwijderd, created_at")
    .eq("page_key", pageKey);

  if (!rijen) return { status: "fout", bericht: "Er ging iets mis." };

  const geordend = rijen
    .filter((rij) => !rij.concept_verwijderd)
    .sort((a, b) => {
      const va = a.concept_volgorde ?? a.volgorde;
      const vb = b.concept_volgorde ?? b.volgorde;
      if (va !== null && vb !== null) return va - vb;
      if (va !== null) return -1;
      if (vb !== null) return 1;
      return a.created_at.localeCompare(b.created_at);
    });

  const index = geordend.findIndex((rij) => rij.id === blokId);
  if (index === -1)
    return { status: "fout", bericht: "Dit blok bestaat niet." };

  const naar = richting === "omhoog" ? index - 1 : index + 1;
  if (naar < 0 || naar >= geordend.length) {
    return { status: "gelukt", bericht: "Dit blok staat al aan het einde." };
  }

  const verwisseld = [...geordend];
  [verwisseld[index], verwisseld[naar]] = [
    verwisseld[naar]!,
    verwisseld[index]!,
  ];

  for (const [positie, rij] of verwisseld.entries()) {
    const { error } = await supabase
      .from("pagina_blokken")
      .update({ concept_volgorde: positie + 1 })
      .eq("id", rij.id);
    if (error) {
      return { status: "fout", bericht: "Verplaatsen lukte niet." };
    }
  }

  ververs(pageKey);
  return { status: "gelukt", bericht: "Volgorde aangepast. Nog niet online." };
}

/** Een blok aan- of uitzetten. */
export async function zetVrijBlokZichtbaar(
  pageKey: string,
  blokId: string,
  zichtbaar: boolean,
): Promise<VrijBlokResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { error } = await context.supabase
    .from("pagina_blokken")
    .update({ concept_zichtbaar: zichtbaar })
    .eq("id", blokId)
    .eq("page_key", pageKey);

  if (error) {
    return { status: "fout", bericht: "Dit kon niet worden gewijzigd." };
  }

  ververs(pageKey);
  return {
    status: "gelukt",
    bericht: zichtbaar
      ? "Komt online bij het publiceren."
      : "Verdwijnt bij het publiceren.",
  };
}

/**
 * Een blok weghalen.
 *
 * Een blok dat nog nooit online stond verdwijnt meteen; daar valt niets aan te
 * publiceren. Een blok dat wél online staat wordt gemarkeerd en verdwijnt pas
 * bij het publiceren, zodat de site niet verandert voordat je erom vraagt.
 */
export async function verwijderVrijBlok(
  pageKey: string,
  blokId: string,
): Promise<VrijBlokResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data: blok } = await supabase
    .from("pagina_blokken")
    .select("volgorde, type")
    .eq("id", blokId)
    .eq("page_key", pageKey)
    .maybeSingle();

  if (!blok) return { status: "fout", bericht: "Dit blok bestaat niet meer." };

  const nooitOnline = blok.volgorde === null;

  const { error } = nooitOnline
    ? await supabase.from("pagina_blokken").delete().eq("id", blokId)
    : await supabase
        .from("pagina_blokken")
        .update({ concept_verwijderd: true })
        .eq("id", blokId);

  if (error) {
    return { status: "fout", bericht: "Het blok kon niet worden weggehaald." };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "blok_gepubliceerd",
    entiteit: "pagina_blokken",
    entiteitId: blokId,
    meta: { pagina: pageKey, type: blok.type, handeling: "verwijderd" },
  });

  ververs(pageKey);
  return {
    status: "gelukt",
    bericht: nooitOnline
      ? "Blok weggehaald."
      : "Verdwijnt van de site bij het publiceren.",
  };
}
