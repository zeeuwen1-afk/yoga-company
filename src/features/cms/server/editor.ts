import "server-only";

import { BLOKKEN, type BlokSeed } from "@/content/blokken";
import { isLinkBlok } from "../link-blok";
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
  /** Mag dit blok van de pagina worden weggenomen? */
  verbergbaar: boolean;
  /**
   * Alleen bij een lijstblok: hoeveel items erin mogen, hoe één item heet, en
   * met welke velden een nieuw item begint. Dat sjabloon komt uit de code en
   * niet uit de bestaande items: haalt iemand ze allemaal weg, dan moet er nog
   * steeds een nieuwe toegevoegd kunnen worden.
   */
  lijst: {
    max: number;
    itemNaam: string;
    sjabloon: Record<string, string>;
  } | null;
  /**
   * Alleen bij een linkveld: waar de knop heen gaat zolang het veld leeg is.
   * Dat is het adres uit de startinhoud, want dat is ook wat de pagina als
   * terugval gebruikt. De editor kan zo tonen wat er gebeurt bij een leeg veld
   * in plaats van dat de beheerder het moet raden.
   */
  standaardLink: string | null;
  /** Staat het blok nu online? */
  zichtbaar: boolean;
  /** Wat de schakelaar wordt na publiceren. */
  zichtbaarNaPubliceren: boolean;
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
  bedrijfsyoga: { titel: "Bedrijfsyoga", pad: "/bedrijfsyoga" },
  sportclubs: { titel: "Sportclubs", pad: "/sportclubs" },
  onderwijs: { titel: "Onderwijs", pad: "/onderwijs" },
  portfolio: { titel: "Portfolio", pad: "/portfolio" },
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
    .select(
      "page_key, block_key, value, draft_value, zichtbaar, draft_zichtbaar",
    );

  const opgeslagen = new Map(
    (data ?? []).map((rij) => [`${rij.page_key}:${rij.block_key}`, rij]),
  );

  const paginaKeys = [...new Set(BLOKKEN.map((blok) => blok.page_key))];

  return paginaKeys.map((pageKey) => {
    const naam = paginaNaam(pageKey);

    const blokken = definitiesVan(pageKey).map((definitie): BewerkbaarBlok => {
      const rij = opgeslagen.get(`${pageKey}:${definitie.block_key}`);
      const zichtbaar = rij?.zichtbaar ?? true;
      const eersteItem =
        "items" in definitie.value ? definitie.value.items[0] : undefined;
      const zichtbaarNaPubliceren = rij?.draft_zichtbaar ?? zichtbaar;
      return {
        pageKey,
        blockKey: definitie.block_key,
        kind: definitie.kind,
        omschrijving: definitie.omschrijving,
        gepubliceerd: (rij?.value ?? definitie.value) as Json,
        concept: (rij?.draft_value ?? null) as Json | null,
        // Een omgezette schakelaar is óók een concept: hij telt mee in de
        // teller en verdwijnt pas bij publiceren.
        heeftConcept:
          rij?.draft_value != null || zichtbaarNaPubliceren !== zichtbaar,
        verbergbaar: definitie.verbergbaar === true,
        lijst:
          definitie.lijst && eersteItem
            ? {
                max: definitie.lijst.max,
                itemNaam: definitie.lijst.itemNaam,
                sjabloon: Object.fromEntries(
                  Object.keys(eersteItem).map((veld) => [veld, ""]),
                ),
              }
            : null,
        standaardLink:
          isLinkBlok(definitie.block_key) && "text" in definitie.value
            ? definitie.value.text
            : null,
        zichtbaar,
        zichtbaarNaPubliceren,
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
    .or("draft_value.not.is.null,draft_zichtbaar.not.is.null");

  return count ?? 0;
}
