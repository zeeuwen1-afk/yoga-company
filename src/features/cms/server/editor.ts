import "server-only";

import { BLOKKEN, type BlokSeed } from "@/content/blokken";
import { createClient } from "@/lib/supabase/server";
import type { BlockKind, Json } from "@/lib/supabase/types";

/**
 * De site-editor (BOUWPROMPT §14).
 *
 * De structuur van elke pagina ligt vast in code; alleen de inhoud van de
 * blokken is bewerkbaar. Welke blokken er zijn, staat daarom in
 * `src/content/blokken.ts` — dat is tegelijk de startinhoud én de lijst met
 * wat een beheerder mag aanpassen. Een blok toevoegen dat de pagina niet toont
 * is zo onmogelijk.
 */

export type BewerkbaarBlok = {
  pageKey: string;
  blockKey: string;
  kind: BlockKind;
  omschrijving: string;
  /** Wat er nu online staat. */
  gepubliceerd: Json;
  /** Het concept, of null wanneer er geen concept is. */
  concept: Json | null;
  heeftConcept: boolean;
};

export type EditorPagina = {
  pageKey: string;
  titel: string;
  pad: string;
  blokken: BewerkbaarBlok[];
  aantalConcepten: number;
};

/** De pagina's die via de editor te bewerken zijn, met een leesbare naam. */
const PAGINA_NAMEN: Record<string, { titel: string; pad: string }> = {
  home: { titel: "Startpagina", pad: "/" },
  opleidingen: { titel: "Opleidingen", pad: "/opleidingen" },
  trainingen: { titel: "Trainingen", pad: "/trainingen" },
  lessen: { titel: "Lessen", pad: "/lessen" },
  "over-ons": { titel: "Over ons", pad: "/over-ons" },
  contact: { titel: "Contact", pad: "/contact" },
  footer: { titel: "Paginavoet", pad: "/" },
  privacyverklaring: {
    titel: "Privacyverklaring",
    pad: "/privacyverklaring",
  },
  "algemene-voorwaarden": {
    titel: "Algemene voorwaarden",
    pad: "/algemene-voorwaarden",
  },
  cookies: { titel: "Cookies", pad: "/cookies" },
  veiligheid: { titel: "Veiligheid en privacy", pad: "/veiligheid" },
  tarieven: { titel: "Tarieven", pad: "/lessen/tarieven" },
  "voor-yogadocenten": {
    titel: "Voor yogadocenten",
    pad: "/voor-yogadocenten",
  },
};

export function paginaNaam(pageKey: string) {
  return PAGINA_NAMEN[pageKey] ?? { titel: pageKey, pad: "/" };
}

function definitiesVan(pageKey: string): BlokSeed[] {
  return BLOKKEN.filter((blok) => blok.page_key === pageKey);
}

/** Alle bewerkbare pagina's, met het aantal openstaande concepten. */
export async function haalEditorPaginas(): Promise<EditorPagina[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("content_blocks")
    .select("page_key, block_key, value, draft_value");

  const opgeslagen = new Map(
    (data ?? []).map((rij) => [`${rij.page_key}:${rij.block_key}`, rij]),
  );

  const paginaKeys = [...new Set(BLOKKEN.map((blok) => blok.page_key))];

  return paginaKeys.map((pageKey) => {
    const naam = paginaNaam(pageKey);

    const blokken = definitiesVan(pageKey).map((definitie): BewerkbaarBlok => {
      const rij = opgeslagen.get(`${pageKey}:${definitie.block_key}`);
      return {
        pageKey,
        blockKey: definitie.block_key,
        kind: definitie.kind,
        omschrijving: definitie.omschrijving,
        gepubliceerd: (rij?.value ?? definitie.value) as Json,
        concept: (rij?.draft_value ?? null) as Json | null,
        heeftConcept: rij?.draft_value != null,
      };
    });

    return {
      pageKey,
      titel: naam.titel,
      pad: naam.pad,
      blokken,
      aantalConcepten: blokken.filter((blok) => blok.heeftConcept).length,
    };
  });
}

export async function haalEditorPagina(
  pageKey: string,
): Promise<EditorPagina | null> {
  const paginas = await haalEditorPaginas();
  return paginas.find((pagina) => pagina.pageKey === pageKey) ?? null;
}

/** Totaal aantal openstaande concepten, voor de melding in het beheer. */
export async function telConcepten(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("content_blocks")
    .select("page_key", { count: "exact", head: true })
    .not("draft_value", "is", null);

  return count ?? 0;
}
