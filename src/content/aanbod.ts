import type { CourseType } from "@/lib/supabase/types";

/**
 * Het aanbod van YogaCompany (BOUWPROMPT §19).
 *
 * Dit bestand is de bron van waarheid voor de startinhoud. Twee dingen komen
 * hiervandaan:
 *
 *   1. `pnpm db:generate-seed` zet het om naar `supabase/seed.sql`
 *   2. de publieke site valt hierop terug zolang de database nog leeg is
 *
 * Zodra het aanbod in de database staat, is die leidend: de admin beheert het
 * daar en deze bestanden raken buiten beeld.
 */

export type CurriculumBlok = {
  titel: string;
  onderdelen: string[];
};

export type CurriculumModule = {
  nummer: number;
  titel: string;
  uren: number;
  samenvatting: string;
  blokken: CurriculumBlok[];
};

export type ContentItemSeed = {
  kind: "video" | "pdf" | "tekst";
  titel: string;
  storage_path?: string;
  body?: string;
  is_preview?: boolean;
};

export type LesSeed = { titel: string; items: ContentItemSeed[] };
export type ModuleSeed = { titel: string; lessen: LesSeed[] };

export type CursusSeed = {
  type: CourseType;
  titel: string;
  slug: string;
  samenvatting: string;
  beschrijving: string;
  voorWie?: string;
  toelatingseisen?: string;
  curriculum?: CurriculumModule[];
  studiebelasting?: string;
  locatie?: string;
  maxDeelnemers?: number;
  certificaat?: string;
  prijsCenten: number;
  digitaleContent: boolean;
  lesmateriaal?: ModuleSeed[];
  sort: number;
};

// -----------------------------------------------------------------------------
// Het curriculum van de 200-uurs opleiding: vier modules van 50 uur.
// -----------------------------------------------------------------------------
const yinCurriculum: CurriculumModule[] = [
  {
    nummer: 1,
    titel: "De basis van Yin Yoga",
    uren: 50,
    samenvatting:
      "Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen.",
    blokken: [
      {
        titel: "Fundamenten van yin en yang",
        onderdelen: [
          "Het onderscheid tussen yin en yang in beweging en in rust",
          "Waar de vorm vandaan komt en welke visie eronder ligt",
        ],
      },
      {
        titel: "Basisprincipes",
        onderdelen: [
          "De drie principes van een yin-houding",
          "Tijd, diepte en de rol van stilte",
          "Hulpmiddelen inzetten voor verschillende lichamen",
        ],
      },
      {
        titel: "Houdingen en hun werking",
        onderdelen: [
          "De kernhoudingen en hun varianten",
          "Werking op bindweefsel, gewrichten en botten",
          "Anatomische verschillen en wat die betekenen voor je lesgeven",
        ],
      },
    ],
  },
  {
    nummer: 2,
    titel: "Het zenuwstelsel & de basis van de meridiaanleer",
    uren: 50,
    samenvatting:
      "Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen.",
    blokken: [
      {
        titel: "Het zenuwstelsel",
        onderdelen: [
          "Sympathisch en parasympathisch: spanning en herstel",
          "Wat langdurige stress met het lichaam doet",
          "Hoe een yin-les het herstelvermogen aanspreekt",
        ],
      },
      {
        titel: "Basis van de meridiaanleer",
        onderdelen: [
          "Wat meridianen zijn en hoe ze zijn geordend",
          "De verbinding tussen houding en meridiaan",
          "Eerste toepassing in het opbouwen van een les",
        ],
      },
    ],
  },
  {
    nummer: 3,
    titel: "Chinese geneeskunde en Yin Yoga",
    uren: 50,
    samenvatting: "Werken met meridianen, de vijf elementen en de orgaanklok.",
    blokken: [
      {
        titel: "Werken met meridianen",
        onderdelen: [
          "De meridianen in de praktijk van een yin-les",
          "Houdingen kiezen op basis van wat iemand nodig heeft",
        ],
      },
      {
        titel: "De elementen",
        onderdelen: [
          "De vijf elementen en hun onderlinge samenhang",
          "Seizoenen en wat ze vragen",
        ],
      },
      {
        titel: "De orgaanklok",
        onderdelen: [
          "Het ritme van de dag en de organen",
          "Een les afstemmen op tijd en seizoen",
        ],
      },
    ],
  },
  {
    nummer: 4,
    titel: "Herstel & revalidatie",
    uren: 50,
    samenvatting:
      "Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken.",
    blokken: [
      {
        titel: "Kennis integreren",
        onderdelen: [
          "De vier modules samenbrengen in één werkwijze",
          "Kijken naar de mens tegenover je, niet naar de houding",
        ],
      },
      {
        titel: "Herstel en revalidatie",
        onderdelen: [
          "Yin Yoga bij overbelasting, blessures en langdurige klachten",
          "Grenzen van je vak: wanneer je doorverwijst",
        ],
      },
      {
        titel: "Persoonlijke lessen maken",
        onderdelen: [
          "Een programma opbouwen voor één persoon",
          "Begeleiden, bijstellen en opvolgen",
        ],
      },
    ],
  },
];

