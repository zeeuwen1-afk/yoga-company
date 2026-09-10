/**
 * Publieke ingang van de courses-feature (BOUWPROMPT §4).
 */
export {
  haalAanbod,
  haalCursus,
  haalSlugs,
  type Cursus,
} from "./server/queries";

export { formateerPrijs } from "./prijs";

export { CursusKaart, CursusRooster } from "./components/cursus-kaart";

/** De certificaatbadge van de Academy; ook de cms-pagina's tonen hem. */
export { AcademyBadge } from "./components/academy-badge";
