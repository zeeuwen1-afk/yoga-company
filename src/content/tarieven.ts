/**
 * De tarievenpagina onder Lessen (§8.2), en de producten van het
 * strippenkaartsysteem.
 *
 * Deze twee stonden ooit aan elkaar vast: wat op de pagina stond wás wat de
 * software verkocht. Sinds de samenwerking met Rinske Yoga niet doorgaat is dat
 * niet meer waar, en het is ook niet meer wenselijk.
 *
 * Wietske geeft les bij yogascholen. De lesprijs zit daar in het abonnement van
 * die school; zij verkoopt daar niets. Wat ze wél zelf verkoopt is korter:
 * workshops en privéyoga. De pagina is daarom geen prijslijst meer maar een
 * wegwijzer, met drie losse lijsten die de beheerder zelf aanvult.
 *
 * De prijzen van andere scholen staan er bewust niet op. Die veranderen zonder
 * dat wij het weten, en dan staat er iets onwaars op onze site. Een link naar
 * hun eigen pagina blijft altijd kloppen.
 *
 * Onderaan staat het productgedeelte voor het strippenkaartsysteem. Dat blijft
 * volledig bestaan — kaarten, saldo, kruisgebruik, verrekening — het wordt
 * alleen nergens meer publiek aangeboden. Zodra er een eigen ruimte of een
 * nieuwe school komt, staat het klaar.
 */

export const TARIEVEN_TITEL = "Lessen, workshops en privéyoga";

export const TARIEVEN_OMSCHRIJVING =
  "Wat een les, workshop of privésessie bij YogaCompany kost, en waar je je aanmeldt.";

export const TARIEVEN_INLEIDING = `Wat het kost hangt ervan af waar je meedoet.

Bij een yogaschool loopt het via hun tarief: je meldt je daar aan en betaalt daar. Wat ik zelf aanbied staat eronder, met de prijs erbij.`;

/** Een les die Wietske bij een yogaschool geeft. De school bepaalt de prijs. */
export type Lesplek = {
  les: string;
  school: string;
  wanneer: string;
  website: string;
};

export const LESPLEKKEN_TITEL = "Waar ik lesgeef";

export const LESPLEKKEN_INLEIDING = `Je meldt je aan bij de school zelf. Daar loopt ook de betaling: via hun abonnement, strippenkaart of losse les.

YogaCompany brengt hiervoor niets in rekening.`;

/**
 * Leeg bij oplevering. Zodra er lesplekken bekend zijn vult de beheerder ze in
 * de site-editor; tot die tijd blijft de hele sectie weg van de pagina.
 */
export const LESPLEKKEN: Lesplek[] = [
  { les: "", school: "", wanneer: "", website: "" },
];

/** Iets wat Wietske zelf verkoopt: een workshop of een privéles. */
export type Aanbod = {
  naam: string;
  duur: string;
  prijs: string;
  toelichting: string;
};

export const WORKSHOPS_TITEL = "Workshops";

export const WORKSHOPS: Aanbod[] = [
  {
    naam: "Yin & ademhaling",
    duur: "2 uur",
    prijs: "€ 35",
    toelichting: "Per persoon, in een kleine groep.",
  },
  {
    naam: "Verdieping: zenuwstelsel en herstel",
    duur: "3 uur",
    prijs: "€ 47,50",
    toelichting: "Per persoon. Ook geschikt als bijscholing voor docenten.",
  },
  {
    naam: "Workshop op locatie, besloten groep",
    duur: "2 uur",
    prijs: "vanaf € 275",
    toelichting: "Tot twaalf deelnemers, op aanvraag. Reiskosten in overleg.",
  },
];

export const PRIVE_TITEL = "Privéyoga";

export const PRIVE_INLEIDING = `Alleen of met z'n tweeën, bij jou thuis of op een rustige plek.

Maximaal twee personen, en dat is een keuze: bij privéyoga kijk ik mee en corrigeer ik waar het nodig is. Bij drie mensen kan dat niet meer, en dan is het een gewone les met minder deelnemers.`;

export const PRIVE: Aanbod[] = [
  {
    naam: "Privéles, 1 persoon",
    duur: "60 minuten",
    prijs: "€ 75",
    toelichting: "",
  },
  {
    naam: "Privéles, 1 persoon",
    duur: "90 minuten",
    prijs: "€ 105",
    toelichting: "",
  },
  {
    naam: "Duo, 2 personen",
    duur: "60 minuten",
    prijs: "€ 95",
    toelichting: "€ 47,50 per persoon.",
  },
  {
    naam: "Serie van 5 privélessen",
    duur: "5 × 60 minuten",
    prijs: "€ 340",
    toelichting: "€ 68 per les. Een half jaar geldig.",
  },
];

export const PRIVE_VOETNOOT =
  "Binnen Almere zijn reiskosten inbegrepen. Daarbuiten reken ik € 0,23 per kilometer, vooraf afgesproken.";

export const ORGANISATIES_TITEL = "Voor bedrijven, sportclubs en onderwijs";

export const ORGANISATIES_TEKST = `Voor organisaties gelden aparte tarieven, afgestemd op de groep en het aantal sessies.

Die staan op de pagina's zelf.`;

/**
 * De vorm van een regel op de oude prijslijst.
 *
 * Het aanvraagscherm van het strippenkaartsysteem leest hier nog mee: het haalt
 * de kaart op uit het blok `tarieven` en toont naam, toelichting en bedrag. Dat
 * blok staat er niet meer, dus dat scherm vindt niets en geeft netjes een 404.
 *
 * Het type blijft staan omdat het scherm blijft staan. Komt er ooit weer een
 * eigen aanbod van kaarten, dan hoeft alleen het blok terug.
 */
