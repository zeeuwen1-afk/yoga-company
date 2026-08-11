/**
 * Publieke ingang van de mailing-feature voor de openbare site (BOUWPROMPT §4).
 *
 * De gewone `index.ts` exporteert ook het beheerscherm, en dat trekt de
 * richtext-editor mee. De afmeldpagina is een openbare pagina die door mensen
 * op hun telefoon wordt geopend vanuit een mail; die hoeft geen editor van een
 * paar honderd kilobyte te downloaden om één knop te tonen.
 */
export { AfmeldFormulier } from "./components/afmeld-formulier";
