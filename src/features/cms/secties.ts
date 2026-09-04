/**
 * De blokken van een pagina gegroepeerd in secties.
 *
 * De startpagina heeft negenendertig blokken. Die stonden onder elkaar in één
 * kolom, zonder kopjes ertussen, en dat maakt het terugvinden van "die ene
 * knoptekst" een zoekklus in plaats van een handeling.
 *
 * De indeling hoefde niet bedacht te worden: hij zat al in de namen. Blokken
 * die bij elkaar horen delen hun voorvoegsel — `hero_titel`, `hero_subtitel`,
 * `hero_knop` — en ze staan al in de goede volgorde, want die volgorde bepaalt
 * ook hoe de pagina wordt opgebouwd. Deze functie maakt dat zichtbaar.
 *
 * Wat hier bewust níét gebeurt: een handmatige lijst bijhouden van welk blok
 * bij welke sectie hoort. Dat zou 152 regels zijn die verouderen zodra iemand
 * een blok toevoegt. Nu volgt de indeling vanzelf uit de naam.
 */

/**
 * Blokken die samen de kop van een pagina vormen. Die delen geen voorvoegsel
 * — het zijn gewoon `titel`, `inleiding`, `beeld` — maar ze horen wel bij
 * elkaar, en ze staan altijd vooraan.
 */
const OPENING = new Set([
  "label",
  "bovenkop",
  "titel",
  "naam",
  "rol",
  "subtitel",
  "intro",
  "inleiding",
  "knop",
  "knop_link",
  "beeld",
  "foto",
  "portret",
  "kenmerken",
  "locatie",
]);

/**
 * Hoe een sectie heet in het scherm. Staat een voorvoegsel er niet bij, dan
 * wordt de naam uit het voorvoegsel zelf gemaakt; dat is meestal al leesbaar.
 */
const SECTIENAMEN: Record<string, string> = {
  opening: "Bovenaan de pagina",
  banner: "Promotiebanner",
  hero: "Hero, het eerste scherm",
  deuren: "De drie ingangen",
  rooster: "Eerstvolgende lessen",
  waarom: "Waarom YogaCompany",
  aanbod: "Opleidingen en trainingen",
  testimonials: "Ervaringen",
  inlog: "Voor leden en docenten",
  organisaties: "Voor organisaties",
  cta: "Oproep onderaan",
  verhaal: "Het verhaal",
  doelgroepen: "Voor wie",
  vormen: "Vormen en tarieven",
  praktisch: "Praktisch",
  fiscaal: "Fiscaal",
  ervaring: "Ervaring",
  opleiding: "Opleidingen",
  opleidingen: "Opleidingen",
  specialisaties: "Specialisaties",
  lesplekken: "Waar ik lesgeef",
  workshops: "Workshops",
  prive: "Privéyoga",
  voorwaarden: "Afspraken",
  docenten: "Docenten",
  partners: "Partners",
  bedrijfsgegevens: "Bedrijfsgegevens",
  gegevens: "Gegevens",
  over: "Over YogaCompany",
  kern: "De kern",
  uitleg: "Uitleg",
};

export type Sectie<T> = {
  /** Stabiel, en tevens het haakje waarop de voorvertoning aanwijst. */
  sleutel: string;
  naam: string;
  blokken: T[];
};

function voorvoegsel(blockKey: string): string {
  return blockKey.split("_")[0] ?? blockKey;
}

function naamVan(sleutel: string): string {
  const bekend = SECTIENAMEN[sleutel];
  if (bekend) return bekend;
  return sleutel.charAt(0).toUpperCase() + sleutel.slice(1).replace(/_/g, " ");
}

/**
 * Groepeert blokken op hun voorvoegsel, in de volgorde waarin ze staan.
 *
 * Aaneengesloten blokken met hetzelfde voorvoegsel vormen één sectie. De
 * blokken helemaal vooraan die bij de kop van de pagina horen worden samen
 * "Bovenaan de pagina"; zonder die uitzondering zou een pagina beginnen met
 * vier secties van één blok.
 */
export function groepeerInSecties<T extends { blockKey: string }>(
  blokken: T[],
): Sectie<T>[] {
  const secties: Sectie<T>[] = [];
  let inOpening = true;

  for (const blok of blokken) {
    const sleutel =
      inOpening && OPENING.has(blok.blockKey)
        ? "opening"
        : voorvoegsel(blok.blockKey);

    if (sleutel !== "opening") inOpening = false;

    const laatste = secties[secties.length - 1];
    if (laatste && laatste.sleutel === sleutel) {
      laatste.blokken.push(blok);
    } else {
      secties.push({ sleutel, naam: naamVan(sleutel), blokken: [blok] });
    }
  }

  return secties;
}

/**
 * Bij welke sectie hoort dit blok? Nodig om vanuit de voorvertoning naar de
 * juiste plek te kunnen springen.
 */
export function sectieVan(blockKey: string, eersteVanPagina = false): string {
  if (eersteVanPagina && OPENING.has(blockKey)) return "opening";
  return voorvoegsel(blockKey);
}
