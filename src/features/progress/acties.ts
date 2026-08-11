/**
 * Client-veilige ingang van de progress-feature (BOUWPROMPT §4).
 *
 * `index.ts` exporteert ook de queries, en die zijn `server-only`. Een client
 * component die daaruit zou importeren, sleept die servercode mee in de
 * browserbundel — wat Next terecht weigert.
 *
 * Dit bestand exporteert uitsluitend de server actions. Die zijn met
 * `"use server"` gemarkeerd en worden door Next omgezet naar een aanroep over
 * het netwerk; er komt dus geen servercode in de browser terecht.
 */
export { slaPositieOp, markeerAfgerond } from "./server/acties";
