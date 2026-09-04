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
 * Bewust niet overal. De juridische pagina's en het contactformulier hebben een
 * vaste vorm waar niets onder hoort, en op een pagina die je zelden opent is
 * een lege bloklijst alleen maar ruis.
 */
export const PAGINAS_MET_VRIJE_BLOKKEN = [
  "home",
  "bedrijfsyoga",
  "sportclubs",
  "onderwijs",
  "over-ons",
  "portfolio",
  "opleidingen",
  "trainingen",
  "lessen",
] as const;

export function heeftVrijeBlokken(pageKey: string): boolean {
  return (PAGINAS_MET_VRIJE_BLOKKEN as readonly string[]).includes(pageKey);
}

/** Hoeveel blokken er maximaal onder een pagina mogen. */
export const MAX_VRIJE_BLOKKEN = 12;
