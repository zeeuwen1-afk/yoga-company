import "server-only";

import { BLOKKEN, type BlokSeed } from "@/content/blokken";
import { EIGEN_PAGINA } from "@/content/aanbod";
import { cursusSleutel } from "@/content/vrije-blokken";
import { haalAanbod } from "@/features/courses";
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
  /** Ligt de plek van dit beeld vast, zodat een layoutkeuze niets zou doen? */
  vastBeeld: boolean;
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
  // Eén set teksten voor alle opleidings- en trainingspagina's. Het pad wijst
  // naar het overzicht; welke cursus je erbij pakt maakt niet uit.
  cursus: {
    titel: "Cursuspagina's · vaste teksten",
    pad: "/opleidingen",
  },
  yogaopleiding: {
    titel: "200-uurs Yogaopleiding",
    pad: "/opleidingen/200-uurs-yogaopleiding",
  },
  // Staat op alle vijf de opleidingspagina's. Het pad wijst naar de
  // overzichtspagina, want daar zie je het effect van een wijziging het snelst.
  "yogaopleiding-gedeeld": {
    titel: "Yogaopleiding · prijzen en praktisch",
    pad: "/opleidingen/200-uurs-yogaopleiding",
  },
  "yogaopleiding-module-1": {
    titel: "Yogaopleiding · module 1 Hatha & Vinyasa",
    pad: "/opleidingen/200-uurs-yogaopleiding/module-1-hatha-vinyasa",
  },
  "yogaopleiding-module-2": {
    titel: "Yogaopleiding · module 2 Anatomie, Filosofie & Meditatie",
    pad: "/opleidingen/200-uurs-yogaopleiding/module-2-anatomie-filosofie-meditatie",
  },
  "yogaopleiding-module-3": {
    titel: "Yogaopleiding · module 3 Yin Yoga & het lichaam",
    pad: "/opleidingen/200-uurs-yogaopleiding/module-3-yin-yoga-het-lichaam",
  },
  "yogaopleiding-module-4": {
    titel: "Yogaopleiding · module 4 Zenuwstelsel & basis meridianen",
    pad: "/opleidingen/200-uurs-yogaopleiding/module-4-zenuwstelsel-meridianen",
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
  const vrijeConcepten = await telVrijeConceptenPerPagina(supabase);

  const vast = paginaKeys.map((pageKey) => {
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
        vastBeeld: definitie.vastBeeld === true,
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
      aantalConcepten:
        blokken.filter((blok) => blok.heeftConcept).length +
        (vrijeConcepten.get(pageKey) ?? 0),
    };
  });

  return [...vast, ...(await cursusPaginas(vrijeConcepten))];
}

/**
 * Hoeveel onpubliceerde eigen blokken er per pagina staan.
 *
 * Deze telden niet mee, en dat was geen schoonheidsfoutje: de publiceerbalk
 * verdwijnt bij nul wijzigingen. Wie alleen een foto bij een sectie zette, zag
 * dus nergens een knop om hem online te krijgen, en de wijziging bleef staan
 * waar niemand hem zag.
 *
 * Eén query voor alle pagina's tegelijk: het overzicht toont ze allemaal, en
 * drieëntwintig losse tellingen zouden dat scherm traag maken voor een getal.
 */
async function telVrijeConceptenPerPagina(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Map<string, number>> {
  const telling = new Map<string, number>();

  const { data } = await supabase
    .from("pagina_blokken")
    .select(
      "page_key, volgorde, concept_inhoud, concept_volgorde, concept_zichtbaar, concept_verwijderd",
    );

  for (const rij of data ?? []) {
    // Dezelfde regel als `haalVrijeBlokkenVoorEditor`: een blok zonder
    // volgorde is nieuw en dus nog niet gepubliceerd.
    const heeftConcept =
      rij.concept_inhoud !== null ||
      rij.concept_volgorde !== null ||
      rij.concept_zichtbaar !== null ||
      rij.concept_verwijderd ||
      rij.volgorde === null;

    if (!heeftConcept) continue;
    telling.set(rij.page_key, (telling.get(rij.page_key) ?? 0) + 1);
  }

  return telling;
}

/**
 * Elke opleiding en training als eigen pagina in de editor.
 *
 * Die pagina's hebben geen vaste blokken: hun titel, verhaal, prijs en
 * curriculum komen uit het aanbod en worden bij Aanbod bewerkt, en de woorden
 * eromheen staan één keer onder "Cursuspagina's · vaste teksten". Wat er nog
 * niet was, is de ruimte om er per cursus iets eigens onder te zetten — een
 * foto, een stuk tekst, een foto met de tekst eroverheen. Dat is precies wat de
 * vrije zone doet, en die heeft een pagina in de editor nodig om aan te hangen.
 *
 * De 200-uurs Yogaopleiding staat er niet bij: die heeft een eigen pagina met
 * eigen blokken, en zou hier een tweede ingang krijgen naar iets dat niet
 * getoond wordt.
 *
 * Valt het aanbod niet op te halen, dan blijft de lijst leeg. De rest van de
 * editor hoort niet om te vallen omdat één query mislukt.
 */
async function cursusPaginas(
  vrijeConcepten: Map<string, number>,
): Promise<EditorPagina[]> {
  let cursussen: Awaited<ReturnType<typeof haalAanbod>>;
  try {
    cursussen = await haalAanbod();
  } catch {
    return [];
  }

  return cursussen
    .filter((cursus) => !(cursus.slug in EIGEN_PAGINA))
    .map((cursus) => ({
      pageKey: cursusSleutel(cursus.slug),
      titel: `${cursus.type === "opleiding" ? "Opleiding" : "Training"} · ${cursus.titel}`,
      pad: `/${cursus.type === "opleiding" ? "opleidingen" : "trainingen"}/${cursus.slug}`,
      blokken: [],
      aantalConcepten: vrijeConcepten.get(cursusSleutel(cursus.slug)) ?? 0,
    }));
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
