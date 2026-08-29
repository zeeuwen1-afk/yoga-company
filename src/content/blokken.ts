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
  TARIEVEN,
  TARIEVEN_INLEIDING,
  TARIEVEN_LOCATIE,
  TARIEVEN_RAIL_TITEL,
  TARIEVEN_RAIL_VOET,
  TARIEVEN_TITEL,
  TARIEVEN_VOORWAARDEN,
} from "./tarieven.ts";

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
    block_key: "locatie",
    kind: "text" as const,
    omschrijving: "Regel boven de kop, met de plaats waar de lessen zijn",
    value: { text: TARIEVEN_LOCATIE },
  },
  {
    page_key: "tarieven",
    block_key: "inleiding",
    kind: "text" as const,
    omschrijving: "Inleidende zin onder de kop",
    value: { text: TARIEVEN_INLEIDING },
  },
  {
    page_key: "tarieven",
    block_key: "tarieven",
    kind: "richtext" as const,
    omschrijving:
      'De prijslijst. "In zijbalkje" op ja zet de regel ook naast het weekrooster (houd het op vier); "Uitgelicht" op ja geeft één regel de nadruk.',
    value: { items: TARIEVEN as unknown as Record<string, string>[] },
  },
  {
    page_key: "tarieven",
    block_key: "voorwaarden",
    kind: "richtext" as const,
    omschrijving: "De spelregels onder de tabel: reserveren en annuleren",
    value: { html: TARIEVEN_VOORWAARDEN },
  },
  {
    page_key: "tarieven",
    block_key: "rail_titel",
    kind: "text" as const,
    omschrijving: "Kop van het zijbalkje naast het weekrooster",
    value: { text: TARIEVEN_RAIL_TITEL },
  },
  {
    page_key: "tarieven",
    block_key: "rail_voet",
    kind: "text" as const,
    omschrijving: "Zinnetje onderaan het zijbalkje",
    value: { text: TARIEVEN_RAIL_VOET },
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
    omschrijving: "Tekst op de eerste knop in de hero — leidt naar het rooster",
    value: { text: "Bekijk het lesrooster" },
  },
  {
    page_key: "home",
    block_key: "hero_knop_twee",
    kind: "text",
    omschrijving:
      "Tekst op de tweede knop in de hero — leidt naar de opleidingen",
    value: { text: "Ontdek de opleidingen" },
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
      text: "Drie manieren om met ons te werken — elk met een eigen tempo, en een eigen prijs.",
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
    block_key: "kaarten_titel",
    kind: "text",
    omschrijving: "Kop van het blok met strippenkaarten",
    value: { text: "Nog geen kaart?" },
  },
  {
    page_key: "home",
    block_key: "kaarten_inleiding",
    kind: "text",
    omschrijving: "Zin in het blok met strippenkaarten",
    value: {
      text: "Je kaart staat meteen in je eigen omgeving en je saldo loopt vanzelf mee.",
    },
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
          prijs: "Vanaf [prijs per dagdeel]",
          knop: "Bekijk bedrijfsyoga",
          href: "/bedrijfsyoga",
        },
        {
          label: "Sportclubs",
          titel: "De dag na de wedstrijd",
          tekst:
            "Mobiliteit, herstel en ademhaling voor teams en individuele sporters. In de kantine of op het veld, na de training.",
          prijs: "Vanaf [prijs per sessie]",
          knop: "Bekijk yoga bij je club",
          href: "/sportclubs",
        },
        {
          label: "Onderwijs",
          titel: "Een lesuur waarin het stil wordt",
          tekst:
            "Voortgezet onderwijs, mbo, hbo en universiteit. In het mentoruur, vóór de examenweek, of voor het team dat er de hele week staat.",
          prijs: "Vanaf [prijs per dagdeel]",
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
      html: "<p>Mensen die de hele dag in hun hoofd zitten, merken pas dat ze gespannen zijn als het al te veel is. Een uur per week op de mat verandert dat: even niet presteren, wél merken wat er in je lijf gebeurt.</p><p>We werken met wat er is — een vergaderzaal, een kantine, een hoek van het magazijn — en met mensen die nog nooit yoga hebben gedaan. Geen ingewikkelde houdingen, geen kleedkamer nodig.</p>",
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
          naam: "Wekelijkse les op locatie",
          duur: "45 tot 60 minuten",
          tekst:
            "Een vast moment in de week, in jullie eigen ruimte. Matten nemen we mee. Vanaf acht deelnemers loont het om met twee groepen te werken.",
          prijs: "[prijs per les invullen]",
        },
        {
          naam: "Workshop op een teamdag",
          duur: "90 minuten tot een dagdeel",
          tekst:
            "Een losse sessie rond ademhaling, spanning en herstel. Werkt goed als onderbreking van een dag vol praten.",
          prijs: "[prijs invullen]",
        },
        {
          naam: "Programma rond werkdruk",
          duur: "8 weken",
          tekst:
            "Wekelijkse lessen met een opbouw, plus materiaal om zelf mee verder te gaan. Ook geschikt als onderdeel van een verzuimtraject.",
          prijs: "[prijs invullen]",
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
      text: "Yoga in het voortgezet onderwijs, op het mbo en in het hoger onderwijs. In het eigen lokaal, zonder omkleden en zonder gymzaal — en zonder dat het zweverig wordt, want daar prikken ze binnen een minuut doorheen.",
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
            "Twaalf tot vijftien: veel prikkels, weinig taal om te zeggen wat er aan de hand is. We werken met houdingen die iets vrágen — daar zit de aandacht vanzelf — en eindigen met vijf minuten liggen. In het mentoruur of aansluitend op gym.",
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
            "Een uur op een studiedag, of een blok van zes weken na schooltijd. Het kost geen lestijd, dus de beslissing is kleiner — en wie het zelf heeft gedaan, gunt het zijn klas ook.",
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
            "Wat ze aanhebben. Schoenen uit. Niemand hoeft zich om te kleden — dat is precies de drempel waar de helft op afhaakt.",
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
            "Eén klas, tot dertig. Grotere groepen splitsen we — anders zie ik niet wie er iets doet wat pijn gaat doen.",
        },
        {
          titel: "Een dagdeel",
          tekst:
            "Drie tot vier klassen achter elkaar. Zo is ook de prijs opgebouwd.",
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
          naam: "Kennismaking",
          duur: "één dagdeel",
          tekst:
            "Twee klassen naar keuze. Om te zien of het bij jullie school past — en of de klas meedoet.",
          prijs: "[bedrag]",
          uitgelicht: "",
        },
        {
          naam: "Blok van zes weken",
          duur: "zes dagdelen",
          tekst:
            "Eén dagdeel per week tussen twee vakanties, drie tot vier klassen per keer. Past op de jaarplanning en op één factuur.",
          prijs: "[bedrag per dagdeel]",
          uitgelicht: "ja",
        },
        {
          naam: "Rustuur in de examenweek",
          duur: "één dagdeel",
          tekst:
            "Open inloop tijdens de toets- of examenweek. Leerlingen komen tussen twee vakken door binnenlopen.",
          prijs: "[bedrag]",
          uitgelicht: "",
        },
        {
          naam: "Voor het team",
          duur: "een uur of zes bijeenkomsten",
          tekst:
            "Op een studiedag of na schooltijd. Meestal uit een ander budget dan de lessen — vaak dat voor duurzame inzetbaarheid.",
          prijs: "[bedrag]",
          uitgelicht: "",
        },
        {
          naam: "Docenten opleiden",
          duur: "drie bijeenkomsten",
          tekst:
            "Mentoren leren het zelf te geven, met een werkboek per persoon. Daarna kunnen ze het zonder mij.",
          prijs: "[bedrag]",
          uitgelicht: "",
        },
      ],
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
      text: "Vertel om hoeveel klassen of groepen het gaat en in welke periode het zou moeten vallen — dan stuur ik binnen twee werkdagen een voorstel met een prijs erin.",
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
            "Korter en speelser. Werkt goed op een zaterdagochtend, met ouders die kijken — dat levert vaak weer aanmeldingen voor de studio op.",
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
      text: "Per sessie of per blok. Veel clubs betalen dit uit het budget voor blessurepreventie of vanuit een sponsor — vraag ernaar bij je bestuur.",
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
          naam: "Proefsessie",
          duur: "45 minuten",
          tekst:
            "Eén sessie met één team. Zonder verplichting, zodat de trainer kan zien wat het is.",
          prijs: "[bedrag]",
          uitgelicht: "",
        },
        {
          naam: "Seizoensblok",
          duur: "tien sessies",
          tekst:
            "Wekelijks of om de week. Eén factuur aan de club, of verdeeld over de spelers.",
          prijs: "[bedrag]",
          uitgelicht: "ja",
        },
        {
          naam: "Clubjaar",
          duur: "vast dagdeel per week",
          tekst:
            "Meerdere teams door het seizoen heen. Maandelijkse factuur, voorspelbaar in jullie begroting.",
          prijs: "[bedrag per maand]",
          uitgelicht: "",
        },
      ],
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
      text: "Laat weten om welk team het gaat en op welke avond jullie trainen — dan stuur ik binnen twee werkdagen een voorstel.",
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
    value: { url: "", alt: "" },
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
          periode: "[jaartal] — heden",
          titel: "[Wat je doet]",
          waar: "[Waar]",
          tekst: "[Eén of twee zinnen over wat het inhoudt.]",
        },
        {
          periode: "[jaartal] — [jaartal]",
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
      text: "Voor lessen, een opleiding, yoga op de werkvloer of een samenwerking — laat het weten.",
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
    block_key: "beeld",
    kind: "image",
    omschrijving: "Sfeerbeeld boven het verhaal",
    verbergbaar: true,
    value: { url: "", alt: "" },
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
      text: "Een vraag over een opleiding, of wil je even overleggen wat past? Stuur ons een bericht — we reageren meestal binnen twee werkdagen.",
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
];

/** Alle blokken van één pagina, als kaart van block_key naar waarde. */
export function blokkenVanPagina(pageKey: string) {
  const kaart = new Map<string, BlokWaarde>();
  for (const blok of BLOKKEN) {
    if (blok.page_key === pageKey) kaart.set(blok.block_key, blok.value);
  }
  return kaart;
}