const MODULE_LOCATIE = "Studio van YogaCompany (adres volgt)";
const MODULE_STUDIEBELASTING =
  "Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht";

/**
 * Prijsstelling uit §6 van de bouwprompt: € 795 per losse module, € 2.795 voor
 * de volledige opleiding. Vier losse modules kosten samen € 3.180, dus de
 * bundel scheelt € 385. Die korting wordt op de overzichtspagina getoond en
 * hier berekend, zodat hij nooit uit de pas kan lopen met de prijzen.
 */
export const MODULE_PRIJS_CENTEN = 79500;
/** De 200-uurs Yogaopleiding: per blok van 100 uur, en de hele opleiding. */
export const BLOK_PRIJS_CENTEN = 149500;
export const OPLEIDING_PRIJS_CENTEN = 279500;
export const OPLEIDING_KORTING_CENTEN =
  MODULE_PRIJS_CENTEN * 4 - OPLEIDING_PRIJS_CENTEN;

/** De vier losse modules, elk apart te volgen (BOUWPROMPT §19). */
const losseModules: CursusSeed[] = yinCurriculum.map((module, index) => ({
  type: "opleiding" as const,
  titel: `Yin Yoga niveau ${module.nummer}: ${module.titel}`,
  slug: [
    "yin-niveau-1-basis",
    "yin-niveau-2-zenuwstelsel-meridiaanleer",
    "yin-niveau-3-chinese-geneeskunde",
    "yin-niveau-4-herstel-revalidatie",
  ][index]!,
  samenvatting: `${module.samenvatting} Module ${module.nummer} van 50 uur, af te sluiten met het certificaat Yin Yoga niveau ${module.nummer}.`,
  beschrijving: `Module ${module.nummer} van de 200-uurs Yin Yoga Specialist Opleiding, ook los te volgen.\n\n${module.samenvatting}\n\nJe sluit de module af met het certificaat **Yin Yoga niveau ${module.nummer}**. Volg je alle vier de modules, dan ontvang je het diploma Yin Yoga Specialist.`,
  voorWie:
    "Yogadocenten en professionals die zich willen verdiepen, en mensen die deze module als losse verdieping willen volgen.",
  toelatingseisen:
    module.nummer === 1
      ? "Geen vooropleiding vereist. Ervaring met yoga is prettig, maar geen voorwaarde."
      : `Afronding van module ${module.nummer - 1}, of een vergelijkbare basis in overleg.`,
  curriculum: [module],
  studiebelasting: MODULE_STUDIEBELASTING,
  locatie: MODULE_LOCATIE,
  maxDeelnemers: 12,
  certificaat: `Certificaat Yin Yoga niveau ${module.nummer}`,
  prijsCenten: MODULE_PRIJS_CENTEN,
  digitaleContent: false,
  sort: 10 + module.nummer,
}));

// -----------------------------------------------------------------------------
// Eerst Jij — 8 weken, met digitaal lesmateriaal
// -----------------------------------------------------------------------------
const eerstJijLesmateriaal: ModuleSeed[] = Array.from(
  { length: 8 },
  (_, index) => {
    const week = index + 1;
    return {
      titel: `Week ${week}`,
      lessen: [
        {
          titel: `Week ${week}`,
          items: [
            {
              kind: "video" as const,
              titel: `Weekvideo ${week}`,
              storage_path: `eerst-jij/week-${week}/weekvideo.mp4`,
              is_preview: week === 1,
            },
            {
              kind: "video" as const,
              titel: `Yogavideo week ${week}`,
              storage_path: `eerst-jij/week-${week}/yogavideo.mp4`,
            },
            {
              kind: "pdf" as const,
              titel: `Schrijfopdracht week ${week}`,
              storage_path: `eerst-jij/week-${week}/schrijfopdracht.pdf`,
            },
          ],
        },
      ],
    };
  },
);

