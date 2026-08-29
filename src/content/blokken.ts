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
