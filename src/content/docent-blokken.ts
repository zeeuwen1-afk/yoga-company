/**
 * De bloktypen waaruit een docent zijn pagina samenstelt.
 *
 * Dit is het scharnier van het hele ontwerp. De lijst hieronder ligt vast in
 * code en groeit alleen als er iemand een bloktype bíjbouwt. Wélke blokken een
 * docent kiest, hoe vaak en in welke volgorde — dat is data.
 *
 * Zo blijft de vrijheid begrensd: een docent kan geen eigen HTML plaatsen, geen
 * scripts, geen kleuren kiezen en geen blok verzinnen dat de pagina niet kent.
 * De huisstijl blijft heel en de pagina kan niet stukgaan door een verkeerde
 * klik.
 *
 * Twee bloktypen zijn `vast`: hun inhoud komt uit de database en is niet te
 * typen. Dat is geen betutteling maar een afspraak die anders sneuvelt —
 * jullie moeten je aan de prijzen van de studio houden, en een met de hand
 * bijgehouden rooster loopt binnen een maand achter op de werkelijkheid.
 */

export type VeldSoort = "regel" | "tekst" | "richtext" | "beeld" | "lijst";

export type BlokVeld = {
  naam: string;
  label: string;
  soort: VeldSoort;
  /** Korte uitleg onder het veld, waar dat helpt. */
  hulp?: string;
  /** Alleen bij `lijst`: welke velden elk item heeft. */
  velden?: { naam: string; label: string; soort: "regel" | "tekst" }[];
};

export type Bloktype = {
  type: string;
  naam: string;
  omschrijving: string;
  /** Inhoud komt uit de database; alleen de kop erboven is te typen. */
  vast: boolean;
  /**
   * Verplicht, altijd op de eerste plaats, niet te verbergen of te
   * verplaatsen. Draagt de naam van de docent en de H1 van de pagina.
   */
  verankerd?: boolean;
  velden: BlokVeld[];
  start: Record<string, string | { url: string; alt: string } | unknown[]>;
};

