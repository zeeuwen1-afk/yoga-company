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
