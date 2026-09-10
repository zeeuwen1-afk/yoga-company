import type { BlockKind } from "@/lib/supabase/types";

// Met extensie, zodat dit bestand ook rechtstreeks door Node te draaien is
// voor `pnpm db:generate-seed`.
import { JURIDISCHE_TEKSTEN } from "./juridisch.ts";
import {
  VEILIGHEID_INLEIDING,
  VEILIGHEID_KERN,
  VEILIGHEID_SECTIES,
  VEILIGHEID_TITEL,
} from "./veiligheid.ts";
import {
  DOCENTEN_INLEIDING,
  DOCENTEN_LOCATIE,
  DOCENTEN_TITEL,
  DOCENTEN_UITLEG,
  DOCENTEN_VOORWAARDEN,
  DOCENTEN_VOORWAARDEN_TITEL,
} from "./docenten.ts";
import {
  LESPLEKKEN,
  LESPLEKKEN_INLEIDING,
  LESPLEKKEN_TITEL,
  ORGANISATIES_TEKST,
  ORGANISATIES_TITEL,
  PRIVE,
  PRIVE_INLEIDING,
  PRIVE_TITEL,
  PRIVE_VOETNOOT,
  TARIEVEN_INLEIDING,
  TARIEVEN_TITEL,
  TARIEVEN_VOORWAARDEN,
  WORKSHOPS,
  WORKSHOPS_TITEL,
} from "./tarieven.ts";
import {
  GEDEELD_DISCLAIMER,
  GEDEELD_INSCHRIJVEN,
  GEDEELD_INSCHRIJVEN_TITEL,
  GEDEELD_PRAKTISCH,
  GEDEELD_PRAKTISCH_TITEL,
  GEDEELD_PRIJZEN,
  GEDEELD_PRIJZEN_TITEL,
  GEDEELD_PRIJZEN_VOET,
  MODULEPAGINAS,
  OPLEIDING_DIPLOMA,
  OPLEIDING_DIPLOMA_TITEL,
  OPLEIDING_DOORSTROOM,
  OPLEIDING_DOORSTROOM_KNOP,
  OPLEIDING_DOORSTROOM_LINK,
  OPLEIDING_DOORSTROOM_TITEL,
  OPLEIDING_HERO,
  OPLEIDING_KERNWOORDEN,
  OPLEIDING_MANIEREN,
  OPLEIDING_MANIEREN_TITEL,
  OPLEIDING_MODULES,
  OPLEIDING_MODULES_TITEL,
  OPLEIDING_OVER,
  OPLEIDING_OVER_TITEL,
  OPLEIDING_TITEL,
  OPLEIDING_VOORWIE,
  OPLEIDING_VOORWIE_TITEL,
  OPLEIDING_ZIN,
} from "./yogaopleiding-200.ts";

/**
 * De teksten en beelden van de publieke site (BOUWPROMPT §19).
 *
 * De pagina's lezen deze inhoud uit `content_blocks` in de database, zodat de
 * admin ze via de site-editor kan aanpassen zonder dat er iets uitgerold hoeft
 * te worden (§14). Dit bestand is de startinhoud: het vult de seed én dient
 * als terugval zolang een blok nog niet in de database staat.
 *
 * De structuur van een pagina ligt vast in code; alleen de inhoud van de
 * blokken is bewerkbaar. Voeg hier dus geen blokken toe zonder dat de pagina
 * ze ook toont.
 */

export type BlokWaarde =
  | { text: string }
  | { html: string }
  // `focus` bepaalt welk deel van de foto in beeld blijft als het kader een
  // andere verhouding heeft dan de foto. Ontbreekt hij, dan is dat het midden,
  // precies zoals het altijd was.
  | {
      url: string;
      alt: string;
      focus?: string;
      layout?: string;
      waas?: string;
      maat?: string;
    }
  | { items: Record<string, string>[] };

export type BlokSeed = {
  page_key: string;
  block_key: string;
  kind: BlockKind;
  value: BlokWaarde;
  /** Waar dit blok op de pagina staat — hulp voor de site-editor. */
  omschrijving: string;
  /**
   * Alleen bij een lijstblok: hoeveel items er maximaal in mogen, en hoe één
   * item heet op de knop. Zonder dit blijft een lijst staan op het aantal
   * waarmee hij begon — en dat was precies de klacht: een derde docent kwam er
   * niet bij.
   */
  lijst?: { max: number; itemNaam: string };
  /**
   * Mag de beheerder dit blok wegnemen van de pagina?
   *
   * Alleen blokken die een hele sectie dragen en die de pagina kan missen. Een
   * kop of een prijs verbergen zou een half scherm achterlaten; dat is geen
   * keuze die iemand per ongeluk moet kunnen maken.
   */
  verbergbaar?: true;
  /**
   * Ligt de plek van dit beeld vast in de opmaak?
   *
   * De achtergrondfoto van de hero loopt over de volle breedte met een waas
   * eroverheen; daar is niets naast te zetten. Zonder deze vlag zou de editor
   * een keuze tonen die niets doet, en dat is erger dan geen keuze.
   */
  vastBeeld?: true;
};

/**
 * De juridische pagina's zijn gewone CMS-pagina's, zodat Pieter ze na de
 * juridische toetsing zelf kan bijwerken zonder nieuwe uitrol (§8.6).
 */
const juridischeBlokken: BlokSeed[] = JURIDISCHE_TEKSTEN.flatMap((tekst) => [
  {
    page_key: tekst.pageKey,
    block_key: "titel",
    kind: "text" as const,
    omschrijving: `Kop van de pagina ${tekst.titel}`,
    value: { text: tekst.titel },
  },
  {
    page_key: tekst.pageKey,
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "Inleidende zin onder de kop",
    value: { text: tekst.inleiding },
  },
  {
    page_key: tekst.pageKey,
    block_key: "inhoud",
    kind: "richtext" as const,
    omschrijving: "De volledige tekst van de pagina",
    value: { html: tekst.html },
  },
  {
    page_key: tekst.pageKey,
    block_key: "concept_waarschuwing",
    kind: "text" as const,
    omschrijving:
      "Waarschuwing dat de tekst nog juridisch getoetst moet worden. Leeg maken laat hem verdwijnen.",
    value: { text: "" },
  },
]);

/**
 * De pagina "Veiligheid en privacy" (§8.6).
 *
 * Elke uitklapper is een paar blokken: de vraag als losse regel, het antwoord
 * als richtext. Dat is bewust geen lijstblok met vaste velden — in de
 * antwoorden staan opsommingen en accenten, en die overleven een gewoon
 * tekstveld niet. De volgorde en het aantal liggen vast in code; alleen de
 * inhoud is bewerkbaar.
 */
const veiligheidBlokken: BlokSeed[] = [
  {
    page_key: "veiligheid",
    block_key: "titel",
    kind: "text" as const,
    omschrijving: "Kop van de pagina Veiligheid en privacy",
    value: { text: VEILIGHEID_TITEL },
  },
  {
    page_key: "veiligheid",
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "Inleidende zin onder de kop",
    value: { text: VEILIGHEID_INLEIDING },
  },
  {
    page_key: "veiligheid",
    block_key: "kern",
    kind: "richtext" as const,
    omschrijving: "De korte versie bovenaan, boven de uitklappers",
    value: { html: VEILIGHEID_KERN },
  },
  ...VEILIGHEID_SECTIES.flatMap((sectie, index) => [
    {
      page_key: "veiligheid",
      block_key: `sectie_${index + 1}_vraag`,
      kind: "text" as const,
      omschrijving: `Vraag ${index + 1}: de tekst op de uitklapper`,
      value: { text: sectie.vraag },
    },
    {
      page_key: "veiligheid",
      block_key: `sectie_${index + 1}_antwoord`,
      kind: "richtext" as const,
      omschrijving: `Antwoord ${index + 1}: wat er onder de uitklapper staat`,
      value: { html: sectie.antwoord },
    },
  ]),
];

/**
 * De tarievenpagina (§8.2).
 *
 * De hele prijslijst is één lijstblok. Een tarief wijzigen is daarmee één veld
 * aanpassen, en er is geen opmaak die kan sneuvelen. Het zijbalkje naast het
 * weekrooster leest dezelfde lijst — zie `src/content/tarieven.ts`.
 */
