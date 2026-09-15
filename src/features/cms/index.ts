/**
 * Publieke ingang van de cms-feature (BOUWPROMPT §4).
 */
export {
  haalPagina,
  haalConceptPagina,
  bekendePaginas,
  kanVoorvertonen,
  type Pagina,
} from "./server/queries";

/**
 * De eigen blokken van de beheerder onder een pagina of sectie. Staat hier
 * omdat ook pagina's buiten deze feature — de cursuspagina's — ze tonen.
 */
export { VrijeZone } from "./paginas/vrije-zone";

/**
 * Aanmelden zonder account. Staat hier omdat ook de cursuspagina's buiten deze
 * feature het formulier tonen; zij mogen niet rechtstreeks in de componentenmap
 * van een andere feature graaien (BOUWPROMPT §4).
 */
export { AanmeldFormulier } from "./components/aanmeld-formulier";