/**
 * De 200-uurs Yogaopleiding: de producten waar de inschrijfknoppen heen wijzen.
 *
 * De pagina's zelf zijn CMS-pagina's onder /opleidingen/200-uurs-yogaopleiding;
 * dit zijn alleen de dingen die je kunt kópen. Vandaar de korte beschrijvingen:
 * wie hier komt heeft de pagina al gelezen.
 *
 * Module 3 en 4 staan hier bewust niet bij. Dat zijn dezelfde modules als
 * niveau 1 en 2 van de Yin Yoga Specialist Opleiding, en die bestaan al. Twee
 * producten voor één module zou de administratie laten liegen over wat er is
 * verkocht, en de deelnemer twee keer hetzelfde certificaat opleveren.
 */
const yogaopleidingProducten: CursusSeed[] = [
  {
    type: "opleiding",
    titel: "200-uurs Yogaopleiding",
    slug: "200-uurs-yogaopleiding",
    samenvatting:
      "Vier modules van 50 uur: Hatha en Vinyasa, anatomie en filosofie, Yin Yoga en het zenuwstelsel. Inclusief praktijkexamen en het diploma Yogadocent 200 uur.",
    beschrijving:
      "De volledige 200-uurs Yogaopleiding: alle vier de modules, het praktijkexamen en de eindopdracht.\n\nJe studeert af als docent die zowel een krachtige Vinyasa-flow kan geven als een verstilde Yin-les kan begeleiden.\n\nDe volledige opleiding kost € 2.795 in plaats van 4 × € 795; je bespaart € 385.",
    voorWie:
      "Toegewijde beoefenaars die docent willen worden, en yogadocenten die hun basis willen verbreden met de stille kant van yoga.",
    toelatingseisen:
      "± 1 jaar regelmatige yoga-ervaring aanbevolen. Een eerdere docentenopleiding is niet nodig.",
    studiebelasting: "200 uur, verdeeld over vier modules van 50 uur",
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 14,
    certificaat:
      "Certificaat per module; diploma Yogadocent 200 uur na alle vier de modules en het praktijkexamen",
    prijsCenten: OPLEIDING_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 2,
  },
  {
    type: "opleiding",
    titel: "Module 1 — Hatha & Vinyasa",
    slug: "yogaopleiding-module-1-hatha-vinyasa",
    samenvatting:
      "50 uur · de actieve basis van de 200-uurs Yogaopleiding. Houdingen en uitlijning, vloeiende sequenties en je eerste les.",
    beschrijving:
      "Module 1 van de 200-uurs Yogaopleiding, ook los te volgen.\n\nJe verdiept je eigen praktijk, leert de belangrijkste houdingen en uitlijningsprincipes van Hatha Yoga, bouwt vloeiende Vinyasa-sequenties en zet je eerste stappen als docent.\n\nJe ontvangt het certificaat Hatha & Vinyasa — 50 uur.",
    voorWie:
      "Iedereen met regelmatige yoga-ervaring, en docenten die hun actieve praktijk willen aanscherpen.",
    toelatingseisen: "Een vooropleiding is niet nodig.",
    studiebelasting: MODULE_STUDIEBELASTING,
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 14,
    certificaat: "Certificaat Hatha & Vinyasa — 50 uur",
    prijsCenten: MODULE_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 20,
  },
  {
    type: "opleiding",
    titel: "Module 2 — Anatomie, Filosofie & Meditatie",
    slug: "yogaopleiding-module-2-anatomie-filosofie-meditatie",
    samenvatting:
      "50 uur · het fundament onder de praktijk. Anatomie om veilig les te geven, de filosofie van yoga en het begeleiden van meditatie en pranayama.",
    beschrijving:
      "Module 2 van de 200-uurs Yogaopleiding, ook los te volgen.\n\nHoe het lichaam werkt, waar yoga vandaan komt en hoe je de stille technieken zelf beoefent en begeleidt.\n\nJe ontvangt het certificaat Anatomie, Filosofie & Meditatie — 50 uur.",
    voorWie:
      "Iedereen met regelmatige yoga-ervaring, en docenten die hun anatomische en filosofische basis willen versterken.",
    toelatingseisen: "Een vooropleiding is niet nodig.",
    studiebelasting: MODULE_STUDIEBELASTING,
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 14,
    certificaat: "Certificaat Anatomie, Filosofie & Meditatie — 50 uur",
    prijsCenten: MODULE_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 21,
  },
  {
    type: "opleiding",
    titel: "Blok A — De actieve basis",
    slug: "yogaopleiding-blok-a",
    samenvatting:
      "100 uur · module 1 en 2 samen. € 1.495 in plaats van € 1.590; je bespaart € 95.",
    beschrijving:
      "Blok A van de 200-uurs Yogaopleiding: module 1 (Hatha & Vinyasa) en module 2 (Anatomie, Filosofie & Meditatie) samen, 100 uur.\n\nJe ontvangt het certificaat van beide modules.",
    voorWie:
      "Wie de actieve basis in één keer wil doen, zonder zich meteen aan de volledige opleiding te binden.",
    toelatingseisen: "Een vooropleiding is niet nodig.",
    studiebelasting: "100 uur, verdeeld over twee modules van 50 uur",
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 14,
    certificaat: "Certificaat per module",
    prijsCenten: BLOK_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 22,
  },
  {
    type: "opleiding",
    titel: "Blok B — De stille verdieping",
    slug: "yogaopleiding-blok-b",
    samenvatting:
      "100 uur · module 3 en 4 samen. € 1.495 in plaats van € 1.590; je bespaart € 95.",
    beschrijving:
      "Blok B van de 200-uurs Yogaopleiding: module 3 (Yin Yoga & het lichaam) en module 4 (Zenuwstelsel & basis meridianen) samen, 100 uur.\n\nDeze twee modules zijn identiek aan niveau 1 en 2 van de Yin Yoga Specialist Opleiding en tellen daarvoor mee.",
    voorWie:
      "Wie de stille kant van yoga in één keer wil doen, en docenten die Yin aan hun aanbod willen toevoegen.",
    toelatingseisen:
      "Na module 1 + 2, óf rechtstreeks voor ervaren beoefenaars en yogadocenten (na intake).",
    studiebelasting: "100 uur, verdeeld over twee modules van 50 uur",
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 14,
    certificaat: "Certificaat per module",
    prijsCenten: BLOK_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 23,
  },
];

