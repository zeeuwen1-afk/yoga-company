import { Menubalk } from "@/components/layout/menubalk";
import { bouwMenu, VASTE_BALK } from "@/content/menubalk";
import { haalPagina, type Pagina } from "@/features/cms";

/**
 * De menubalk, gevuld met wat de beheerder in de site-editor heeft ingesteld.
 *
 * De balk zelf is een clientcomponent en kan dus niet zelf in de database
 * kijken; dit is het schilletje eromheen dat dat wel doet. Dezelfde opzet als
 * de paginavoet, inclusief de mogelijkheid om de inhoud mee te geven — zo laat
 * de voorvertoning ook het concept van het menu zien.
 *
 * Komt daar geen bruikbare lijst uit, dan toont de site de vaste balk uit de
 * code. Dat is het vangnet: een lege lijst, een storing bij de database of
 * regels waar geen werkend adres in staat leveren nooit een site op waarin je
 * nergens meer heen kunt.
 */
export async function SiteHeader({
  pagina: gegeven,
}: { pagina?: Pagina } = {}) {
  const pagina = gegeven ?? (await haalPagina("menubalk"));
  const ingesteld = bouwMenu(pagina.lijst("ingangen"));

  return <Menubalk items={ingesteld.length > 0 ? ingesteld : VASTE_BALK} />;
}
