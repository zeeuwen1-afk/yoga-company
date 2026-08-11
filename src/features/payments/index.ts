/**
 * Publieke ingang van de payments-feature (BOUWPROMPT §4).
 */
export {
  maakCheckoutSessie,
  enrollmentIdBijPaymentIntent,
  type CheckoutInvoer,
} from "./server/checkout";

export { verwerkGebeurtenis, type WebhookUitkomst } from "./server/webhook";
export { verstuurInschrijfbevestiging } from "./server/bevestiging";
