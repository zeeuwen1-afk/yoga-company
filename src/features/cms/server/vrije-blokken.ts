import "server-only";

import { heeftVrijeBlokken } from "@/content/vrije-blokken";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/**
 * De vrije blokken onder aan een pagina, voor de site en voor de editor.
 *
 * Twee functies met bewust verschillende clients. De publieke leest met de
 * anonieme sleutel, zodat de policy op de tabel bepaalt wat er te zien is en
 * niet een `where` die iemand ooit vergeet. De editor leest met de sessie van
 * de beheerder en krijgt de concepten er wél bij.
 */

export type VrijBlok = {
  id: string;
  type: string;
  inhoud: Record<string, unknown>;
};

export type VrijBlokInEditor = VrijBlok & {
  volgorde: number | null;
  zichtbaar: boolean;
  /** Wat het wordt na publiceren. */
  conceptInhoud: Record<string, unknown> | null;
  conceptZichtbaar: boolean | null;
  conceptVerwijderd: boolean;
  heeftConcept: boolean;
};

/**
 * Wat de bezoeker ziet: gepubliceerd en aangezet.
 *
 * Met `concept` erbij komen ook de nog niet gepubliceerde blokken mee, in de
 * volgorde die na publiceren gaat gelden. Dat is wat de voorvertoning in de
 * site-editor laat zien; de publieke pagina vraagt er nooit om.
 */
export async function haalVrijeBlokken(
  pageKey: string,
  { concept = false }: { concept?: boolean } = {},
): Promise<VrijBlok[]> {
  if (!heeftVrijeBlokken(pageKey)) return [];

  if (concept) {
    const blokken = await haalVrijeBlokkenVoorEditor(pageKey);
    return blokken
      .filter((blok) => !blok.conceptVerwijderd && blok.zichtbaar)
      .map((blok) => ({
        id: blok.id,
        type: blok.type,
        inhoud: blok.conceptInhoud ?? blok.inhoud,
      }));
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pagina_blokken")
      .select("id, type, inhoud")
      .eq("page_key", pageKey)
      .order("volgorde");

    if (error || !data) return [];

    return data.map((rij) => ({
      id: rij.id,
      type: rij.type,
      inhoud: (rij.inhoud ?? {}) as Record<string, unknown>,
    }));
  } catch {
    // Een pagina hoort niet om te vallen omdat een extra blok niet op te halen
    // is. De vaste secties staan er dan gewoon, zonder de vrije zone.
    return [];
  }
}

/**
 * Wat de beheerder ziet: alles, met de concepten erbij en in de volgorde die
 * na publiceren gaat gelden.
 */
export async function haalVrijeBlokkenVoorEditor(
  pageKey: string,
): Promise<VrijBlokInEditor[]> {
  if (!heeftVrijeBlokken(pageKey)) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("pagina_blokken")
    .select(
      `id, type, volgorde, zichtbaar, inhoud,
       concept_inhoud, concept_volgorde, concept_zichtbaar, concept_verwijderd,
       created_at`,
    )
    .eq("page_key", pageKey);

  if (!data) return [];

  return data
    .map((rij) => ({
      id: rij.id,
      type: rij.type,
      inhoud: (rij.inhoud ?? {}) as Record<string, unknown>,
      volgorde: rij.concept_volgorde ?? rij.volgorde,
      zichtbaar: rij.concept_zichtbaar ?? rij.zichtbaar,
      conceptInhoud: rij.concept_inhoud as Record<string, unknown> | null,
      conceptZichtbaar: rij.concept_zichtbaar,
      conceptVerwijderd: rij.concept_verwijderd,
      heeftConcept:
        rij.concept_inhoud !== null ||
        rij.concept_volgorde !== null ||
        rij.concept_zichtbaar !== null ||
        rij.concept_verwijderd ||
        rij.volgorde === null,
      // Een nieuw blok heeft nog geen volgorde; die sorteert achteraan op het
      // moment dat hij is aangemaakt, zodat hij onderaan verschijnt waar je
      // hem net hebt toegevoegd.
      _gemaakt: rij.created_at,
    }))
    .sort((a, b) => {
      if (a.volgorde !== null && b.volgorde !== null) {
        return a.volgorde - b.volgorde;
      }
      if (a.volgorde !== null) return -1;
      if (b.volgorde !== null) return 1;
      return a._gemaakt.localeCompare(b._gemaakt);
    })
    .map(({ _gemaakt, ...blok }) => blok);
}

/** Hoeveel onpubliceerde wijzigingen staan er in de vrije zone? */
export async function telVrijeConcepten(pageKey: string): Promise<number> {
  const blokken = await haalVrijeBlokkenVoorEditor(pageKey);
  return blokken.filter((blok) => blok.heeftConcept).length;
}

/**
 * De concepten van de vrije blokken publiceren.
 *
 * Wordt aangeroepen door dezelfde knop die de vaste blokken publiceert.
 * Blokken die zijn gemarkeerd als verwijderd gaan er nu echt uit; de rest
 * krijgt zijn conceptwaarden als echte waarden.
 */
export async function publiceerVrijeBlokken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pageKey: string,
): Promise<number> {
  const { data: rijen } = await supabase
    .from("pagina_blokken")
    .select(
      "id, volgorde, zichtbaar, inhoud, concept_inhoud, concept_volgorde, concept_zichtbaar, concept_verwijderd, created_at",
    )
    .eq("page_key", pageKey);

  if (!rijen || rijen.length === 0) return 0;

  const teVerwijderen = rijen.filter((rij) => rij.concept_verwijderd);
  const blijvers = rijen
    .filter((rij) => !rij.concept_verwijderd)
    .sort((a, b) => {
      const va = a.concept_volgorde ?? a.volgorde;
      const vb = b.concept_volgorde ?? b.volgorde;
      if (va !== null && vb !== null) return va - vb;
      if (va !== null) return -1;
      if (vb !== null) return 1;
      return a.created_at.localeCompare(b.created_at);
    });

  let gewijzigd = 0;

  for (const rij of teVerwijderen) {
    await supabase.from("pagina_blokken").delete().eq("id", rij.id);
    gewijzigd += 1;
  }

  for (const [positie, rij] of blijvers.entries()) {
    const nieuweVolgorde = positie + 1;
    const hadIets =
      rij.concept_inhoud !== null ||
      rij.concept_volgorde !== null ||
      rij.concept_zichtbaar !== null ||
      rij.volgorde !== nieuweVolgorde;

    if (!hadIets) continue;

    await supabase
      .from("pagina_blokken")
      .update({
        inhoud: rij.concept_inhoud ?? rij.inhoud,
        volgorde: nieuweVolgorde,
        zichtbaar: rij.concept_zichtbaar ?? rij.zichtbaar,
        concept_inhoud: null,
        concept_volgorde: null,
        concept_zichtbaar: null,
      })
      .eq("id", rij.id);

    gewijzigd += 1;
  }

  return gewijzigd;
}