/**
 * De YogaCompany Academie: welke opleidingen er zijn, en welke losse modules en
 * blokken daaronder vallen.
 *
 * Zonder deze indeling wordt het overzicht een lijst van tien losse kaarten
 * waarin een module van 50 uur er net zo uitziet als een opleiding van 200 uur.
 * De bezoeker moet in één blik zien wat de opleidingen zijn en wat de losse
 * onderdelen ervan zijn.
 *
 * Wat hier niet in staat verschijnt gewoon onderaan als los aanbod, dus een
 * nieuwe cursus raakt nooit zoek.
 */
export const ACADEMIE: { opleiding: string; onderdelen: string[] }[] = [
  {
    opleiding: "200-uurs-yogaopleiding",
    onderdelen: [
      "yogaopleiding-module-1-hatha-vinyasa",
      "yogaopleiding-module-2-anatomie-filosofie-meditatie",
      "yogaopleiding-blok-a",
      "yin-niveau-1-basis",
      "yin-niveau-2-zenuwstelsel-meridiaanleer",
      "yogaopleiding-blok-b",
    ],
  },
  {
    opleiding: "200-uurs-yin-yoga-specialist",
    onderdelen: [
      "yin-niveau-1-basis",
      "yin-niveau-2-zenuwstelsel-meridiaanleer",
      "yin-niveau-3-chinese-geneeskunde",
      "yin-niveau-4-herstel-revalidatie",
    ],
  },
];

/** Het pad naar de eigen pagina van een opleiding, als die er een heeft. */
export const EIGEN_PAGINA: Record<string, string> = {
  "200-uurs-yogaopleiding": "/opleidingen/200-uurs-yogaopleiding",
};