export const BLOKTYPEN: Bloktype[] = [
  {
    type: "kop_portret",
    naam: "Kop met portret",
    omschrijving:
      "Het eerste wat een bezoeker ziet: je gezicht, je naam en één zin. Mensen kiezen een docent, niet een studio.",
    vast: false,
    verankerd: true,
    velden: [
      {
        naam: "bovenkop",
        label: "Kleine regel bovenaan",
        soort: "regel",
        hulp: "Bijvoorbeeld: Yin & Restorative · Rinske Yoga Almere",
      },
      { naam: "titel", label: "Grote kop", soort: "regel" },
      { naam: "zin", label: "Eén zin eronder", soort: "tekst" },
      { naam: "portret", label: "Portretfoto", soort: "beeld" },
      {
        naam: "knop_een",
        label: "Tekst op de eerste knop",
        soort: "regel",
        hulp: "Leidt naar het rooster. Laat leeg om hem weg te laten.",
      },
      {
        naam: "knop_twee",
        label: "Tekst op de tweede knop",
        soort: "regel",
        hulp: "Leidt naar de tarieven.",
      },
    ],
    start: {
      bovenkop: "Yogadocent · Rinske Yoga Almere",
      titel: "Vul hier je kop in",
      zin: "Schrijf in één of twee zinnen wat iemand bij jou komt halen.",
      portret: { url: "", alt: "" },
      knop_een: "Boek een les",
      knop_twee: "Bekijk de tarieven",
    },
  },
  {
    type: "mijn_lessen",
    naam: "Mijn lessen",
    omschrijving:
      "Je eigen lessen uit het rooster, met het aantal vrije plekken erbij. Je hoeft niets bij te houden.",
    vast: true,
    velden: [
      { naam: "kop", label: "Kop boven dit blok", soort: "regel" },
      {
        naam: "weken",
        label: "Hoeveel weken vooruit",
        soort: "regel",
        hulp: "Een getal van 1 tot 4.",
      },
    ],
    start: { kop: "Mijn lessen deze week", weken: "1" },
  },
  {
    type: "over_mij",
    naam: "Over mij",
    omschrijving:
      "Een foto naast je verhaal. Waarom je lesgeeft, en wat iemand aan je heeft.",
    vast: false,
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "foto", label: "Foto", soort: "beeld" },
      { naam: "verhaal", label: "Je verhaal", soort: "richtext" },
    ],
    start: {
      kop: "Over mij",
      foto: { url: "", alt: "" },
      verhaal:
        "<p>Vertel hier hoe je bent gaan lesgeven, en wat je belangrijk vindt in een les.</p>",
    },
  },
  {
    type: "wat_het_kost",
    naam: "Wat het kost",
    omschrijving:
      "De tarieven van de studio. Die liggen vast, dus je kunt ze hier niet aanpassen — wel verplaatsen of weglaten.",
    vast: true,
    velden: [
      { naam: "kop", label: "Kop boven dit blok", soort: "regel" },
      { naam: "toelichting", label: "Zin eronder", soort: "tekst" },
    ],
    start: {
      kop: "Wat het kost",
      toelichting:
        "Een kaart geldt bij alle docenten die bij deze studio lesgeven.",
    },
  },
  {
    type: "tekst",
    naam: "Tekstblok",
    omschrijving: "Een kop met vrije tekst eronder.",
    vast: false,
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "tekst", label: "Tekst", soort: "richtext" },
    ],
    start: { kop: "Een kop", tekst: "<p>Je tekst.</p>" },
  },
  {
    type: "beeld",
    naam: "Foto",
    omschrijving: "Eén foto over de volle breedte, met een bijschrift.",
    vast: false,
    velden: [
      { naam: "foto", label: "Foto", soort: "beeld" },
      { naam: "bijschrift", label: "Bijschrift", soort: "regel" },
    ],
    start: { foto: { url: "", alt: "" }, bijschrift: "" },
  },
  {
    type: "citaat",
    naam: "Ervaring van een cursist",
    omschrijving:
      "Eén uitspraak, groot. Vraag toestemming voordat je iemands woorden op je pagina zet.",
    vast: false,
    velden: [
      { naam: "citaat", label: "Wat iemand zei", soort: "tekst" },
      {
        naam: "wie",
        label: "Van wie",
        soort: "regel",
        hulp: "Alleen een voornaam is genoeg.",
      },
    ],
    start: {
      citaat: "Hier komt wat een cursist over je lessen zei.",
      wie: "Voornaam, sinds jaartal",
    },
  },
  {
    type: "video",
    naam: "Video",
    omschrijving:
      "Een video van YouTube of Vimeo. Andere aanbieders weigert de browser — dat is een beveiligingsregel van de site.",
    vast: false,
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      {
        naam: "url",
        label: "Webadres van de video",
        soort: "regel",
        hulp: "Een link van youtube.com of vimeo.com.",
      },
    ],
    start: { kop: "", url: "" },
  },
  {
    type: "vraag_antwoord",
    naam: "Veelgestelde vragen",
    omschrijving: "Drie tot zes vragen met een antwoord dat openklapt.",
    vast: false,
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      {
        naam: "vragen",
        label: "De vragen",
        soort: "lijst",
        velden: [
          { naam: "vraag", label: "Vraag", soort: "regel" },
          { naam: "antwoord", label: "Antwoord", soort: "tekst" },
        ],
      },
    ],
    start: {
      kop: "Veelgestelde vragen",
      vragen: [
        { vraag: "Moet ik ervaring hebben?", antwoord: "Nee." },
        { vraag: "Wat neem ik mee?", antwoord: "Makkelijke kleding." },
        { vraag: "Hoe boek ik een les?", antwoord: "Via de knop bovenaan." },
      ],
    },
  },
  {
    type: "contact",
    naam: "Contact",
    omschrijving: "Hoe iemand je bereikt.",
    vast: false,
    velden: [
      { naam: "kop", label: "Kop", soort: "regel" },
      { naam: "email", label: "E-mailadres", soort: "regel" },
      { naam: "telefoon", label: "Telefoonnummer", soort: "regel" },
      {
        naam: "instagram",
        label: "Instagram",
        soort: "regel",
        hulp: "Alleen je gebruikersnaam, zonder @.",
      },
    ],
    start: { kop: "Even contact?", email: "", telefoon: "", instagram: "" },
  },
];

export function bloktype(type: string): Bloktype | undefined {
  return BLOKTYPEN.find((b) => b.type === type);
}

/**
 * Waarmee een nieuwe pagina begint.
 *
 * Bewust niet leeg: een leeg scherm met "voeg een blok toe" levert een pagina
 * op die maanden half af blijft. Dit is een werkende pagina waar alleen de
 * teksten nog in moeten.
 */
export const SJABLOON = [
  "kop_portret",
  "mijn_lessen",
  "over_mij",
  "wat_het_kost",
  "citaat",
] as const;

/** De bloktypen die een docent zelf mag toevoegen (de kop staat er al). */
export const TOE_TE_VOEGEN = BLOKTYPEN.filter((b) => !b.verankerd);
