/**
 * De bestemming van een knop, zoals hij in de site-editor mag worden ingevuld.
 *
 * Een link uit het CMS komt in een `href` terecht, en dat is een plek waar je
 * niet alles wilt toelaten. Een adres dat met `javascript:` begint voert code
 * uit zodra iemand erop klikt; dat is precies het soort ding dat je niet via een
 * tekstveld de pagina in wilt laten wandelen, ook niet vanuit een beheerscherm.
 *
 * Toegestaan is dus alleen wat een knop redelijkerwijs nodig heeft:
 *
 *   /lessen                een pagina op deze site
 *   /bedrijfsyoga#aanvraag een sectie op een pagina
 *   #aanvraag              een sectie op dezelfde pagina
 *   https://…              een andere website
 *   mailto: / tel:         mailen of bellen
 *
 * Alles daarbuiten valt terug op het adres dat in de code staat. De knop blijft
 * dan werken zoals hij deed, in plaats van dood of gevaarlijk te zijn. Een typfout
 * in de editor mag nooit een pagina onbruikbaar maken.
 */

const TOEGESTAAN =
  /^(\/[^\s]*|#[^\s]+|https:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/;

export function veiligeLink(
  waarde: string | undefined | null,
  terugval: string,
): string {
  const opgeschoond = waarde?.trim() ?? "";
  if (!opgeschoond) return terugval;
  return TOEGESTAAN.test(opgeschoond) ? opgeschoond : terugval;
}

/** Wijst deze link naar een andere website? Die opent in een nieuw tabblad. */
export function isExtern(link: string): boolean {
  return /^(https:\/\/|mailto:|tel:)/.test(link.trim());
}
