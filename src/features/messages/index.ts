/**
 * Publieke ingang van de messages-feature (BOUWPROMPT §4).
 */
export {
  haalGesprek,
  haalOngelezenAantal,
  type Bericht,
} from "./server/queries";
export {
  verstuurBericht,
  markeerBerichtenGelezen,
  type BerichtResultaat,
} from "./server/acties";
