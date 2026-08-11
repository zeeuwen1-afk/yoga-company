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
