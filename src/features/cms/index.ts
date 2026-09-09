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
