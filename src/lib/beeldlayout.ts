/**
 * Waar een foto staat ten opzichte van de tekst ernaast.
 *
 * Tot nu toe stond elke sfeerfoto als een brede band boven het verhaal. Dat
 * werkt voor een openingsbeeld, maar niet voor een portret of een foto die bij
 * een specifiek stuk tekst hoort: dan wil je hem ernaast.
 *
 * Vijf keuzes, geen raster met kolommen. Dit is wat er in de praktijk nodig is
 * en het is op een telefoon nog te bedienen; een vrije indeling levert vooral
 * de mogelijkheid op om je eigen pagina scheef te trekken.
 *
 * De vijfde, "achtergrond", zet de tekst op de foto zoals op de startpagina.
 * Daar hoort een waas bij; zie `WAASSTANDEN` onderaan voor waarom die niet
 * lichter te zetten is.
 */

export const LAYOUTS = [
  "breed",
  "links",
  "rechts",
  "onder",
  "achtergrond",
] as const;

export type BeeldLayout = (typeof LAYOUTS)[number];

/** Wat het betekent, in het bewerkscherm. */
export const LAYOUT_LABEL: Record<BeeldLayout, string> = {
  breed: "Over de volle breedte",
  links: "Foto links, tekst rechts",
  rechts: "Tekst links, foto rechts",
  onder: "Onder de tekst, volle breedte",
  achtergrond: "Tekst op de foto",
};

/**
 * Leest de opgeslagen waarde uit. Alles wat we niet kennen wordt "breed": dat
 * is hoe elke bestaande foto er nu staat, dus een blok van vóór deze functie
 * verandert niet van uiterlijk.
 */
export function leesLayout(waarde: string | undefined | null): BeeldLayout {
  const opgeschoond = waarde?.trim().toLowerCase() ?? "";
  return (LAYOUTS as readonly string[]).includes(opgeschoond)
    ? (opgeschoond as BeeldLayout)
    : "breed";
}

/** Staat de foto naast de tekst? Dan worden het samen één sectie. */
export function isNaastElkaar(layout: BeeldLayout): boolean {
  return layout === "links" || layout === "rechts";
}

/**
 * Hoe donker de waas over een achtergrondfoto ligt.
 *
 * Twee standen, en bewust geen schuifje. Bij het kiezen van een foto is niet te
 * zien wat het lichtste plekje achter de tekst wordt, en op een telefoon valt de
 * uitsnede weer anders. Een knop om de waas lichter te maken is dus een knop om
 * je eigen site onleesbaar te maken.
 *
 * De cijfers, gerekend met crèmewit op petrol over een spierwitte foto — het
 * slechtste geval dat er is, want elke donkerdere foto scoort beter:
 *
 *   65%  4,05 : 1   net te weinig
 *   75%  5,42 : 1   normaal
 *   88%  7,86 : 1   donkerder
 *
 * De grens voor leesbare tekst ligt op 4,5 : 1. Verlaag deze waarden niet
 * zonder opnieuw te rekenen.
 */
export const WAASSTANDEN = ["normaal", "donkerder"] as const;

export type Waas = (typeof WAASSTANDEN)[number];

export const WAAS_LABEL: Record<Waas, string> = {
  normaal: "Normaal",
  donkerder: "Donkerder, voor een onrustige foto",
};

export function leesWaas(waarde: string | undefined | null): Waas {
  return waarde?.trim().toLowerCase() === "donkerder" ? "donkerder" : "normaal";
}

/** Ligt de tekst op de foto? Dan wordt het blok donker en vult het beeld alles. */
export function isAchtergrond(layout: BeeldLayout): boolean {
  return layout === "achtergrond";
}

/**
 * Hoe breed de foto op de pagina staat.
 *
 * Los van de indeling: die bepaalt wáár hij staat, dit hoe groot. Vier maten en
 * geen schuifje in pixels, want een foto die de beheerder op 437 pixels zet
 * staat op elk ander scherm weer anders.
 *
 * Op een smal scherm staat een foto altijd over de volle breedte, wat hier ook
 * is gekozen. Kleiner dan dat wordt een postzegel waar niemand iets aan heeft.
 *
 * Bij "achtergrond" en bij een foto naast de tekst doet de maat niets: daar
 * bepaalt de sectie de breedte.
 */
export const MATEN = ["klein", "normaal", "groot", "vol"] as const;

export type Maat = (typeof MATEN)[number];

export const MAAT_LABEL: Record<Maat, string> = {
  klein: "Klein",
  normaal: "Normaal",
  groot: "Groot",
  vol: "Volle breedte",
};

export function leesMaat(waarde: string | undefined | null): Maat {
  const opgeschoond = waarde?.trim().toLowerCase() ?? "";
  return (MATEN as readonly string[]).includes(opgeschoond)
    ? (opgeschoond as Maat)
    : "normaal";
}

/**
 * De breedte als opmaakregel. Altijd gecentreerd, want een foto die smaller is
 * dan de tekst en links blijft plakken ziet eruit als een fout.
 */
export function maatKlasse(maat: Maat): string {
  if (maat === "klein") return "mx-auto max-w-md";
  if (maat === "normaal") return "mx-auto max-w-2xl";
  if (maat === "groot") return "mx-auto max-w-4xl";
  return "";
}

/** Heeft de maat effect bij deze indeling? */
export function maatTelt(layout: BeeldLayout): boolean {
  return layout === "breed" || layout === "onder";
}
