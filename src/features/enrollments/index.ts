/**
 * Publieke ingang van de enrollments-feature (BOUWPROMPT §4).
 */
export {
  startInschrijving,
  type InschrijfResultaat,
} from "./server/inschrijven";

export {
  markeerHandmatigBetaald,
  maakBetaallink,
  type AdminResultaat,
} from "./server/admin-acties";

export { geeftToegang, TOEGANG_STATUSSEN } from "./entitlement";
