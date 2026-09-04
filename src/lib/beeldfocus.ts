/**
 * Het punt van een foto dat in beeld moet blijven.
 *
 * Wordt bij het blok opgeslagen als een gewone CSS-waarde, bijvoorbeeld
 * `"50% 30%"`, zodat hij zonder omrekenen in `object-position` kan. Ontbreekt
 * hij, dan blijft alles staan zoals het altijd stond: bijgesneden vanuit het
 * midden.
 *
 * De waarde komt uit de database en belandt in een stijl-attribuut. Daarom
 * wordt hij hier gecontroleerd in plaats van vertrouwd: alleen twee
 * percentages, en anders het midden. Zo kan een handmatig bewerkt blok geen
 * losse CSS de pagina in dragen.
 */

export const MIDDEN = "50% 50%";

const PATROON = /^(\d{1,3})% (\d{1,3})%$/;

/** Leest een opgeslagen focuswaarde uit als twee percentages. */
export function leesFocus(waarde: string | undefined | null): {
  x: number;
  y: number;
} {
  const gevonden = typeof waarde === "string" ? PATROON.exec(waarde) : null;
  if (!gevonden) return { x: 50, y: 50 };

  const x = Number(gevonden[1]);
  const y = Number(gevonden[2]);
  if (x > 100 || y > 100) return { x: 50, y: 50 };

  return { x, y };
}

/**
 * De waarde zoals hij in `object-position` mag. Geeft altijd iets bruikbaars
 * terug, ook bij onzin in de database.
 */
export function focusStijl(waarde: string | undefined | null): string {
  const { x, y } = leesFocus(waarde);
  return `${x}% ${y}%`;
}
