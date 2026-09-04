import { haalVrijeBlokken } from "../server/vrije-blokken";
import { VrijeBlokken } from "./vrije-blokken-inhoud";

/**
 * De vrije zone onder aan een pagina.
 *
 * Haalt zijn eigen blokken op, zodat een pagina er één regel voor nodig heeft
 * en niet ook nog een query en een prop. Staat er niets, dan rendert hij niets
 * en zie je er dus ook geen ruimte van.
 */
export async function VrijeZone({
  pageKey,
  concept = false,
}: {
  pageKey: string;
  /** In de voorvertoning tellen ook de nog niet gepubliceerde blokken mee. */
  concept?: boolean;
}) {
  const blokken = await haalVrijeBlokken(pageKey, { concept });
  return <VrijeBlokken blokken={blokken} />;
}
