/**
 * Waar een foto staat ten opzichte van de tekst ernaast.
 *
 * Tot nu toe stond elke sfeerfoto als een brede band boven het verhaal. Dat
 * werkt voor een openingsbeeld, maar niet voor een portret of een foto die bij
 * een specifiek stuk tekst hoort: dan wil je hem ernaast.
 *
 * Vier keuzes, geen raster met kolommen. Dit is wat er in de praktijk nodig is
 * en het is op een telefoon nog te bedienen; een vrije indeling levert vooral
 * de mogelijkheid op om je eigen pagina scheef te trekken.
 */

export const LAYOUTS = ["breed", "links", "rechts", "onder"] as const;

export type BeeldLayout = (typeof LAYOUTS)[number];

/** Wat het betekent, in het bewerkscherm. */
export const LAYOUT_LABEL: Record<BeeldLayout, string> = {
  breed: "Over de volle breedte",
  links: "Foto links, tekst rechts",
  rechts: "Tekst links, foto rechts",
  onder: "Onder de tekst, volle breedte",
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
