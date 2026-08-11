/**
 * Publieke ingang van de progress-feature (BOUWPROMPT §4).
 */
export {
  haalVoortgang,
  haalLaatstBekeken,
  haalCursusVoortgang,
  heeftToegangTotContent,
  type ItemVoortgang,
  type CursusVoortgang,
} from "./server/queries";

export { slaPositieOp, markeerAfgerond } from "./server/acties";