export type Tarief = {
  naam: string;
  toelichting: string;
  prijs: string;
  per_les: string;
  geldig: string;
  uitgelicht: string;
  rail: string;
};

export const TARIEVEN_VOORWAARDEN = `
<h3>Afspraken</h3>
<ul>
  <li>Een privéles of workshop is definitief zodra je een bevestiging per e-mail hebt.</li>
  <li>Afzeggen kan kosteloos tot 24 uur van tevoren. Daarna breng ik de sessie in rekening, omdat de tijd dan niet meer te vullen is.</li>
  <li>Word ik ziek, dan verplaatsen we of je krijgt je geld terug. Jouw keuze.</li>
  <li>Voor lessen bij een yogaschool gelden de voorwaarden van die school.</li>
</ul>
`;

/**
 * De producten van het strippenkaartsysteem, als getallen (§ docentenlaag).
 *
 * Dit is waar de database mee rekent: het saldo van een kaart, de
 * geldigheidsduur, en het bedrag dat een collega factureert wanneer de kaart
 * bij hém wordt gebruikt.
 *
 * Deze lijst stond ooit één op één naast de prijslijst hierboven, en een test
 * hield ze gelijk. Sinds de tarievenpagina iets anders toont dan wat de
 * software verkoopt, is die koppeling losgelaten: de test bewaakt nu de
 * verrekening zelf, en niet meer of twee lijsten dezelfde namen hebben.
 *
 * Er is op dit moment geen enkele kaart verkocht en de producten worden nergens
 * publiek aangeboden. Ze blijven staan omdat er een portaal, een
 * docentenoverzicht en een betaalkoppeling aan hangen die werken, en die je niet
 * opnieuw wilt bouwen zodra er een eigen ruimte of een nieuwe school komt.
 *
 * De verrekenwaarde is EXCLUSIEF btw. De prijs die de klant betaalt is
 * inclusief 9% — het tarief voor yogalessen — en die btw draagt de uitgevende
 * docent af. Zou de collega het brutobedrag factureren, dan betaalt de
 * uitgever meer terug dan hij overhield.
 */
export type Product = {
  id: string;
  naam: string;
  /** Leeg bij een abonnement: dat kent geen aftellend saldo. */
  aantal_lessen: number | null;
  /** Wat de klant betaalt, inclusief 9% btw. */
  prijs_centen: number;
  /** Wat een collega factureert bij kruisgebruik, exclusief btw. */
  verrekenwaarde_centen: number | null;
  geldigheid_dagen: number | null;
  uitloop_dagen: number;
  kruisgebruik_toegestaan: boolean;
  max_kruislessen_per_maand: number | null;
};

/** De studio waar dit aanbod geldt. Vaste id, zodat de seed herhaalbaar is. */
export const STUDIO = {
  id: "0a5e1c40-0000-4000-8000-000000000001",
  naam: "Rinske Yoga Almere",
  plaats: "Almere",
  /** Acht matten. De vangrail onder de capaciteit van een les. */
  max_deelnemers: 8,
} as const;

export const PRODUCTEN: Product[] = [
  {
    id: "0a5e1c40-0000-4000-8000-000000000101",
    naam: "Snuffelkaart",
    aantal_lessen: 3,
    prijs_centen: 900,
    // Geen kruisgebruik: een kennismakingskaart is een investering in je eigen
    // klant. Zou hij wel meedoen, dan betaalt de uitgever € 43,50 terug op een
    // kaart van € 9,00.
    verrekenwaarde_centen: null,
    geldigheid_dagen: 30,
    uitloop_dagen: 0,
    kruisgebruik_toegestaan: false,
    max_kruislessen_per_maand: null,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000102",
    naam: "Losse les",
    aantal_lessen: 1,
    prijs_centen: 1700,
    verrekenwaarde_centen: 1560,
    geldigheid_dagen: null,
    uitloop_dagen: 0,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: null,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000103",
    naam: "3-strippenkaart",
    aantal_lessen: 3,
    prijs_centen: 4750,
    verrekenwaarde_centen: 1453,
    geldigheid_dagen: 30,
    uitloop_dagen: 15,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: null,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000104",
    naam: "10-strippenkaart",
    aantal_lessen: 10,
    prijs_centen: 14500,
    verrekenwaarde_centen: 1330,
    geldigheid_dagen: 90,
    uitloop_dagen: 30,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: null,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000105",
    naam: "20-strippenkaart",
    aantal_lessen: 20,
    prijs_centen: 28000,
    verrekenwaarde_centen: 1284,
    geldigheid_dagen: 180,
    uitloop_dagen: 30,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: null,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000106",
    naam: "Maandabonnement",
    aantal_lessen: null,
    prijs_centen: 5850,
    verrekenwaarde_centen: 1239,
    geldigheid_dagen: 30,
    uitloop_dagen: 0,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: 2,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000107",
    naam: "Kwartaalabonnement",
    aantal_lessen: null,
    prijs_centen: 16900,
    verrekenwaarde_centen: 1193,
    geldigheid_dagen: 90,
    uitloop_dagen: 0,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: 2,
  },
  {
    id: "0a5e1c40-0000-4000-8000-000000000108",
    naam: "Halfjaarabonnement",
    aantal_lessen: null,
    prijs_centen: 31600,
    verrekenwaarde_centen: 1115,
    geldigheid_dagen: 180,
    uitloop_dagen: 0,
    kruisgebruik_toegestaan: true,
    max_kruislessen_per_maand: 2,
  },
];

/** Een bedrag in centen als "€ 145,00" — zoals het op de tarievenpagina staat. */
export function alsBedrag(centen: number): string {
  return `€ ${(centen / 100).toFixed(2).replace(".", ",")}`;
}
