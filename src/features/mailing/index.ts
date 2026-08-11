/**
 * Publieke ingang van de mailing-feature (BOUWPROMPT §4).
 */
export {
  haalMailings,
  telOntvangers,
  type MailingOverzicht,
} from "./server/queries";

export {
  afmeldUrl,
  maakAfmeldToken,
  leesAfmeldToken,
  afmeldsecretIngericht,
} from "./server/afmelden";

export { MailingWerkblad } from "./components/mailing-werkblad";
export { MailingActies } from "./components/mailing-acties";

// De afmeldpagina hoort bij de openbare site en heeft een eigen, lichtere
// ingang: zie `publiek.ts`.