const tarievenBlokken: BlokSeed[] = [
  {
    page_key: "tarieven",
    block_key: "titel",
    kind: "text" as const,
    omschrijving: "Kop van de tarievenpagina",
    value: { text: TARIEVEN_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "Inleidende tekst onder de kop",
    value: { text: TARIEVEN_INLEIDING },
  },

  // Waar Wietske lesgeeft. De school bepaalt de prijs, dus hier staat een link
  // in plaats van een bedrag.
  {
    page_key: "tarieven",
    block_key: "lesplekken_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de lessen bij yogascholen",
    value: { text: LESPLEKKEN_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "lesplekken_inleiding",
    kind: "text" as const,
    omschrijving: "Uitleg dat aanmelden en betalen via de school loopt",
    value: { text: LESPLEKKEN_INLEIDING },
  },
  {
    page_key: "tarieven",
    block_key: "lesplekken",
    lijst: { max: 8, itemNaam: "lesplek" },
    kind: "richtext" as const,
    omschrijving:
      "De lessen die je bij een yogaschool geeft. Per plek: welke les, bij welke school, wanneer, en het webadres van die school. Zet hier geen prijs neer: die bepaalt de school en die verandert zonder dat wij het weten. Laat de lijst leeg en de hele sectie blijft weg.",
    value: { items: LESPLEKKEN as unknown as Record<string, string>[] },
  },

  // Wat Wietske zelf verkoopt.
  {
    page_key: "tarieven",
    block_key: "workshops_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de workshops",
    value: { text: WORKSHOPS_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "workshops",
    lijst: { max: 8, itemNaam: "workshop" },
    kind: "richtext" as const,
    omschrijving:
      "De workshops die je zelf geeft. Per workshop: naam, duur, prijs en een toelichting.",
    value: { items: WORKSHOPS as unknown as Record<string, string>[] },
  },
  {
    page_key: "tarieven",
    block_key: "prive_titel",
    kind: "text" as const,
    omschrijving: "Kop boven privéyoga",
    value: { text: PRIVE_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "prive_inleiding",
    kind: "text" as const,
    omschrijving:
      "Uitleg bij privéyoga, waaronder het maximum van twee personen",
    value: { text: PRIVE_INLEIDING },
  },
  {
    page_key: "tarieven",
    block_key: "prive",
    lijst: { max: 8, itemNaam: "tarief" },
    kind: "richtext" as const,
    omschrijving:
      "De tarieven voor privéyoga. Per regel: naam, duur, prijs en een toelichting.",
    value: { items: PRIVE as unknown as Record<string, string>[] },
  },
  {
    page_key: "tarieven",
    block_key: "prive_voetnoot",
    kind: "text" as const,
    omschrijving: "Regel onder de privétarieven, bijvoorbeeld over reiskosten",
    value: { text: PRIVE_VOETNOOT },
  },

  // Verwijzing naar de organisatiepagina's, waar de eigen tarieven al staan.
  {
    page_key: "tarieven",
    block_key: "organisaties_titel",
    kind: "text" as const,
    verbergbaar: true,
    omschrijving:
      "Kop van het blok dat naar bedrijven, sportclubs en onderwijs wijst",
    value: { text: ORGANISATIES_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "organisaties_tekst",
    kind: "text" as const,
    verbergbaar: true,
    omschrijving: "Tekst bij de verwijzing naar de organisatiepagina's",
    value: { text: ORGANISATIES_TEKST },
  },

  {
    page_key: "tarieven",
    block_key: "voorwaarden",
    kind: "richtext" as const,
    omschrijving: "De afspraken onderaan: bevestigen, afzeggen en ziekte",
    value: { html: TARIEVEN_VOORWAARDEN },
  },
];

/** De pagina "Voor yogadocenten" (§ docentenlaag). */
const docentenBlokken: BlokSeed[] = [
  {
    page_key: "voor-yogadocenten",
    block_key: "titel",
    kind: "text" as const,
    omschrijving: "Kop van de pagina Voor yogadocenten",
    value: { text: DOCENTEN_TITEL },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "locatie",
    kind: "text" as const,
    omschrijving: "Regel boven de kop, met de studio",
    value: { text: DOCENTEN_LOCATIE },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "Inleidende zin onder de kop",
    value: { text: DOCENTEN_INLEIDING },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "uitleg",
    kind: "richtext" as const,
    omschrijving: "De uitleg: hoe het werkt, wat het kost, wat je ziet",
    value: { html: DOCENTEN_UITLEG },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "knop",
    kind: "text" as const,
    omschrijving: "Tekst op de eerste knop",
    value: { text: "Naar de docentenportal" },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "knop_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/docenten" },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "knop_twee",
    kind: "text" as const,
    omschrijving: "Tekst op de tweede knop",
    value: { text: "Vraag een aansluiting aan" },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "knop_twee_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/contact" },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "voorwaarden_titel",
    kind: "text" as const,
    omschrijving: "Kop van het blok met de voorwaarden onderaan",
    value: { text: DOCENTEN_VOORWAARDEN_TITEL },
  },
  {
    page_key: "voor-yogadocenten",
    block_key: "voorwaarden",
    kind: "richtext" as const,
    omschrijving: "Wat een docent nodig heeft om mee te doen",
    value: { html: DOCENTEN_VOORWAARDEN },
  },
];

/**
 * De 200-uurs Yogaopleiding: één overzichtspagina, vier modulepagina's en één
 * gedeelde set met prijzen, praktische informatie en de disclaimer.
 *
 * Die gedeelde set staat er bewust één keer, terwijl hij op alle vijf de
 * pagina's wordt getoond. Vijf kopieën zouden betekenen dat een prijswijziging
 * op vijf plekken moet gebeuren, en dan staat er een keer een verkeerd bedrag
 * op een pagina die niemand meer nakijkt.
 *
 * De teksten komen uit `src/content/yogaopleiding-200.ts` en zijn letterlijk
 * overgenomen uit de aangeleverde websiteteksten.
 */
const yogaopleidingBlokken: BlokSeed[] = [
  // --- De overzichtspagina -------------------------------------------------
  {
    page_key: "yogaopleiding",
    block_key: "titel",
    kind: "text" as const,
    omschrijving: "De grote kop bovenaan",
    value: { text: OPLEIDING_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "subtitel",
    kind: "text" as const,
    omschrijving: "De zin onder de kop",
    value: { text: OPLEIDING_ZIN },
  },
  {
    page_key: "yogaopleiding",
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "De inleidende alinea in de hero",
    value: { text: OPLEIDING_HERO },
  },
  {
    page_key: "yogaopleiding",
    block_key: "kenmerken",
    kind: "text" as const,
    omschrijving: "De vier kernwoorden onder de inleiding",
    value: { text: OPLEIDING_KERNWOORDEN },
  },
  {
    page_key: "yogaopleiding",
    block_key: "knop",
    kind: "text" as const,
    omschrijving: "Tekst op de eerste knop in de hero",
    value: { text: "Bekijk de modules" },
  },
  {
    page_key: "yogaopleiding",
    block_key: "knop_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "#modules" },
  },
  {
    page_key: "yogaopleiding",
    block_key: "knop_twee",
    kind: "text" as const,
    omschrijving: "Tekst op de tweede knop in de hero",
    value: { text: "Schrijf je in" },
  },
  {
    page_key: "yogaopleiding",
    block_key: "knop_twee_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "#aanmelden" },
  },
  {
    page_key: "yogaopleiding",
    block_key: "beeld",
    kind: "image" as const,
    verbergbaar: true,
    omschrijving: "Sfeerbeeld boven aan de pagina",
    value: { url: "", alt: "" },
  },
  {
    page_key: "yogaopleiding",
    block_key: "introductie_titel",
    kind: "text" as const,
    omschrijving: "Kop boven het blok over de opleiding",
    value: { text: OPLEIDING_OVER_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "introductie_tekst",
    kind: "richtext" as const,
    omschrijving: "Wat de opleiding is en wat je erin ontwikkelt",
    value: { html: OPLEIDING_OVER },
  },
  {
    page_key: "yogaopleiding",
    block_key: "modules_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de vier modules",
    value: { text: OPLEIDING_MODULES_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "modules",
    lijst: { max: 6, itemNaam: "module" },
    kind: "richtext" as const,
    omschrijving:
      "De vier modulekaarten. Per module: nummer, titel, uren, tekst, knoptekst en het adres van de modulepagina.",
    value: { items: OPLEIDING_MODULES as unknown as Record<string, string>[] },
  },
  {
    page_key: "yogaopleiding",
    block_key: "manieren_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de drie manieren om te volgen",
    value: { text: OPLEIDING_MANIEREN_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "manieren_tekst",
    kind: "richtext" as const,
    omschrijving: "Per module, per blok of de volledige opleiding",
    value: { html: OPLEIDING_MANIEREN },
  },
  {
    page_key: "yogaopleiding",
    block_key: "voorwie_titel",
    kind: "text" as const,
    omschrijving: "Kop boven het blok Voor wie",
    value: { text: OPLEIDING_VOORWIE_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "voorwie_tekst",
    kind: "richtext" as const,
    omschrijving: "Voor wie de opleiding bedoeld is",
    value: { html: OPLEIDING_VOORWIE },
  },
  {
    page_key: "yogaopleiding",
    block_key: "diploma_titel",
    kind: "text" as const,
    omschrijving: "Kop boven het blok over diploma en certificaten",
    value: { text: OPLEIDING_DIPLOMA_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "diploma_tekst",
    kind: "richtext" as const,
    omschrijving: "Wat je krijgt bij afronding",
    value: { html: OPLEIDING_DIPLOMA },
  },
  {
    page_key: "yogaopleiding",
    block_key: "doorstroom_titel",
    kind: "text" as const,
    omschrijving: "Kop boven het blok over de doorstroom",
    value: { text: OPLEIDING_DOORSTROOM_TITEL },
  },
  {
    page_key: "yogaopleiding",
    block_key: "doorstroom_tekst",
    kind: "richtext" as const,
    omschrijving: "De doorstroom naar de Yin Yoga Specialist Opleiding",
    value: { html: OPLEIDING_DOORSTROOM },
  },
  {
    page_key: "yogaopleiding",
    block_key: "doorstroom_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop naar de Yin Yoga Specialist",
    value: { text: OPLEIDING_DOORSTROOM_KNOP },
  },
  {
    page_key: "yogaopleiding",
    block_key: "doorstroom_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: OPLEIDING_DOORSTROOM_LINK },
  },

  // --- De gedeelde blokken, op alle vijf de pagina's ------------------------
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "prijzen_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de prijstabel",
    value: { text: GEDEELD_PRIJZEN_TITEL },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "prijzen",
    lijst: { max: 10, itemNaam: "prijsregel" },
    kind: "richtext" as const,
    omschrijving:
      "De prijstabel. Per regel: variant, wat het inhoudt en het bedrag. Verschijnt op de overzichtspagina én op alle vier de modulepagina's.",
    value: { items: GEDEELD_PRIJZEN as unknown as Record<string, string>[] },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "prijzen_voet",
    kind: "richtext" as const,
    omschrijving: "De voorwaarden onder de prijstabel",
    value: { html: GEDEELD_PRIJZEN_VOET },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "praktisch_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de praktische informatie",
    value: { text: GEDEELD_PRAKTISCH_TITEL },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "praktisch_tekst",
    kind: "richtext" as const,
    omschrijving: "Locatie, groep, ritme, lesmateriaal en data",
    value: { html: GEDEELD_PRAKTISCH },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "inschrijven_titel",
    kind: "text" as const,
    omschrijving: "Kop boven de inschrijfstappen",
    value: { text: GEDEELD_INSCHRIJVEN_TITEL },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "inschrijven_tekst",
    kind: "richtext" as const,
    omschrijving: "De drie stappen en waar je terecht kunt met vragen",
    value: { html: GEDEELD_INSCHRIJVEN },
  },
  {
    page_key: "yogaopleiding-gedeeld",
    block_key: "disclaimer",
    kind: "text" as const,
    omschrijving: "De kleine letters onderaan elke opleidingspagina",
    value: { text: GEDEELD_DISCLAIMER },
  },

  // --- De vier modulepagina's ----------------------------------------------
  ...MODULEPAGINAS.flatMap((module): BlokSeed[] => [
    {
      page_key: module.pageKey,
      block_key: "titel",
      kind: "text" as const,
      omschrijving: "De grote kop bovenaan",
      value: { text: module.titel },
    },
    {
      page_key: module.pageKey,
      block_key: "label",
      kind: "text" as const,
      omschrijving: "Het werkwoord dat deze module draagt",
      value: { text: module.woord },
    },
    {
      page_key: module.pageKey,
      block_key: "inleiding",
      kind: "text" as const,
      omschrijving: "De regel met uren, blok en of de module los te volgen is",
      value: { text: module.meta },
    },
    {
      page_key: module.pageKey,
      block_key: "beeld",
      kind: "image" as const,
      verbergbaar: true,
      omschrijving: "Sfeerbeeld boven aan de pagina",
      value: { url: "", alt: "" },
    },
    {
      page_key: module.pageKey,
      block_key: "verhaal",
      kind: "richtext" as const,
      omschrijving: "De inleiding op de module",
      value: {
        html: module.identiek
          ? `<p><em>${module.identiek}</em></p>\n<p>${module.intro}</p>`
          : `<p>${module.intro}</p>`,
      },
    },
    {
      page_key: module.pageKey,
      block_key: "leert_titel",
      kind: "text" as const,
      omschrijving: "Kop boven wat je leert",
      value: { text: "Wat je leert" },
    },
    {
      page_key: module.pageKey,
      block_key: "leert_tekst",
      kind: "richtext" as const,
      omschrijving: "Wat je na deze module kunt",
      value: { html: module.watJeLeert },
    },
    {
      page_key: module.pageKey,
      block_key: "programma_titel",
      kind: "text" as const,
      omschrijving: "Kop boven het programma",
      value: { text: "Programma" },
    },
    {
      page_key: module.pageKey,
      block_key: "programma_tekst",
      kind: "richtext" as const,
      omschrijving: "De onderdelen van deze module",
      value: { html: module.programma },
    },
    {
      page_key: module.pageKey,
      block_key: "lesdagen_titel",
      kind: "text" as const,
      omschrijving: "Kop boven de lesdagen",
      value: { text: "Lesdagen" },
    },
    {
      page_key: module.pageKey,
      block_key: "lesdagen_tekst",
      kind: "richtext" as const,
      omschrijving: "De vijf lesdagen en de avondsessies",
      value: { html: module.lesdagen },
    },
    {
      page_key: module.pageKey,
      block_key: "afloop_titel",
      kind: "text" as const,
      omschrijving: "Kop boven wat je na de module hebt",
      value: { text: `Na ${module.titel.split(" — ")[0]?.toLowerCase()}` },
    },
    {
      page_key: module.pageKey,
      block_key: "afloop_tekst",
      kind: "richtext" as const,
      omschrijving: "Wat je kunt en welk certificaat je krijgt",
      value: { html: module.naAfloop },
    },
    {
      page_key: module.pageKey,
      block_key: "toelating_titel",
      kind: "text" as const,
      omschrijving: "Kop boven voor wie en toelating",
      value: { text: "Voor wie & toelating" },
    },
    {
      page_key: module.pageKey,
      block_key: "toelating_tekst",
      kind: "text" as const,
      omschrijving: "Voor wie deze module bedoeld is",
      value: { text: module.voorWie },
    },
    {
      page_key: module.pageKey,
      block_key: "prijs",
      kind: "text" as const,
      omschrijving: "Het bedrag voor deze losse module",
      value: { text: module.prijs },
    },
    {
      page_key: module.pageKey,
      block_key: "prijs_knop",
      kind: "text" as const,
      omschrijving: "Tekst op de inschrijfknop",
      value: { text: module.knop },
    },
    {
      page_key: module.pageKey,
      block_key: "prijs_link",
      kind: "text" as const,
      omschrijving: "Waar de inschrijfknop heen gaat",
      // Naar het aanmeldformulier op dezelfde pagina, niet naar het portaal.
      // Dat vraagt eerst een account en daarna een betaling; wie net besloten
      // heeft dat hij mee wil doen krijgt dan een inlogscherm te zien.
      value: { text: "#aanmelden" },
    },
    {
      page_key: module.pageKey,
      block_key: "prijs_voet",
      kind: "text" as const,
      omschrijving: "De combinatietip onder de prijs",
      value: { text: module.combineer },
    },
  ]),
];

/**
 * De vaste teksten van een cursuspagina.
 *
 * Elke opleiding en training heeft dezelfde opbouw: een kop met de prijs, het
 * verhaal, het curriculum, een kolom met praktische gegevens en onderaan een
 * uitnodiging om een vraag te stellen. De inhoud van die pagina komt uit het
 * aanbod — titel, beschrijving, prijs, curriculum — maar de woorden eromheen
 * stonden tot nu toe in de code. "Voor wie", "Praktisch", "Twijfel je of dit
 * past?": veertien zinnen die de beheerder niet kon aanraken.
 *
 * Ze staan hier één keer en gelden voor alle cursuspagina's. Per pagina zou
 * betekenen dat een wijziging aan het woord "Curriculum" op negen plekken moet,
 * en dan staat er na een half jaar op drie pagina's iets anders.
 *
 * Wat wél per pagina verschilt — een foto, een extra stuk tekst — zet de
 * beheerder in de eigen blokken van die ene cursus; zie `heeftVrijeBlokken`.
 */
const cursusBlokken: BlokSeed[] = [
  {
    page_key: "cursus",
    block_key: "kop_kruimel_opleiding",
    kind: "text",
    omschrijving: "Terugverwijzing bovenaan een opleidingspagina",
    value: { text: "Opleidingen" },
  },
  {
    page_key: "cursus",
    block_key: "kop_kruimel_training",
    kind: "text",
    omschrijving: "Terugverwijzing bovenaan een trainingspagina",
    value: { text: "Trainingen" },
  },
  {
    page_key: "cursus",
    block_key: "kop_prijs_toelichting",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Zin onder de prijs in het kader rechtsboven",
    value: { text: "Betalen in termijnen is mogelijk; vraag ernaar." },
  },
  {
    page_key: "cursus",
    block_key: "kop_inschrijf_knop",
    kind: "text",
    omschrijving:
      "Tekst op de inschrijfknop. Waar hij heen gaat hangt van de cursus af en ligt vast.",
    value: { text: "Inschrijven" },
  },
  {
    page_key: "cursus",
    block_key: "kop_vraag_knop",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Het zachte alternatief onder de inschrijfknop",
    value: { text: "Eerst een vraag stellen" },
  },
  {
    page_key: "cursus",
    block_key: "kop_vraag_link",
    kind: "text",
    omschrijving: "Waar dat alternatief heen gaat",
    value: { text: "/contact" },
  },

  {
    page_key: "cursus",
    block_key: "verhaal_voorwie_titel",
    kind: "text",
    omschrijving: "Kop boven 'voor wie', midden op de pagina",
    value: { text: "Voor wie" },
  },
  {
    page_key: "cursus",
    block_key: "verhaal_toelating_titel",
    kind: "text",
    omschrijving: "Kop boven de toelatingseisen",
    value: { text: "Toelatingseisen" },
  },
  {
    page_key: "cursus",
    block_key: "verhaal_curriculum_titel",
    kind: "text",
    omschrijving: "Kop boven het uitklapbare curriculum",
    value: { text: "Curriculum" },
  },

  {
    page_key: "cursus",
    block_key: "praktisch_titel",
    kind: "text",
    omschrijving: "Kop boven de kolom met praktische gegevens",
    value: { text: "Praktisch" },
  },
  // De namen in die kolom. Losse blokken en geen lijst: de waarde achter elk
  // label komt uit het aanbod, dus de regels zijn niet uitwisselbaar en er kan
  // er ook geen bij. Een lijst zou een knop "regel toevoegen" tonen die niets
  // kan opleveren.
  {
    page_key: "cursus",
    block_key: "praktisch_omvang",
    kind: "text",
    omschrijving: "Naam van de regel met het totaal aantal uren",
    value: { text: "Omvang" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_studiebelasting",
    kind: "text",
    omschrijving: "Naam van de regel met de studiebelasting",
    value: { text: "Studiebelasting" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_locatie",
    kind: "text",
    omschrijving: "Naam van de regel met de locatie",
    value: { text: "Locatie" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_groepsgrootte",
    kind: "text",
    omschrijving: "Naam van de regel met het maximum aantal deelnemers",
    value: { text: "Groepsgrootte" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_certificaat",
    kind: "text",
    omschrijving: "Naam van de regel met de certificering",
    value: { text: "Certificering" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_lesdata",
    kind: "text",
    omschrijving: "Naam van de regel met de lesdata",
    value: { text: "Lesdata" },
  },
  {
    page_key: "cursus",
    block_key: "praktisch_lesdata_tekst",
    kind: "text",
    verbergbaar: true,
    omschrijving:
      "Wat er achter Lesdata staat. Leeg laten = die regel verdwijnt.",
    value: { text: "Neem contact op voor de eerstvolgende startdatum." },
  },

  {
    page_key: "cursus",
    block_key: "slot_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving:
      "Kop van het blok onderaan elke cursuspagina. Weghalen = het hele blok verdwijnt.",
    value: { text: "Twijfel je of dit past?" },
  },
  {
    page_key: "cursus",
    block_key: "slot_tekst",
    kind: "text",
    omschrijving: "De zin onder die kop",
    value: {
      text: "Stuur ons een bericht. We denken mee over wat aansluit bij waar je nu staat, zonder dat je ergens aan vastzit.",
    },
  },
  {
    page_key: "cursus",
    block_key: "slot_knop",
    kind: "text",
    omschrijving: "Tekst op de knop onderaan",
    value: { text: "Stel je vraag" },
  },
  {
    page_key: "cursus",
    block_key: "slot_link",
    kind: "text",
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/contact" },
  },
];

export const BLOKKEN: BlokSeed[] = [
  // ---------------------------------------------------------------------------
  // Landingspagina
  //
  // Deze pagina is anders opgebouwd dan een docentpagina: een docent schuift
  // zelf met blokken, hier ligt de volgorde vast. De volgorde ís hier namelijk
  // de boodschap — eerst wie we zijn, dan de drie deuren, dan pas het bewijs —
  // en de pagina moet het ook nog doen als hij een half jaar niet is
  // aangeraakt. Wat een beheerder aanpast is de inhoud, niet de indeling.
  // ---------------------------------------------------------------------------

  // De promobanner. Leeg laten betekent: geen banner. De balk verdwijnt dan
  // helemaal, er blijft geen lege strook staan.
  {
    page_key: "home",
    block_key: "banner_tekst",
    verbergbaar: true,
    kind: "text",
    omschrijving: "Balk bovenaan de pagina. Leeg laten = geen banner.",
    value: { text: "" },
  },
  {
    page_key: "home",
    block_key: "banner_knop",
    kind: "text",
    omschrijving: "Tekst op de knop in de banner (leeg = geen knop)",
    value: { text: "" },
  },
  {
    page_key: "home",
    block_key: "banner_link",
    kind: "text",
    omschrijving: "Waar de bannerknop heen gaat, bijvoorbeeld /trainingen",
    value: { text: "" },
  },
  {
    page_key: "home",
    block_key: "banner_kleur",
    kind: "text",
    omschrijving:
      "Kleur van de banner: zand (aankondiging), abrikoos (actie) of petrol (mededeling)",
    value: { text: "zand" },
  },

  // De hero, met de foto als paginabrede achtergrond.
  {
    page_key: "home",
    block_key: "hero_bovenkop",
    kind: "text",
    omschrijving: "Kleine regel boven de grote kop",
    value: { text: "Opleidingen · trainingen · lessen" },
  },
  {
    page_key: "home",
    block_key: "hero_titel",
    kind: "text",
    omschrijving: "Grote kop bovenaan de startpagina",
    value: { text: "Van je eerste les tot je eigen lespraktijk." },
  },
  {
    page_key: "home",
    block_key: "hero_subtitel",
    kind: "text",
    omschrijving: "Zin onder de grote kop",
    value: {
      text: "Wekelijkse yogalessen in kleine groepen in Almere, korte trainingen om je te verdiepen, en de 200-uurs Yin Yoga Specialist Opleiding.",
    },
  },
  {
    page_key: "home",
    block_key: "hero_knop",
    kind: "text",
    omschrijving: "Tekst op de eerste knop in de hero (leidt naar het rooster)",
    value: { text: "Bekijk het lesrooster" },
  },
  {
    page_key: "home",
    block_key: "hero_link",
    kind: "text" as const,
    omschrijving: "Waar de eerste knop in de hero heen gaat",
    value: { text: "/lessen" },
  },
  {
    page_key: "home",
    block_key: "hero_knop_twee",
    kind: "text",
    omschrijving:
      "Tekst op de tweede knop in de hero (leidt naar de opleidingen)",
    value: { text: "Ontdek de opleidingen" },
  },
  {
    page_key: "home",
    block_key: "hero_link_twee",
    kind: "text" as const,
    omschrijving: "Waar de tweede knop in de hero heen gaat",
    value: { text: "/opleidingen" },
  },
  {
    page_key: "home",
    block_key: "hero_kenmerken",
    kind: "text",
    omschrijving: "Regel met kenmerken onder de knoppen, gescheiden door ·",
    value: {
      text: "Kleine groepen · Certificaat per module · Annuleren tot 24 uur vooraf",
    },
  },
  {
    page_key: "home",
    block_key: "hero_achtergrond",
    vastBeeld: true,
    verbergbaar: true,
    kind: "image",
    omschrijving:
      "Achtergrondfoto van het bovenste scherm. Liggend, minstens 1600 pixels breed.",
    value: {
      url: "/beeld/hero-yoga.jpg",
      alt: "Een vrouw in een voorwaartse buiging over een bolster, op een mat in laag ochtendlicht",
    },
  },

  // De drie deuren.
  {
    page_key: "home",
    block_key: "deuren_titel",
    kind: "text",
    omschrijving: "Kop boven de drie ingangen",
    value: { text: "Waar wil je beginnen?" },
  },
  {
    page_key: "home",
    block_key: "deuren_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "Drie manieren om met ons te werken, elk met een eigen tempo en een eigen prijs.",
    },
  },
  {
    page_key: "home",
    block_key: "deuren",
    lijst: { max: 6, itemNaam: "ingang" },
    verbergbaar: true,
    kind: "richtext",
    omschrijving:
      "De drie ingangen. Per ingang: label, kop, tekst, prijsregel, knoptekst en het adres waar hij heen gaat.",
    value: {
      items: [
        {
          label: "Yogalessen",
          titel: "Elke week op de mat",
          tekst:
            "Yin, Vinyasa en Restorative in de studio in Almere. Kleine groepen, dus je wordt gezien.",
          prijs: "Losse les € 17,00 · 10-strippenkaart € 145,00",
          knop: "Bekijk het rooster en boek",
          href: "/lessen",
        },
        {
          label: "Trainingen",
          titel: "Verdiep je in één onderwerp",
          tekst:
            "Kortere programma's, online of in de studio. Zoals het 8-weekse herstelprogramma Eerst Jij.",
          prijs: "Vanaf € 295,00",
          knop: "Bekijk de trainingen",
          href: "/trainingen",
        },
        {
          label: "Opleidingen",
          titel: "Leer het vak",
          tekst:
            "De 200-uurs Yin Yoga Specialist Opleiding in vier modules van 50 uur. Ook los te volgen.",
          prijs: "€ 795,00 per module · € 2.795,00 in één keer",
          knop: "Bekijk de opleidingen",
          href: "/opleidingen",
        },
      ],
    },
  },

  // Het rooster en de kaarten.
  {
    page_key: "home",
    block_key: "rooster_titel",
    kind: "text",
    omschrijving: "Kop boven de eerstvolgende lessen",
    value: { text: "De eerstvolgende lessen" },
  },
  {
    page_key: "home",
    block_key: "rooster_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "Reserveer je plek vooraf. Met een account kost dat één klik en gaat er een strip van je kaart af.",
    },
  },
  {
    page_key: "home",
    block_key: "rooster_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop onder de eerstvolgende lessen",
    value: { text: "Bekijk het volledige weekrooster" },
  },
  {
    page_key: "home",
    block_key: "rooster_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/lessen" },
  },

  // Waarom, het aanbod, en het bewijs.
  {
    page_key: "home",
    block_key: "waarom_titel",
    kind: "text",
    omschrijving: "Kop van het blok Waarom YogaCompany",
    value: { text: "Waarom YogaCompany" },
  },
  {
    page_key: "home",
    block_key: "waarom_punten",
    lijst: { max: 8, itemNaam: "reden" },
    verbergbaar: true,
    kind: "richtext",
    omschrijving: "De vier redenen, elk met een korte toelichting",
    value: {
      items: [
        {
          titel: "Ervaren docenten",
          tekst: "Mensen die zelf jaren lesgeven en blijven leren.",
        },
        {
          titel: "Kleine groepen",
          tekst: "Maximaal twaalf deelnemers, zodat je gezien wordt.",
        },
        {
          titel: "Praktijkgericht",
          tekst: "Je oefent met echte mensen en echte lichamen.",
        },
        {
          titel: "Certificaat per module",
          tekst: "Je bouwt op in stappen die je zelf kunt plannen.",
        },
      ],
    },
  },
  {
    page_key: "home",
    block_key: "aanbod_titel",
    kind: "text",
    omschrijving: "Kop boven de uitgelichte opleidingen",
    value: { text: "Opleidingen en trainingen" },
  },
  {
    page_key: "home",
    block_key: "aanbod_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "De volledige opleiding, één losse module, of een korte training. Je schrijft je online in.",
    },
  },
  {
    page_key: "home",
    block_key: "aanbod_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop onder het aanbod",
    value: { text: "Bekijk het volledige aanbod" },
  },
  {
    page_key: "home",
    block_key: "aanbod_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/opleidingen" },
  },
  {
    page_key: "home",
    block_key: "testimonials",
    lijst: { max: 9, itemNaam: "ervaring" },
    verbergbaar: true,
    kind: "richtext",
    omschrijving: "Drie ervaringen van deelnemers",
    value: {
      items: [
        {
          citaat:
            "Voor het eerst een opleiding waar het tempo klopte met wat ik aankon.",
          naam: "Deelnemer, naam volgt",
          rol: "Yin Yoga niveau 1 en 2",
        },
        {
          citaat:
            "De kleine groep maakte het verschil. Er was echt tijd voor mijn vragen.",
          naam: "Deelnemer, naam volgt",
          rol: "200-uurs Yin Yoga Specialist",
        },
        {
          citaat:
            "Ik kwam binnen als deelnemer en ging weg met een manier van kijken.",
          naam: "Deelnemer, naam volgt",
          rol: "Eerst Jij",
        },
      ],
    },
  },

  // De twee inlogdeuren, onderaan: eerst de bezoeker overtuigen, dan pas de
  // mensen die hier al thuis zijn.
  {
    page_key: "home",
    block_key: "inlog_titel",
    kind: "text",
    omschrijving: "Kop boven de twee inlogdeuren",
    value: { text: "Al bij ons bekend?" },
  },
  {
    page_key: "home",
    block_key: "inlog_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "Twee deuren, allebei achter dezelfde inlog. Je komt vanzelf in de juiste omgeving terecht.",
    },
  },
  {
    page_key: "home",
    block_key: "inlog_deuren",
    lijst: { max: 2, itemNaam: "inlogdeur" },
    verbergbaar: true,
    kind: "richtext",
    omschrijving:
      "De twee inlogdeuren. Per deur: label, kop, tekst, knoptekst en adres.",
    value: {
      items: [
        {
          label: "Voor leden",
          titel: "Mijn omgeving",
          tekst:
            "Je lessen, je strippenkaarten met saldo, je opleidingen en het lesmateriaal. En je eigen gegevens, die je kunt inzien en laten wissen.",
          knop: "Inloggen als lid",
          href: "/inloggen?vervolg=/portaal",
        },
        {
          label: "Voor docenten",
          titel: "Docentenportal",
          tekst:
            "Kaarten uitgeven, afboekingen zien, de maand afsluiten met een factuur, en je eigen pagina inrichten.",
          knop: "Inloggen als docent",
          href: "/inloggen?vervolg=/docenten",
        },
      ],
    },
  },

  // De ingang voor organisaties. Eén blok met drie kaarten en geen drie extra
  // deuren bovenaan: dat is een andere klant. Bij de deuren erboven kiest
  // iemand voor zichzelf; hier regelt iemand het vóór een groep die er zelf
  // niet om vroeg. Die twee door elkaar zetten maakt beide onduidelijk.
  {
    page_key: "home",
    block_key: "organisaties_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop van het blok voor organisaties",
    value: { text: "Yoga voor een groep die er zelf niet om vroeg" },
  },
  {
    page_key: "home",
    block_key: "organisaties_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "Op kantoor, op de club of in de klas. Wij komen langs, nemen alles mee en werken met mensen die nog nooit op een mat hebben gestaan.",
    },
  },
  {
    page_key: "home",
    block_key: "organisaties",
    kind: "richtext",
    lijst: { max: 4, itemNaam: "ingang" },
    omschrijving:
      "De ingangen voor organisaties. Per ingang: label, kop, tekst, prijsregel, knoptekst en het adres.",
    value: {
      items: [
        {
          label: "Bedrijven",
          titel: "Yoga op de werkvloer",
          tekst:
            "Een vast moment in de week, een workshop op een teamdag, of een programma rond werkdruk en herstel.",
          prijs: "Reeks vanaf € 155 per sessie, excl. btw",
          knop: "Bekijk bedrijfsyoga",
          href: "/bedrijfsyoga",
        },
        {
          label: "Sportclubs",
          titel: "De dag na de wedstrijd",
          tekst:
            "Mobiliteit, herstel en ademhaling voor teams en individuele sporters. In de kantine of op het veld, na de training.",
          prijs: "Blok vanaf € 145 per sessie, excl. btw",
          knop: "Bekijk yoga bij je club",
          href: "/sportclubs",
        },
        {
          label: "Onderwijs",
          titel: "Een lesuur waarin het stil wordt",
          tekst:
            "Voortgezet onderwijs, mbo, hbo en universiteit. In het mentoruur, vóór de examenweek, of voor het team dat er de hele week staat.",
          prijs: "Dagdeel van drie lessen € 375, excl. btw",
          knop: "Bekijk yoga in het onderwijs",
          href: "/onderwijs",
        },
      ],
    },
  },

  {
    page_key: "home",
    block_key: "cta_titel",
    kind: "text",
    omschrijving: "Kop van het afsluitende blok",
    value: { text: "Nog niet zeker welke stap past?" },
  },
  {
    page_key: "home",
    block_key: "cta_tekst",
    kind: "text",
    omschrijving: "Tekst van het afsluitende blok",
    value: {
      text: "Laat het ons weten. We denken graag mee, zonder dat je ergens aan vastzit.",
    },
  },
  {
    page_key: "home",
    block_key: "cta_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop onder deze oproep",
    value: { text: "Neem contact op" },
  },
  {
    page_key: "home",
    block_key: "cta_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/contact" },
  },

  // ---------------------------------------------------------------------------
  // Bedrijfsyoga
  //
  // Een eigen pagina en geen vierde deur op de startpagina: dit is een andere
  // klant. Een werkgever leest andere dingen dan iemand die zelf een les zoekt
  // — wat het oplevert, wat het kost, en hoe het praktisch gaat.
  // ---------------------------------------------------------------------------
  {
    page_key: "bedrijfsyoga",
    block_key: "label",
    kind: "text",
    omschrijving: "Kleine regel boven de kop",
    value: { text: "Voor werkgevers" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de pagina",
    value: { text: "Yoga op de werkvloer" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Zin onder de kop",
    value: {
      text: "Vaste lessen op kantoor of online, een workshop op een teamdag, of een programma rond werkdruk en herstel. We komen langs, of jullie komen naar de studio.",
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "knop",
    kind: "text",
    omschrijving: "Tekst op de knop naar het aanvraagformulier",
    value: { text: "Vraag een proefles aan" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "knop_link",
    kind: "text" as const,
    omschrijving:
      "Waar die knop heen gaat. #aanvraag springt naar het formulier onderaan deze pagina",
    value: { text: "#aanvraag" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "beeld",
    kind: "image",
    verbergbaar: true,
    omschrijving: "Sfeerbeeld boven aan de pagina",
    value: { url: "", alt: "" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "verhaal",
    kind: "richtext",
    omschrijving: "Het verhaal: waarom yoga op het werk",
    value: {
      html: "<p>Mensen die de hele dag in hun hoofd zitten, merken pas dat ze gespannen zijn als het al te veel is. Een uur per week op de mat verandert dat: even niet presteren, wél merken wat er in je lijf gebeurt.</p><p>We werken met wat er is: een vergaderzaal, een kantine, een hoek van het magazijn, en met mensen die nog nooit yoga hebben gedaan. Geen ingewikkelde houdingen, geen kleedkamer nodig.</p>",
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "doelgroepen_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de kaarten met doelgroepen",
    value: { text: "" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "doelgroepen",
    kind: "richtext",
    lijst: { max: 6, itemNaam: "doelgroep" },
    verbergbaar: true,
    omschrijving:
      "Kaarten met doelgroepen. Leeg laten kan; dan verdwijnt het blok.",
    value: { items: [] },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "vormen_titel",
    kind: "text",
    omschrijving: "Kop boven de vormen",
    value: { text: "In welke vorm" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "vormen_inleiding",
    kind: "text",
    omschrijving: "Zin onder de kop met de vormen",
    value: { text: "" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "vormen",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "vorm" },
    omschrijving:
      "De vormen waarin het kan. Per vorm: naam, duur, toelichting en wat het kost.",
    value: {
      items: [
        {
          naam: "Kennismakingssessie",
          duur: "60 minuten, eenmalig",
          tekst:
            "Om te zien wat het is en of het bij jullie werkt. Start je binnen drie maanden een reeks, dan wordt dit bedrag verrekend.",
          prijs: "€ 195",
          uitgelicht: "",
        },
        {
          naam: "Reeks van 8 sessies",
          duur: "wekelijks, 60 minuten",
          tekst:
            "Een vast moment in de week, met dezelfde groep en dezelfde ruimte.",
          prijs: "€ 1.400 (€ 175 per sessie)",
          uitgelicht: "",
        },
        {
          naam: "Reeks van 12 sessies",
          duur: "wekelijks, 60 minuten",
          tekst:
            "Lang genoeg om iets te merken. Inclusief een korte energiemeting in week 1 en week 12, anoniem gerapporteerd.",
          prijs: "€ 1.980 (€ 165 per sessie)",
          uitgelicht: "ja",
        },
        {
          naam: "Jaarcontract, 40 sessies",
          duur: "het hele jaar door",
          tekst:
            "Vaste dag, vaste groep, facturatie per maand of kwartaal. Opzegtermijn twee maanden.",
          prijs: "€ 6.200 (€ 155 per sessie)",
          uitgelicht: "",
        },
        {
          naam: "Workshop ‘Vertragen’",
          duur: "2 tot 3 uur, tot 20 deelnemers",
          tekst:
            "Op maat gemaakt na een intakegesprek. Werkt goed als onderbreking van een teamdag vol praten.",
          prijs: "€ 595",
          uitgelicht: "",
        },
        {
          naam: "Online live sessie",
          duur: "60 minuten, onbeperkt deelnemers",
          tekst:
            "Voor teams die verspreid zitten of thuiswerken. Ook in 30 of 45 minuten, vanaf € 95.",
          prijs: "€ 140",
          uitgelicht: "",
        },
      ],
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "praktisch_titel",
    kind: "text",
    omschrijving: "Kop boven de praktische punten",
    value: { text: "Praktisch" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "praktisch",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "punt" },
    omschrijving: "Praktische punten: wat er nodig is, en wat wij meenemen.",
    value: {
      items: [
        {
          titel: "Wat jullie regelen",
          tekst:
            "Een ruimte waar iedereen kan liggen, en een kwartier om hem leeg te maken.",
        },
        {
          titel: "Wat wij meenemen",
          tekst: "Matten, blokken en alles wat er verder bij hoort.",
        },
        {
          titel: "Kleding",
          tekst:
            "Gewoon iets waarin je kunt bewegen. Niemand hoeft zich om te kleden voor een les die niet zweterig is.",
        },
        {
          titel: "Groepsgrootte",
          tekst: "Tot twaalf mensen per groep. Daarboven splitsen we.",
        },
      ],
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "fiscaal",
    kind: "richtext",
    verbergbaar: true,
    omschrijving:
      "Het fiscale kader onder de tarieven. Let op: dit is nagelopen tekst, wijzig hem niet zonder je adviseur.",
    value: {
      html: "<p>Yoga op de werkvloer onder werktijd valt voor de loonheffingen doorgaans onder de nihilwaardering voor voorzieningen op de werkplek: geen loonheffing, en geen beslag op de vrije ruimte. Online programma's die medewerkers thuis volgen kunnen worden aangewezen in de vrije ruimte van de werkkostenregeling (2026: 2% over de eerste € 400.000 loonsom).</p><p>Laat de toepassing in jullie situatie bevestigen door de salarisadministratie of een adviseur. Wat wij niet zeggen, en andere aanbieders nog wel: dat dit een vrijgestelde arbovoorziening is. Sinds 2022 geldt die vrijstelling alleen nog voor voorzieningen die rechtstreeks uit de Arbowet volgen.</p>",
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "vormen_voetnoot",
    kind: "text",
    verbergbaar: true,
    omschrijving: "De kleine letters onder de tarieven",
    value: {
      text: "Alle bedragen zijn exclusief btw en gelden tot 15 deelnemers; daarboven € 5 per extra deelnemer per sessie. Matten en props nemen we mee. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer. Reeksen vooraf te voldoen, betaaltermijn 14 dagen.",
    },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "cta_titel",
    kind: "text",
    omschrijving: "Kop van het afsluitende blok",
    value: { text: "Een keer proberen?" },
  },
  {
    page_key: "bedrijfsyoga",
    block_key: "cta_tekst",
    kind: "text",
    omschrijving: "Tekst van het afsluitende blok",
    value: {
      text: "We komen graag eerst een keer langs voor een proefles, zodat jullie weten waar je ja tegen zegt. Laat weten met hoeveel mensen jullie zijn en waar jullie zitten.",
    },
  },

  // ---------------------------------------------------------------------------
  // Een lesuur waarin het stil wordt
  // ---------------------------------------------------------------------------
  {
    page_key: "onderwijs",
    block_key: "label",
    kind: "text",
    omschrijving: "Kleine regel boven de kop",
    value: { text: "Voor het onderwijs" },
  },
  {
    page_key: "onderwijs",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de pagina",
    value: { text: "Een lesuur waarin het stil wordt" },
  },
  {
    page_key: "onderwijs",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Zin onder de kop",
    value: {
      text: "Yoga in het voortgezet onderwijs, op het mbo en in het hoger onderwijs. In het eigen lokaal, zonder omkleden en zonder gymzaal, en zonder dat het zweverig wordt, want daar prikken ze binnen een minuut doorheen.",
    },
  },
  {
    page_key: "onderwijs",
    block_key: "knop",
    kind: "text",
    omschrijving: "Tekst op de knop naar het aanvraagformulier",
    value: { text: "Vraag een proefles aan" },
  },
  {
    page_key: "onderwijs",
    block_key: "knop_link",
    kind: "text" as const,
    omschrijving:
      "Waar die knop heen gaat. #aanvraag springt naar het formulier onderaan deze pagina",
    value: { text: "#aanvraag" },
  },
  {
    page_key: "onderwijs",
    block_key: "beeld",
    kind: "image",
    verbergbaar: true,
    omschrijving: "Sfeerbeeld boven aan de pagina",
    value: { url: "", alt: "" },
  },
  {
    page_key: "onderwijs",
    block_key: "verhaal",
    kind: "richtext",
    verbergbaar: true,
    omschrijving: "Vrije tekst onder het beeld",
    value: {
      html: "<p>Yoga hoeft er niet uit te zien zoals het op foto's staat. Wat een klas van vijftien nodig heeft is iets wat genoeg vraagt om de aandacht vast te houden, en daarna vijf minuten waarin er niets hoeft.</p><p>We werken met wat er is: een lokaal met de tafels aan de kant, de aula, of een collegezaal. Geen matten die niemand wil aanraken, geen kleedkamer, geen muziek die je toch niet mooi vindt.</p>",
    },
  },
  {
    page_key: "onderwijs",
    block_key: "doelgroepen_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de kaarten",
    value: { text: "Voor wie" },
  },
  {
    page_key: "onderwijs",
    block_key: "doelgroepen",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "kaart" },
    omschrijving:
      "De kaarten. Per kaart een kop en een tekst; zet 'ja' bij uitgelicht om er één te laten opvallen.",
    value: {
      items: [
        {
          titel: "Onderbouw voortgezet onderwijs",
          tekst:
            "Twaalf tot vijftien: veel prikkels, weinig taal om te zeggen wat er aan de hand is. We werken met houdingen die iets vrágen, want daar zit de aandacht vanzelf, en eindigen met vijf minuten liggen. In het mentoruur of aansluitend op gym.",
          uitgelicht: "",
        },
        {
          titel: "Examenklassen",
          tekst:
            "De weken vóór de toetsweek en het eindexamen. Ademhaling die je in een examenzaal kunt gebruiken, en een manier om je hoofd leeg te maken die niet 'even ontspannen' heet. Ook als los rustuur tijdens de examenweek.",
          uitgelicht: "",
        },
        {
          titel: "Mbo",
          tekst:
            "Bij zorg, techniek en bouw komt er iets fysieks bij: tillen, staan, herhaalde belasting. Daar gaat het over houding en beweeglijkheid, en over de spanning die stage met zich meebrengt.",
          uitgelicht: "",
        },
        {
          titel: "Hbo en universiteit",
          tekst:
            "Rond tentamenperiodes, in een welzijnsprogramma, of via een studievereniging. Groepen van vijfentwintig tot dertig, in een collegezaal of een lege werkruimte.",
          uitgelicht: "",
        },
        {
          titel: "Het docenten- en medewerkersteam",
          tekst:
            "Een uur op een studiedag, of een blok van zes weken na schooltijd. Het kost geen lestijd, dus de beslissing is kleiner. En wie het zelf heeft gedaan, gunt het zijn klas ook.",
          uitgelicht: "ja",
        },
      ],
    },
  },
  {
    page_key: "onderwijs",
    block_key: "praktisch_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de praktische regels",
    value: { text: "Hoe het gaat" },
  },
  {
    page_key: "onderwijs",
    block_key: "praktisch",
    kind: "richtext",
    lijst: { max: 10, itemNaam: "regel" },
    omschrijving: "Praktische regels: links het onderwerp, rechts de uitleg.",
    value: {
      items: [
        {
          titel: "Duur",
          tekst:
            "Eén lesuur. Veertig minuten werk, de rest is binnenkomen en weer opruimen.",
        },
        {
          titel: "Waar",
          tekst:
            "Het eigen lokaal met de tafels aan de kant, de aula, de gymzaal of een collegezaal. Wat er is.",
        },
        {
          titel: "Kleding",
          tekst:
            "Wat ze aanhebben. Schoenen uit. Niemand hoeft zich om te kleden; dat is precies de drempel waar de helft op afhaakt.",
        },
        {
          titel: "Telefoons",
          tekst:
            "In de tas. Ik neem ze niet in; dat is een afspraak tussen de docent en de klas, niet tussen mij en de klas.",
        },
        {
          titel: "De docent",
          tekst:
            "Blijft erbij en doet mee. Een klas die ziet dat een volwassene het ook onhandig vindt, doet zelf ook mee.",
        },
        {
          titel: "Groepsgrootte",
          tekst:
            "Eén klas, tot dertig. Grotere groepen splitsen we, anders zie ik niet wie er iets doet wat pijn gaat doen.",
        },
        {
          titel: "Een dagdeel",
          tekst:
            "Drie klassen achter elkaar op één ochtend, of vijf op een hele dag. Zo is ook de prijs opgebouwd: hoe meer klassen per bezoek, hoe lager de prijs per les.",
        },
      ],
    },
  },
  {
    page_key: "onderwijs",
    block_key: "vormen_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de tarieven",
    value: { text: "Wat het kost" },
  },
  {
    page_key: "onderwijs",
    block_key: "vormen_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "De prijs hangt aan het dagdeel, niet aan de les. Rijden en opbouwen kost meer tijd dan lesgeven, dus drie klassen op één ochtend is per klas een stuk voordeliger dan één losse les.",
    },
  },
  {
    page_key: "onderwijs",
    block_key: "vormen",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "vorm" },
    omschrijving:
      "De vormen met hun prijs. Per vorm: naam, duur, toelichting en bedrag.",
    value: {
      items: [
        {
          naam: "Bezoek met één les",
          duur: "45 tot 60 minuten",
          tekst:
            "Eén klas of groep. Alleen los te boeken als het niet anders kan; per les is dit de duurste vorm.",
          prijs: "€ 165 excl. btw · € 199,65 incl.",
          uitgelicht: "",
        },
        {
          naam: "Dagdeel: drie lessen",
          duur: "aaneengesloten, één ochtend",
          tekst:
            "Drie klassen achter elkaar. Dit is de vorm waar de prijs op is gebouwd: € 125 per les.",
          prijs: "€ 375 excl. btw · € 453,75 incl.",
          uitgelicht: "ja",
        },
        {
          naam: "Hele dag: vijf lessen",
          duur: "ochtend en middag",
          tekst:
            "Vijf klassen op één dag, € 115 per les. De voordeligste manier om een hele jaarlaag te bereiken.",
          prijs: "€ 575 excl. btw · € 695,75 incl.",
          uitgelicht: "",
        },
        {
          naam: "Examenweek-dagdeel",
          duur: "drie groepen van 75 minuten",
          tekst:
            "Ademhaling en Yin in de week zelf. Ook als los rustuur voor één examenklas, voor € 195 excl. btw.",
          prijs: "€ 495 excl. btw · € 598,95 incl.",
          uitgelicht: "",
        },
        {
          naam: "Studiedag voor het team",
          duur: "2 uur, tot 25 deelnemers",
          tekst:
            "‘Vertragen voor de klas’. Past in het scholingsbudget; een hele studiedag met twee groepen kost € 845 excl. btw.",
          prijs: "€ 495 excl. btw · € 598,95 incl.",
          uitgelicht: "",
        },
        {
          naam: "Medewerkersreeks",
          duur: "10 lessen na schooltijd, tot 15",
          tekst:
            "Wekelijks een uur voor docenten en ondersteunend personeel. € 155 per les.",
          prijs: "€ 1.550 excl. btw · € 1.875,50 incl.",
          uitgelicht: "",
        },
        {
          naam: "Jaarpartner",
          duur: "een heel schooljaar",
          tekst:
            "30 medewerkerslessen, een studiedag-workshop en een examenweek-dagdeel. Los zou dat € 5.640 kosten.",
          prijs: "€ 4.950 excl. btw · € 5.989,50 incl.",
          uitgelicht: "",
        },
      ],
    },
  },
  {
    page_key: "onderwijs",
    block_key: "vormen_voetnoot",
    kind: "text",
    verbergbaar: true,
    omschrijving: "De kleine letters onder de tarieven",
    value: {
      text: "Bedragen staan er twee keer bij omdat scholen de btw niet kunnen terugvragen: eerst exclusief, dan inclusief 21%. Inbegrepen tot één klas van 30 leerlingen, of een medewerkersgroep van 15. Matten en props nemen we mee. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer. Bij een reeks van zes bezoeken gaat er 5% af, bij tien bezoeken 10%.",
    },
  },
  {
    page_key: "onderwijs",
    block_key: "cta_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop van het afsluitende blok met het formulier",
    value: { text: "Een keer proberen?" },
  },
  {
    page_key: "onderwijs",
    block_key: "cta_tekst",
    kind: "text",
    omschrijving: "Tekst boven het aanvraagformulier",
    value: {
      text: "Vertel om hoeveel klassen of groepen het gaat en in welke periode het zou moeten vallen, dan stuur ik binnen twee werkdagen een voorstel met een prijs erin.",
    },
  },

  // ---------------------------------------------------------------------------
  // De dag na de wedstrijd
  // ---------------------------------------------------------------------------
  {
    page_key: "sportclubs",
    block_key: "label",
    kind: "text",
    omschrijving: "Kleine regel boven de kop",
    value: { text: "Voor sportclubs" },
  },
  {
    page_key: "sportclubs",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de pagina",
    value: { text: "De dag na de wedstrijd" },
  },
  {
    page_key: "sportclubs",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Zin onder de kop",
    value: {
      text: "Mobiliteit, herstel en ademhaling voor teams en individuele sporters. In de kantine, in de gymzaal of gewoon op het veld. Vijfenveertig minuten, na de training of op de hersteldag.",
    },
  },
  {
    page_key: "sportclubs",
    block_key: "knop",
    kind: "text",
    omschrijving: "Tekst op de knop naar het aanvraagformulier",
    value: { text: "Vraag een proefsessie aan" },
  },
  {
    page_key: "sportclubs",
    block_key: "knop_link",
    kind: "text" as const,
    omschrijving:
      "Waar die knop heen gaat. #aanvraag springt naar het formulier onderaan deze pagina",
    value: { text: "#aanvraag" },
  },
  {
    page_key: "sportclubs",
    block_key: "beeld",
    kind: "image",
    verbergbaar: true,
    omschrijving: "Sfeerbeeld boven aan de pagina",
    value: { url: "", alt: "" },
  },
  {
    page_key: "sportclubs",
    block_key: "verhaal",
    kind: "richtext",
    verbergbaar: true,
    omschrijving: "Vrije tekst onder het beeld",
    value: {
      html: "<p>Geen kaarsen, geen ohm. Wel werk aan de gewrichten die in jullie sport het meest vastlopen, en aan ademhaling die je onder druk kunt gebruiken.</p><p>Ik kom naar de club en werk met wat er is: de kantine, een zaal, of het veld als het droog is. Matten neem ik mee, maar op gras heb je ze niet eens nodig.</p>",
    },
  },
  {
    page_key: "sportclubs",
    block_key: "doelgroepen_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de kaarten",
    value: { text: "Waar het over gaat" },
  },
  {
    page_key: "sportclubs",
    block_key: "doelgroepen",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "kaart" },
    omschrijving:
      "De kaarten. Per kaart een kop en een tekst; zet 'ja' bij uitgelicht om er één te laten opvallen.",
    value: {
      items: [
        {
          titel: "Beweeglijkheid",
          tekst:
            "De gewrichten die in jullie sport het meest vastlopen. Bij voetbal en hockey zijn dat heupen en enkels, bij volleybal en handbal de schouders.",
          uitgelicht: "",
        },
        {
          titel: "Herstel",
          tekst:
            "Een rustige sessie de dag na een wedstrijd, gericht op weer soepel worden. Geen zware belasting erbovenop.",
          uitgelicht: "",
        },
        {
          titel: "Ademhaling en focus",
          tekst:
            "Rustiger worden op de bank, en terug bij de les komen na een tegendoelpunt. Dit is wat spelers zelf het vaakst noemen.",
          uitgelicht: "",
        },
      ],
    },
  },
  {
    page_key: "sportclubs",
    block_key: "praktisch_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de praktische regels",
    value: { text: "Voor welke groep" },
  },
  {
    page_key: "sportclubs",
    block_key: "praktisch",
    kind: "richtext",
    lijst: { max: 10, itemNaam: "regel" },
    omschrijving: "Praktische regels: links het onderwerp, rechts de uitleg.",
    value: {
      items: [
        {
          titel: "Een selectieteam",
          tekst:
            "Wekelijks in het seizoen, of een blok in de voorbereiding. Meestal aansluitend op de training, zodat niemand een extra avond kwijt is.",
        },
        {
          titel: "Jeugdteams",
          tekst:
            "Korter en speelser. Werkt goed op een zaterdagochtend, met ouders die kijken; dat levert vaak weer aanmeldingen voor de studio op.",
        },
        {
          titel: "Individuele sporters",
          tekst:
            "Hardlopers, wielrenners, tennissers. Een vaste groep uit de club, of een programma voor één iemand die ergens tegenaan loopt.",
        },
        {
          titel: "De trainersstaf",
          tekst:
            "Zij bepalen of het blijft. Een sessie met de trainers vóór je bij het team begint, is de beste investering van het hele traject.",
        },
      ],
    },
  },
  {
    page_key: "sportclubs",
    block_key: "vormen_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop boven de tarieven",
    value: { text: "Wat het kost" },
  },
  {
    page_key: "sportclubs",
    block_key: "vormen_inleiding",
    kind: "text",
    omschrijving: "Zin onder die kop",
    value: {
      text: "Per sessie of per blok. Veel clubs betalen dit uit het budget voor blessurepreventie of vanuit een sponsor; vraag ernaar bij je bestuur.",
    },
  },
  {
    page_key: "sportclubs",
    block_key: "vormen",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "vorm" },
    omschrijving:
      "De vormen met hun prijs. Per vorm: naam, duur, toelichting en bedrag.",
    value: {
      items: [
        {
          naam: "Kennismakingsclinic",
          duur: "60 minuten, tot 20 spelers",
          tekst:
            "Eén sessie met één team, zodat de trainer kan zien wat het is. Wordt verrekend bij een blok binnen drie maanden.",
          prijs: "€ 185 excl. btw · € 223,85 incl.",
          uitgelicht: "",
        },
        {
          naam: "Blok van 6 sessies",
          duur: "wekelijks, in de trainingsavond",
          tekst:
            "Kort genoeg om mee te beginnen, lang genoeg om verschil te merken. € 162,50 per sessie.",
          prijs: "€ 975 excl. btw · € 1.179,75 incl.",
          uitgelicht: "",
        },
        {
          naam: "Blok van 12 sessies",
          duur: "een halve competitie",
          tekst:
            "De helft van het seizoen, aansluitend op de training. € 150 per sessie.",
          prijs: "€ 1.800 excl. btw · € 2.178 incl.",
          uitgelicht: "ja",
        },
        {
          naam: "Heel seizoen: 30 sessies",
          duur: "augustus tot mei",
          tekst:
            "Vaste avond, vaste groep. € 145 per sessie; dat is onze ondergrens.",
          prijs: "€ 4.350 excl. btw · € 5.263,50 incl.",
          uitgelicht: "",
        },
        {
          naam: "Trainersworkshop",
          duur: "2 uur, tot 20 trainers",
          tekst:
            "Herstel en mobiliteit voor trainers en coaches. Sluit aan op ‘kwaliteit van het kader’ in het lokale sportakkoord.",
          prijs: "€ 450 excl. btw · € 544,50 incl.",
          uitgelicht: "",
        },
        {
          naam: "Open ledenles",
          duur: "vanaf 10 lessen, open inschrijving",
          tekst:
            "Voor alle leden in plaats van één team. Met een bijdrage van € 10 per deelnemer is de les voor de club kostenneutraal.",
          prijs: "€ 145 per les excl. btw · € 175,45 incl.",
          uitgelicht: "",
        },
        {
          naam: "Tweede team op dezelfde avond",
          duur: "aansluitend",
          tekst:
            "Geen extra reis, wel een extra lesuur. Bij elk blok en elk seizoenscontract.",
          prijs: "+ € 120 per sessie",
          uitgelicht: "",
        },
      ],
    },
  },
  {
    page_key: "sportclubs",
    block_key: "vormen_voetnoot",
    kind: "text",
    verbergbaar: true,
    omschrijving: "De kleine letters onder de tarieven",
    value: {
      text: "Bedragen staan er twee keer bij omdat de meeste clubs de btw niet kunnen terugvragen: eerst exclusief, dan inclusief 21%. Inbegrepen tot 20 deelnemers. Matten nemen we mee; op gras heb je ze niet eens nodig. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer.",
    },
  },
  {
    page_key: "sportclubs",
    block_key: "cta_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop van het afsluitende blok met het formulier",
    value: { text: "Een keer proberen?" },
  },
  {
    page_key: "sportclubs",
    block_key: "cta_tekst",
    kind: "text",
    omschrijving: "Tekst boven het aanvraagformulier",
    value: {
      text: "Laat weten om welk team het gaat en op welke avond jullie trainen, dan stuur ik binnen twee werkdagen een voorstel.",
    },
  },

  // ---------------------------------------------------------------------------
  // Portfolio
  //
  // De persoonlijke pagina van wie het bedrijf draagt. Anders dan "Over ons":
  // daar staat het verhaal van de studio, hier staat één loopbaan — wat iemand
  // heeft gedaan, geleerd en waar ze goed in is. Dat is wat een opleider of
  // een bedrijf wil lezen voordat ze iemand inhuren.
  //
  // Elke docent kan hetzelfde op zijn eigen pagina, met het bloktype
  // "portfolio" in src/content/docent-blokken.ts.
  // ---------------------------------------------------------------------------
  {
    page_key: "portfolio",
    block_key: "naam",
    kind: "text",
    omschrijving: "De naam boven aan het portfolio",
    value: { text: "Wietske Visser" },
  },
  {
    page_key: "portfolio",
    block_key: "rol",
    kind: "text",
    omschrijving: "De regel onder de naam",
    value: { text: "Oprichter en hoofddocent · YogaCompany" },
  },
  {
    page_key: "portfolio",
    block_key: "foto",
    kind: "image",
    verbergbaar: true,
    omschrijving: "Portretfoto",
    value: { url: "", alt: "", layout: "rechts" },
  },
  {
    page_key: "portfolio",
    block_key: "intro",
    kind: "richtext",
    omschrijving: "Het verhaal in een paar alinea's",
    value: {
      html: "<p>[Vertel hier in twee of drie alinea's wie je bent, hoe je bij yoga terecht bent gekomen en waar je voor staat. Schrijf het zoals je het aan iemand zou vertellen die tegenover je zit.]</p>",
    },
  },
  {
    page_key: "portfolio",
    block_key: "ervaring_titel",
    kind: "text",
    omschrijving: "Kop boven de werkervaring",
    value: { text: "Wat ik doe en heb gedaan" },
  },
  {
    page_key: "portfolio",
    block_key: "ervaring",
    kind: "richtext",
    lijst: { max: 14, itemNaam: "ervaring" },
    omschrijving:
      "De loopbaan, nieuwste bovenaan. Per regel: periode, wat je deed, waar, en een toelichting.",
    value: {
      items: [
        {
          periode: "[jaartal] tot heden",
          titel: "[Wat je doet]",
          waar: "[Waar]",
          tekst: "[Eén of twee zinnen over wat het inhoudt.]",
        },
        {
          periode: "[jaartal] tot [jaartal]",
          titel: "[Wat je deed]",
          waar: "[Waar]",
          tekst: "[Eén of twee zinnen.]",
        },
      ],
    },
  },
  {
    page_key: "portfolio",
    block_key: "opleiding_titel",
    kind: "text",
    omschrijving: "Kop boven de opleidingen",
    value: { text: "Opleidingen en certificeringen" },
  },
  {
    page_key: "portfolio",
    block_key: "opleidingen",
    kind: "richtext",
    lijst: { max: 16, itemNaam: "opleiding" },
    omschrijving: "Wat je hebt gevolgd. Per regel: jaartal, naam en instituut.",
    value: {
      items: [
        {
          jaar: "[jaartal]",
          titel: "[Naam van de opleiding]",
          instituut: "[Bij wie]",
        },
      ],
    },
  },
  {
    page_key: "portfolio",
    block_key: "specialisaties_titel",
    kind: "text",
    omschrijving: "Kop boven de specialisaties",
    value: { text: "Waar ik goed in ben" },
  },
  {
    page_key: "portfolio",
    block_key: "specialisaties",
    kind: "richtext",
    lijst: { max: 8, itemNaam: "specialisatie" },
    omschrijving: "Waar je je in hebt verdiept, met een korte toelichting.",
    value: {
      items: [
        {
          titel: "[Specialisatie]",
          tekst: "[Wat je ermee doet, en voor wie het iets oplevert.]",
        },
      ],
    },
  },
  {
    page_key: "portfolio",
    block_key: "cta_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kop van het afsluitende blok",
    value: { text: "Iets samen doen?" },
  },
  {
    page_key: "portfolio",
    block_key: "cta_tekst",
    kind: "text",
    omschrijving: "Tekst van het afsluitende blok",
    value: {
      text: "Voor lessen, een opleiding, yoga op de werkvloer of een samenwerking: laat het weten.",
    },
  },
  {
    page_key: "portfolio",
    block_key: "cta_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop onder deze oproep",
    value: { text: "Neem contact op" },
  },
  {
    page_key: "portfolio",
    block_key: "cta_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/contact" },
  },

  // ---------------------------------------------------------------------------
  // Overzichtspagina's
  // ---------------------------------------------------------------------------
  {
    page_key: "opleidingen",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de opleidingenpagina",
    value: { text: "Yoga Company Academy" },
  },
  {
    page_key: "opleidingen",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Inleidende tekst boven het overzicht",
    value: {
      text: "Opleidingen die je stap voor stap opbouwt, in kleine groepen, met een certificaat per module.",
    },
  },
  {
    page_key: "opleidingen",
    block_key: "beeld",
    kind: "image",
    omschrijving: "Sfeerbeeld boven het overzicht",
    value: {
      url: "/beeld/opleidingen-zaal.jpg",
      alt: "Een zaal met yogamatten en blokken klaargelegd, zonder deelnemers",
    },
  },
  {
    page_key: "lessen",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de lessenpagina",
    value: { text: "Yogalessen" },
  },
  {
    page_key: "lessen",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Inleidende tekst boven het weekrooster",
    value: {
      text: "Wekelijkse lessen in kleine groepen. Kijk wanneer het je uitkomt en boek je plek; met een account gaat dat in één klik.",
    },
  },
  {
    page_key: "lessen",
    block_key: "beeld",
    kind: "image",
    omschrijving: "Sfeerbeeld boven het weekrooster",
    value: {
      url: "/beeld/lessen-studio.jpg",
      alt: "Een rustige ruimte met een houten bank, twee zitkussens en een rond raam",
    },
  },
  {
    page_key: "trainingen",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de trainingenpagina",
    value: { text: "Trainingen" },
  },
  {
    page_key: "trainingen",
    block_key: "beeld",
    kind: "image",
    omschrijving: "Sfeerbeeld boven het overzicht",
    value: {
      url: "/beeld/trainingen-blad.jpg",
      alt: "De schaduw van een plant op een lichte muur",
    },
  },
  {
    page_key: "trainingen",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Inleidende tekst boven het overzicht",
    value: {
      text: "Kortere programma's, gericht op één onderwerp. Online of in de studio.",
    },
  },

  // ---------------------------------------------------------------------------
  // Over ons (§8.4)
  // ---------------------------------------------------------------------------
  {
    page_key: "over-ons",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de over-onspagina",
    value: { text: "Over YogaCompany" },
  },
  {
    page_key: "over-ons",
    block_key: "verhaal",
    kind: "richtext",
    omschrijving: "Het verhaal en de filosofie",
    value: {
      html: "<p>YogaCompany is een opleidingsinstituut voor yoga. We leiden op, we trainen, en we geven les, in die volgorde van nadruk.</p><p>Wat ons bindt is een manier van kijken: yoga is geen prestatie. Een houding die er goed uitziet zegt niets als het lichaam eronder gespannen blijft. We leren onze deelnemers kijken naar de mens tegenover hen, niet naar de vorm.</p><p>Daarom werken we in kleine groepen. Daarom duren onze opleidingen langer dan strikt nodig. En daarom kun je onze modules los volgen: niet iedereen heeft hetzelfde tempo, en dat hoeft ook niet.</p>",
    },
  },
  {
    page_key: "over-ons",
    block_key: "beeld",
    kind: "image",
    omschrijving: "Sfeerbeeld boven het verhaal",
    verbergbaar: true,
    value: { url: "", alt: "", layout: "onder" },
  },
  {
    page_key: "over-ons",
    block_key: "cta_titel",
    kind: "text" as const,
    omschrijving: "Kop van de oproep onderaan de pagina",
    value: { text: "Benieuwd of het klikt?" },
  },
  {
    page_key: "over-ons",
    block_key: "cta_tekst",
    kind: "text" as const,
    omschrijving: "Tekst bij de oproep onderaan de pagina",
    value: {
      text: "De beste manier om erachter te komen is het gesprek. Stel je vraag; we reageren meestal binnen twee werkdagen.",
    },
  },
  {
    page_key: "over-ons",
    block_key: "cta_knop",
    kind: "text" as const,
    omschrijving: "Tekst op de knop onder deze oproep",
    value: { text: "Neem contact op" },
  },
  {
    page_key: "over-ons",
    block_key: "cta_link",
    kind: "text" as const,
    omschrijving: "Waar die knop heen gaat",
    value: { text: "/contact" },
  },
  {
    page_key: "over-ons",
    block_key: "docenten",
    lijst: { max: 12, itemNaam: "docent" },
    kind: "richtext",
    omschrijving: "Korte bio's van de docenten",
    value: {
      items: [
        {
          naam: "Naam volgt",
          rol: "Oprichter en hoofddocent",
          bio: "Korte biografie volgt.",
          foto: "",
        },
        {
          naam: "Naam volgt",
          rol: "Docent",
          bio: "Korte biografie volgt.",
          foto: "",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Contact (§8.5)
  // ---------------------------------------------------------------------------
  {
    page_key: "contact",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de contactpagina",
    value: { text: "Contact" },
  },
  {
    page_key: "contact",
    block_key: "inleiding",
    kind: "text",
    omschrijving: "Tekst boven het formulier",
    value: {
      text: "Een vraag over een opleiding, of wil je even overleggen wat past? Stuur ons een bericht; we reageren meestal binnen twee werkdagen.",
    },
  },
  {
    page_key: "contact",
    block_key: "gegevens",
    lijst: { max: 8, itemNaam: "gegeven" },
    kind: "richtext",
    omschrijving: "Contactgegevens naast het formulier",
    value: {
      items: [
        { label: "E-mail", waarde: "info@yogacompany.eu" },
        { label: "Telefoon", waarde: "Telefoonnummer volgt" },
        { label: "Studio", waarde: "Adres volgt" },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Paginavoet
  // ---------------------------------------------------------------------------
  {
    page_key: "footer",
    block_key: "over",
    kind: "text",
    omschrijving: "Korte zin over YogaCompany in de paginavoet",
    value: {
      text: "Opleidingsinstituut voor yoga. Opleidingen, trainingen en yogalessen.",
    },
  },
  {
    page_key: "footer",
    block_key: "partners_titel",
    kind: "text",
    verbergbaar: true,
    omschrijving: "Kopje boven de partners in de paginavoet",
    value: { text: "Samenwerkingen en partners" },
  },
  {
    page_key: "footer",
    block_key: "partners",
    lijst: { max: 12, itemNaam: "partner" },
    kind: "richtext",
    verbergbaar: true,
    omschrijving:
      "Partners en samenwerkingen onder aan elke pagina. Per partner: naam, logo en het webadres. Zonder logo toont hij de naam als tekst; zonder webadres wordt het geen link. Laat de lijst leeg en het hele blok blijft weg.",
    value: {
      items: [{ naam: "", logo: "", website: "" }],
    },
  },
  {
    page_key: "footer",
    block_key: "bedrijfsgegevens",
    lijst: { max: 6, itemNaam: "gegeven" },
    kind: "richtext",
    omschrijving: "E-mail, KvK en btw-nummer in de paginavoet",
    value: {
      items: [
        { label: "E-mail", waarde: "info@yogacompany.eu" },
        { label: "KvK", waarde: "KvK-nummer volgt" },
      ],
    },
  },

  ...juridischeBlokken,
  ...veiligheidBlokken,
  ...tarievenBlokken,
  ...docentenBlokken,
  ...yogaopleidingBlokken,
  ...cursusBlokken,
];

/** Alle blokken van één pagina, als kaart van block_key naar waarde. */
export function blokkenVanPagina(pageKey: string) {
  const kaart = new Map<string, BlokWaarde>();
  for (const blok of BLOKKEN) {
    if (blok.page_key === pageKey) kaart.set(blok.block_key, blok.value);
  }
  return kaart;
}
