/**
 * Welke blokken een bestemming van een knop bevatten.
 *
 * Deze regel staat apart omdat hij op twee plekken nodig is: de server bepaalt
 * ermee welk blok een standaardadres meekrijgt, en het bewerkscherm bepaalt
 * ermee welk invoerveld je krijgt. Twee keer dezelfde lijst zou na de eerste
 * nieuwe knop uit elkaar lopen.
 *
 * De afspraak: een blok dat op `_link` eindigt is de bestemming van de knop
 * ernaast. Binnen een lijst heten die velden `href` of `website`.
 */
export function isLinkBlok(blockKey: string): boolean {
  return /(^|_)link(_[a-z]+)?$/.test(blockKey);
}

/** Hetzelfde, maar dan voor een veld binnen een lijstblok. */
export function isLinkVeld(veld: string): boolean {
  return veld === "href" || veld === "website" || veld === "link";
}
