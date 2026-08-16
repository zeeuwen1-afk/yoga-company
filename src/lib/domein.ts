/**
 * Draait deze uitrol op het echte domein, of op een proefadres?
 *
 * Zolang de site op een adres van Vercel staat mag hij niet in Google komen.
 * Anders staat straks `yoga-company.vercel.app` naast `yogacompany.eu` in de
 * index, concurreren die twee met elkaar om dezelfde teksten, en duurt het
 * weken om dat weer recht te zetten.
 *
 * De vraag "is dit het echte adres" wordt op twee plekken gesteld — in
 * `next.config.ts` voor de header, en in de tests — en staat daarom hier, en
 * niet twee keer half. Zodra `NEXT_PUBLIC_SITE_URL` op het eigen domein wordt
 * gezet (stap F1 van de livegang), gaat de blokkade vanzelf weer uit; er hoeft
 * dan niemand aan te denken.
 *
 * Dit bestand wordt ook door `next.config.ts` ingelezen en mag daarom niets
 * importeren — geen zod, geen `server-only`, niets uit `@/`.
 */

/** Het adres waarop de echte site komt te staan. */
export const PRODUCTIEDOMEIN = "yogacompany.eu";

export function isProductiedomein(siteUrl: string | undefined): boolean {
  if (!siteUrl) return false;

  try {
    const host = new URL(siteUrl).hostname.toLowerCase();
    return host === PRODUCTIEDOMEIN || host === `www.${PRODUCTIEDOMEIN}`;
  } catch {
    // Een onleesbaar adres is geen productieadres. Bij twijfel niet indexeren:
    // een pagina die ten onrechte uit Google blijft is te herstellen, een
    // proefadres dat er ten onrechte in staat veel moeilijker.
    return false;
  }
}
