/**
 * Krijgt een veld in het bewerkscherm een tekstvak of één regel?
 *
 * Deze keuze stond eerst in het bewerkscherm zelf, als een lijst van tien
 * woorden die "lopende tekst" betekenden: inleiding, subtitel, tekst,
 * voetnoot, kern, omschrijving, verhaal, antwoord, citaat, bio. Alles wat daar
 * niet in stond kreeg één regel, en in één regel kun je niet op enter drukken.
 *
 * Dat faalde de verkeerde kant op. `toelichting` stond er niet in, en dat is
 * precies het veld waarin een workshop van een hele dag wordt beschreven. Wie
 * daar alinea's in wilde zetten kon dat niet, en er was niets te zien dat
 * uitlegde waarom. Hetzelfde gold voor `kenmerken`, `prijs_voet`, `over` en
 * elk veld dat er later bij kwam: een nieuwe naam betekende standaard geen
 * ruimte.
 *
 * Daarom is de regel omgedraaid. Nu staat vast wat écht één regel is — een
 * titel, een knop, een bedrag, een datum — en krijgt al het andere een
 * tekstvak. Een veld te veel ruimte geven kost een beetje schermhoogte; te
 * weinig ruimte geven blokkeert de beheerder, en dat is het duurdere van de
 * twee.
 *
 * De naam bepaalt het, niet de lengte van wat er staat. Afgaan op de lengte
 * liet het veld van vorm wisselen terwijl je typte, precies op het moment dat
 * je over de grens ging, waardoor je je cursor kwijt was.
 */

/**
 * Het laatste woorddeel van een veldnaam dat één regel betekent.
 *
 * `hero_titel`, `cta_knop` en `prijzen_voet` worden gelezen als titel, knop en
 * voet; alleen dat laatste deel telt. Zo hoeft een nieuw blok met een bekende
 * uitgang hier niet bij, en krijgt een `prijs_voet` wél een vak terwijl een
 * `prijs` er geen nodig heeft.
 */
const EEN_REGEL = new Set([
  // Koppen en knoppen
  "titel",
  "kop",
  "bovenkop",
  "knop",
  "link",
  "label",
  // Namen en aanduidingen
  "naam",
  "rol",
  "school",
  "instituut",
  "nummer",
  "variant",
  "gebied",
  "opleiding",
  "training",
  "workshop",
  "kruimel",
  // Bedragen, maten en data
  "prijs",
  "kosten",
  "tarief",
  "registratie",
  "duur",
  "uren",
  "jaar",
  "periode",
  "wanneer",
  "waar",
  "les",
  "lesdata",
  "omvang",
  "studiebelasting",
  "groepsgrootte",
  "certificaat",
  "locatie",
  "waarde",
  "geldig",
  // Beeld en losse instellingen
  "beeld",
  "foto",
  "portret",
  "logo",
  "website",
  "kleur",
  "uitgelicht",
  "rail",
  // De drie keurmerkkolommen van de Academy
  "yaf",
  "yaa",
  "yap",
]);

/**
 * Velden die op hun laatste woorddeel niet te herkennen zijn, maar wel op één
 * regel horen. Klein houden: elke naam hier is een uitzondering die iemand
 * later moet begrijpen.
 */
const EEN_REGEL_PRECIES = new Set([
  // Staat achter het bedrag op een kaart: "€ 795 · of per module".
  "aanbod_per_module",
  // In de menubalk: onder welke ingang deze regel hangt. Dat is de titel van
  // een andere ingang, en dus nooit meer dan één regel.
  "onder",
]);

/** Is dit veld bedoeld voor één regel? */
export function isEenRegel(sleutel: string): boolean {
  if (EEN_REGEL_PRECIES.has(sleutel)) return true;
  const laatste = sleutel.split("_").pop() ?? sleutel;
  return EEN_REGEL.has(laatste);
}

/** Krijgt dit veld een tekstvak waarin je alinea's kunt maken? */
export function meerdereRegels(sleutel: string): boolean {
  return !isEenRegel(sleutel);
}
