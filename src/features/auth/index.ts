/**
 * Publieke ingang van de auth-feature. Andere features en pagina's importeren
 * uitsluitend hiervandaan (BOUWPROMPT §4).
 */
export {
  inlogSchema,
  registratieSchema,
  wachtwoordHerstellenSchema,
  wachtwoordVergetenSchema,
  totpVerificatieSchema,
  MINIMALE_WACHTWOORDLENGTE,
  type InlogInvoer,
  type RegistratieInvoer,
} from "./schemas";

export {
  inloggen,
  registreren,
  uitloggen,
  wachtwoordVergeten,
  wachtwoordHerstellen,
  totpAanmelden,
  totpVerifieren,
  totpUitschakelen,
  type ActieResultaat,
} from "./server/actions";
