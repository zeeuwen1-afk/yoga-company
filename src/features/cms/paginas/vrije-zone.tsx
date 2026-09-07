import { haalVrijeBlokken } from "../server/vrije-blokken";
import { VrijeBlokken } from "./vrije-blokken-inhoud";

/**
 * De blokken die de beheerder zelf onder een pagina of onder één sectie heeft
 * gezet.
 *
 * Haalt zijn eigen blokken op, zodat een pagina er één regel voor nodig heeft
 * en niet ook nog een query en een prop. Staat er niets, dan rendert hij niets
 * en zie je er dus ook geen ruimte van.
 *
 * Zonder `sectie` toont hij de blokken die onderaan de pagina horen. Mét
 * `sectie` alleen die van die ene sectie, en dan staat dit component direct
 * onder de sectie in kwestie.
 */
export async function VrijeZone({
  pageKey,
  sectie,
  concept = false,
}: {
  pageKey: string;
  /** Leeg is onderaan de pagina. */
  sectie?: string;
  /** In de voorvertoning tellen ook de nog niet gepubliceerde blokken mee. */
  concept?: boolean;
}) {
  const alle = await haalVrijeBlokken(pageKey, { concept });
  const blokken = alle.filter((blok) => (blok.sectie ?? undefined) === sectie);

  return <VrijeBlokken blokken={blokken} />;
}
