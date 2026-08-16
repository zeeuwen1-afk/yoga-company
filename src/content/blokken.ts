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
  | { url: string; alt: string }
  | { items: Record<string, string>[] };

export type BlokSeed = {
  page_key: string;
  block_key: string;
  kind: BlockKind;
  value: BlokWaarde;
  /** Waar dit blok op de pagina staat — hulp voor de site-editor. */
  omschrijving: string;
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
    value: {
      text: "Deze tekst is een concept en moet nog juridisch worden getoetst.",
    },
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
      omschrijving: `Vraag ${index + 1} — de tekst op de uitklapper`,
      value: { text: sectie.vraag },
    },
    {
      page_key: "veiligheid",
      block_key: `sectie_${index + 1}_antwoord`,
      kind: "richtext" as const,
      omschrijving: `Antwoord ${index + 1} — wat er onder de uitklapper staat`,
      value: { html: sectie.antwoord },
    },
  ]),
];

export const BLOKKEN: BlokSeed[] = [
  // ---------------------------------------------------------------------------
  // Landingspagina (§8.1)
  // ---------------------------------------------------------------------------
  {
    page_key: "home",
    block_key: "hero_titel",
    kind: "text",
    omschrijving: "Grote kop bovenaan de startpagina",
    value: { text: "YogaCompany — opleidingsinstituut voor yoga" },
  },
  {
    page_key: "home",
    block_key: "hero_subtitel",
    kind: "text",
    omschrijving: "Zin onder de grote kop",
    value: {
      text: "Opleidingen, trainingen en yogalessen. Deskundig en betrouwbaar, warm en persoonlijk.",
    },
  },
  {
    page_key: "home",
    block_key: "hero_knop",
    kind: "text",
    omschrijving: "Tekst op de knop in de hero",
    value: { text: "Bekijk de opleidingen" },
  },
  {
    page_key: "home",
    block_key: "hero_beeld",
    kind: "image",
    omschrijving: "Foto naast de hero",
    value: {
      url: "/beeld/hero-vloer.jpg",
      alt: "Zonlicht valt door een raam op een houten vloer",
    },
  },

  {
    page_key: "home",
    block_key: "zakelijk_titel",
    kind: "text",
    omschrijving: "Kop van het zakelijke propositieblok",
    value: { text: "Voor je vak" },
  },
  {
    page_key: "home",
    block_key: "zakelijk_tekst",
    kind: "richtext",
    omschrijving: "Tekst van het zakelijke propositieblok",
    value: {
      html: "<p>Specialiseren in een vorm die je aanvult in plaats van uitput. Onze opleidingen zijn praktijkgericht en erkend met een certificaat per module, zodat je stap voor stap kunt bouwen.</p><p>Ook voor werkgevers die willen investeren in duurzame inzetbaarheid van hun mensen.</p>",
    },
  },
  {
    page_key: "home",
    block_key: "persoonlijk_titel",
    kind: "text",
    omschrijving: "Kop van het persoonlijke propositieblok",
    value: { text: "Voor jezelf" },
  },
  {
    page_key: "home",
    block_key: "persoonlijk_tekst",
    kind: "richtext",
    omschrijving: "Tekst van het persoonlijke propositieblok",
    value: {
      html: "<p>Soms is het je eigen lichaam dat om aandacht vraagt. Herstel na een periode van te veel, terugvinden van balans, of gewoon verdieping omdat je nieuwsgierig bent.</p><p>Je hoeft geen doel te hebben om te beginnen.</p>",
    },
  },

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
    block_key: "testimonials",
    kind: "richtext",
    omschrijving: "Drie ervaringen van deelnemers",
    value: {
      items: [
        {
          citaat:
            "Voor het eerst een opleiding waar het tempo klopte met wat ik aankon.",
          naam: "Deelnemer — naam volgt",
          rol: "Yin Yoga niveau 1 en 2",
        },
        {
          citaat:
            "De kleine groep maakte het verschil. Er was echt tijd voor mijn vragen.",
          naam: "Deelnemer — naam volgt",
          rol: "200-uurs Yin Yoga Specialist",
        },
        {
          citaat:
            "Ik kwam binnen als deelnemer en ging weg met een manier van kijken.",
          naam: "Deelnemer — naam volgt",
          rol: "Eerst Jij",
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

  // ---------------------------------------------------------------------------
  // Overzichtspagina's
  // ---------------------------------------------------------------------------
  {
    page_key: "opleidingen",
    block_key: "titel",
    kind: "text",
    omschrijving: "Kop van de opleidingenpagina",
    value: { text: "Opleidingen" },
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
      text: "Wekelijkse lessen in kleine groepen. Kijk wanneer het je uitkomt en boek je plek — met een account gaat dat in één klik.",
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
      html: "<p>YogaCompany is een opleidingsinstituut voor yoga. We leiden op, we trainen, en we geven les — in die volgorde van nadruk.</p><p>Wat ons bindt is een manier van kijken: yoga is geen prestatie. Een houding die er goed uitziet zegt niets als het lichaam eronder gespannen blijft. We leren onze deelnemers kijken naar de mens tegenover hen, niet naar de vorm.</p><p>Daarom werken we in kleine groepen. Daarom duren onze opleidingen langer dan strikt nodig. En daarom kun je onze modules los volgen: niet iedereen heeft hetzelfde tempo, en dat hoeft ook niet.</p>",
    },
  },
  {
    page_key: "over-ons",
    block_key: "docenten",
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
      text: "Een vraag over een opleiding, of wil je even overleggen wat past? Stuur ons een bericht — we reageren meestal binnen twee werkdagen.",
    },
  },
  {
    page_key: "contact",
    block_key: "gegevens",
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
    block_key: "bedrijfsgegevens",
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
];

/** Alle blokken van één pagina, als kaart van block_key naar waarde. */
export function blokkenVanPagina(pageKey: string) {
  const kaart = new Map<string, BlokWaarde>();
  for (const blok of BLOKKEN) {
    if (blok.page_key === pageKey) kaart.set(blok.block_key, blok.value);
  }
  return kaart;
}
