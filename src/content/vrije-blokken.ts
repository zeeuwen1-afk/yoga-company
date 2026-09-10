/**
 * De blokken die je zelf onder aan een pagina kunt zetten.
 *
 * De secties die je site zijn gezicht geven — de hero, de drie ingangen, het
 * rooster — hebben elk hun eigen ontwerp en liggen vast. Wat er niet was, is
 * ruimte om er zelf iets onder te zetten. Dit is die ruimte, en dit zijn de
 * vormen die erin passen.
 *
 * Vijf, en niet vijftien. Elke vorm die erbij komt is er een die iemand moet
 * kunnen kiezen, begrijpen en op een telefoon moet kunnen bekijken. Een lijst
 * met vijftien opties is geen vrijheid maar een keuzestress met een
 * handleiding.
 */

export type VeldSoort = "regel" | "tekst" | "richtext" | "beeld" | "link";

export type Veld = {
  naam: string;
  label: string;
  soort: VeldSoort;
  /** Toelichting onder het veld, als het niet vanzelf spreekt. */
  hulp?: string;
};

export type Bloktype = {
  type: string;
  naam: string;
  /** Wat dit blok is, in het kiesmenu. */
  omschrijving: string;
  velden: Veld[];
};

export const BLOKTYPEN: Bloktype[] = [
  {
    type: "tekst",
    naam: "Tekstblok",
    omschrijving: "Een kop met een stuk tekst eronder.",
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "tekst", label: "Tekst", soort: "richtext" },
    ],
  },
  {
    type: "tekst_beeld",
    naam: "Tekst met foto",
    omschrijving:
      "Een stuk tekst met een foto ernaast of eronder. Waar de foto staat kies je bij de foto zelf.",
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "tekst", label: "Tekst", soort: "richtext" },
      { naam: "beeld", label: "Foto", soort: "beeld" },
    ],
  },
  {
    type: "beeld",
    naam: "Foto",
    omschrijving: "Eén foto over de breedte, met een bijschrift eronder.",
    velden: [
      { naam: "beeld", label: "Foto", soort: "beeld" },
      { naam: "bijschrift", label: "Bijschrift", soort: "regel" },
    ],
  },
  {
    type: "fotoreeks",
    naam: "Fotoreeks",
    omschrijving: "Drie foto's naast elkaar, met een kop erboven.",
    velden: [
      { naam: "kop", label: "Kop boven de reeks", soort: "regel" },
      { naam: "beeld_een", label: "Eerste foto", soort: "beeld" },
      { naam: "beeld_twee", label: "Tweede foto", soort: "beeld" },
      { naam: "beeld_drie", label: "Derde foto", soort: "beeld" },
    ],
  },
  {
    type: "oproep",
    naam: "Oproep met knop",
    omschrijving: "Een kop, een zin en een knop die ergens heen wijst.",
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "tekst", label: "Tekst", soort: "tekst" },
      { naam: "knop", label: "Tekst op de knop", soort: "regel" },
      { naam: "link", label: "Waar de knop heen gaat", soort: "link" },
    ],
  },
];

export function bloktype(type: string): Bloktype | undefined {
  return BLOKTYPEN.find((b) => b.type === type);
}

/**
 * Op welke pagina's mag je vrije blokken zetten?
 *
 * Bewust niet overal: de juridische pagina's blijven erbuiten. Een
 * privacyverklaring met een sfeerfoto leest niemand beter, en die pagina's zijn
 * er om gelezen te worden.
 */
export const PAGINAS_MET_VRIJE_BLOKKEN = [
  "home",
  "bedrijfsyoga",
  "sportclubs",
  "onderwijs",
  "over-ons",
  "portfolio",
  "opleidingen",
  "academy",
  "trainingen",
  "lessen",
  "tarieven",
  "contact",
  "veiligheid",
  "voor-yogadocenten",
  "yogaopleiding",
  "yogaopleiding-gedeeld",
  "yogaopleiding-module-1",
  "yogaopleiding-module-2",
  "yogaopleiding-module-3",
  "yogaopleiding-module-4",
] as const;

/**
 * De sleutel van de eigen zone onder één opleiding of training.
 *
 * Die pagina's staan niet in de lijst hierboven, want ze bestaan pas als er een
 * cursus is aangemaakt: hun inhoud komt uit het aanbod en niet uit een vaste
 * set blokken. Toch hoort er hetzelfde te kunnen als op elke andere pagina —
 * een foto erbij, een stuk tekst, een foto met de tekst eroverheen.
 *
 * Vandaar een sleutel per cursus. Twee streepjes als scheiding en geen dubbele
 * punt: `cursus:iets` wordt door een URL-parser als een eigen protocol gelezen,
 * en dat is precies het soort verrassing dat je in een adres niet wilt.
 */
export const CURSUS_VOORVOEGSEL = "cursus--";

export function cursusSleutel(slug: string): string {
  return `${CURSUS_VOORVOEGSEL}${slug}`;
}

/** De slug uit zo'n sleutel, of null als het er geen is. */
export function cursusSlug(pageKey: string): string | null {
  if (!pageKey.startsWith(CURSUS_VOORVOEGSEL)) return null;
  const slug = pageKey.slice(CURSUS_VOORVOEGSEL.length);
  return slug === "" ? null : slug;
}

export function heeftVrijeBlokken(pageKey: string): boolean {
  if (cursusSlug(pageKey) !== null) return true;
  return (PAGINAS_MET_VRIJE_BLOKKEN as readonly string[]).includes(pageKey);
}

/** Hoeveel blokken er maximaal onder een pagina mogen. */
export const MAX_VRIJE_BLOKKEN = 12;