export const AANBOD: CursusSeed[] = [
  {
    type: "opleiding",
    titel: "200-uurs Yin Yoga Specialist Opleiding",
    slug: "200-uurs-yin-yoga-specialist",
    samenvatting:
      "Vier modules van 50 uur, van de basis van Yin Yoga naar specialist in herstel en revalidatie. Per module een certificaat Yin Yoga niveau 1 t/m 4; na alle vier de modules het diploma Yin Yoga Specialist.",
    beschrijving:
      "De 200-uurs Yin Yoga Specialist Opleiding brengt je van de fundamenten van Yin Yoga naar het punt waarop je de vorm kunt inzetten bij herstel en revalidatie.\n\nDe opleiding bestaat uit vier modules van elk 50 uur. Je volgt ze achter elkaar of verspreid over een langere periode; de modules zijn ook los te volgen. Elke module sluit je af met een certificaat. Rond je alle vier af, dan ontvang je het diploma Yin Yoga Specialist.\n\nWe werken in kleine groepen van maximaal twaalf deelnemers. Dat is een bewuste keuze: je krijgt persoonlijke begeleiding en er is ruimte om te oefenen met echte mensen en echte lichamen.",
    voorWie:
      "Yogadocenten die zich willen specialiseren, professionals in zorg en beweging die Yin Yoga in hun werk willen inzetten, en mensen die zich vanuit persoonlijke interesse grondig willen verdiepen.",
    toelatingseisen:
      "Voor module 1 is geen vooropleiding vereist. Ervaring met yoga is prettig, maar geen voorwaarde. Wil je lesgeven, dan is een afgeronde basisopleiding tot yogadocent aan te raden.",
    curriculum: yinCurriculum,
    studiebelasting: MODULE_STUDIEBELASTING,
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 12,
    certificaat:
      "Certificaat Yin Yoga niveau 1 t/m 4 per module; diploma Yin Yoga Specialist na alle vier de modules. Modules zijn ook los te volgen",
    prijsCenten: OPLEIDING_PRIJS_CENTEN,
    digitaleContent: false,
    sort: 1,
  },
  ...losseModules,
  ...yogaopleidingProducten,
  {
    type: "training",
    titel: "Eerst Jij: 8-weeks online herstelprogramma",
    slug: "eerst-jij",
    samenvatting:
      "Acht weken online, in je eigen tempo, met begeleiding. Voor wie leeg is en weer wil opbouwen: stap voor stap, zonder te forceren.",
    beschrijving:
      "Eerst Jij is een programma van acht weken voor mensen die op zijn. Uitgeput, oververmoeid, of hersteld verklaard maar nog lang niet de oude.\n\nElke week krijg je een korte video, een yogales die past bij waar je op dat moment staat, en een schrijfopdracht. Je doet het online, in je eigen tempo, thuis. In de begeleide variant kun je je vragen kwijt en kijken we samen mee.\n\nHet programma gaat langzaam. Dat is geen tekortkoming maar het uitgangspunt: herstel laat zich niet opjagen.",
    voorWie:
      "Voor jezelf, als je merkt dat je energie op is en je niet weet waar je moet beginnen. Ook geschikt als je werkgever meedenkt over duurzame inzetbaarheid.",
    studiebelasting:
      "Acht weken, ongeveer twee uur per week. In je eigen tempo te volgen.",
    locatie: "Online",
    certificaat: "Geen certificering; dit is een persoonlijk programma.",
    prijsCenten: 79700,
    digitaleContent: true,
    lesmateriaal: eerstJijLesmateriaal,
    sort: 20,
  },
  {
    type: "training",
    titel: "Hormoonyoga-training",
    slug: "hormoonyoga",
    samenvatting:
      "Een praktische training in hormoonyoga: houdingen, ademhaling en ritme, afgestemd op wat het lichaam in verschillende levensfasen vraagt.",
    beschrijving:
      "In deze training leer je hoe je met houdingen, ademhaling en ritme kunt werken aan hormonale balans.\n\nWe kijken naar wat het lichaam in verschillende levensfasen nodig heeft en hoe je daar in een les rekening mee houdt. Praktijkgericht: je oefent zelf en leert de opbouw kennen die je daarna kunt toepassen.",
    voorWie:
      "Yogadocenten die hun aanbod willen verbreden, en mensen die hormoonyoga voor zichzelf willen leren.",
    studiebelasting: "Zie de lesdata; neem gerust contact op voor de planning.",
    locatie: MODULE_LOCATIE,
    maxDeelnemers: 12,
    prijsCenten: 29500,
    digitaleContent: false,
    sort: 21,
  },
];

/** Zoek een cursus op slug in de terugvalcontent. */
export function vindCursus(slug: string) {
  return AANBOD.find((cursus) => cursus.slug === slug);
}
