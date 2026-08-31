/**
 * De tarievenpagina onder Lessen (§8.2).
 *
 * Eén lijst is de bron voor twee plekken: de volledige tabel op
 * `/lessen/tarieven`, en het zijbalkje naast het weekrooster op `/lessen`.
 * Dat is bewust zo — twee lijsten die hetzelfde horen te zeggen lopen na de
 * eerste prijswijziging uit elkaar.
 *
 * Welke regels waar verschijnen bepaalt de beheerder met twee velden:
 *
 *   `rail`       — "ja" zet de regel ook in het zijbalkje. Houd het op vier;
 *                  meer past er niet naast het rooster.
 *   `uitgelicht` — "ja" geeft de regel de nadruk en het label "Meest gekozen".
 *                  Bedoeld voor één regel.
 *
 * Allebei zijn het gewone tekstvelden in plaats van vinkjes, omdat de
 * site-editor die nog niet kent. Alles behalve "ja" telt als nee.
 *
 * De bedragen zijn door Pieter vastgesteld; ze staan hier als startinhoud en
 * zijn daarna zonder uitrol aan te passen via de site-editor (§14).
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

export const TARIEVEN_TITEL = "Tarieven";

export const TARIEVEN_OMSCHRIJVING =
  "Lessen Rinske Yoga Almere: losse lessen, strippenkaarten en abonnementen voor de yogalessen van YogaCompany.";

export const TARIEVEN_LOCATIE = "Lessen Rinske Yoga, Almere";

export const TARIEVEN_INLEIDING =
  "Alle kaarten naast elkaar. Hoe meer lessen op je kaart, hoe voordeliger je per keer uit bent; dat staat in de derde kolom, zodat je het niet zelf hoeft uit te rekenen.";

export const TARIEVEN: Tarief[] = [
  {
    naam: "Snuffelkaart",
    toelichting: "3 lessen, om kennis te maken",
    prijs: "€ 9,00",
    per_les: "€ 3,00",
    geldig: "n.v.t.",
    uitgelicht: "",
    rail: "",
  },
  {
    naam: "Losse les",
    toelichting: "Eén les, zonder verplichting",
    prijs: "€ 17,00",
    per_les: "€ 17,00",
    geldig: "n.v.t.",
    uitgelicht: "",
    rail: "ja",
  },
  {
    naam: "3-strippenkaart",
    toelichting: "3 lessen",
    prijs: "€ 47,50",
    per_les: "€ 15,83",
    geldig: "1 maand, uitloop tot 1½",
    uitgelicht: "",
    rail: "ja",
  },
  {
    naam: "10-strippenkaart",
    toelichting: "10 lessen",
    prijs: "€ 145,00",
    per_les: "€ 14,50",
    geldig: "3 maanden, uitloop tot 4",
    uitgelicht: "ja",
    rail: "ja",
  },
  {
    naam: "20-strippenkaart",
    toelichting: "20 lessen",
    prijs: "€ 280,00",
    per_les: "€ 14,00",
    geldig: "6 maanden, uitloop tot 7",
    uitgelicht: "",
    rail: "ja",
  },
  {
    naam: "Maandabonnement",
    toelichting: "1× per week",
    prijs: "€ 58,50",
    per_les: "± € 13,50",
    geldig: "opzegtermijn 1 maand",
    uitgelicht: "",
    rail: "",
  },
  {
    naam: "Kwartaalabonnement",
    toelichting: "1× per week",
    prijs: "€ 169,00",
    per_les: "± € 13,00",
    geldig: "3 maanden",
    uitgelicht: "",
    rail: "",
  },
  {
    naam: "Halfjaarabonnement",
    toelichting: "1× per week",
    prijs: "€ 316,00",
    per_les: "± € 12,15",
    geldig: "6 maanden",
    uitgelicht: "",
    rail: "",
  },
];

export const TARIEVEN_VOORWAARDEN = `
<p>Reserveer je plek vooraf; een kaart geeft toegang tot alle lessen in het weekrooster. Tot <strong>24 uur</strong> voor de les annuleren is kosteloos; daarna kost het een strip.</p>
<p>Lukt het een keer echt niet, laat het dan weten. We kijken er niet moeilijk over.</p>
`;

export const TARIEVEN_RAIL_TITEL = "Strippenkaarten";

export const TARIEVEN_RAIL_VOET = "Een kaart geldt voor alle lessen hiernaast.";

/** Waar of een veld met "ja" is aangezet. Alles daarbuiten telt als nee. */
export function aangezet(waarde: string | undefined): boolean {
  return waarde?.trim().toLowerCase() === "ja";
}

/**
 * Dezelfde producten, maar dan als getallen (§ docentenlaag).
 *
 * `TARIEVEN` hierboven is wat de bezoeker leest en wat Pieter in de
 * site-editor mag bijschaven. Deze lijst is waar de database mee rekent: het
 * saldo van een kaart, de geldigheidsduur, en het bedrag dat een collega
 * factureert wanneer de kaart bij hém wordt gebruikt.
 *
 * Twee lijsten, en dat is precies het soort constructie dat na de eerste
 * prijswijziging uit elkaar loopt. `tarieven.test.ts` legt ze daarom naast
 * elkaar: dezelfde namen, in dezelfde volgorde, en het getoonde bedrag moet
 * gelijk zijn aan `prijs_centen`. Wijkt er iets af, dan valt de test om
 * voordat er iemand een verkeerde factuur krijgt.
 *
 * De verrekenwaarde is EXCLUSIEF btw. De prijs die de klant betaalt is
 * inclusief 9% — het tarief voor yogalessen — en die btw draagt de uitgevende
 * docent af. Zou de collega het brutobedrag factureren, dan betaalt de
 * uitgever meer terug dan hij overhield.
 *
 * Bij de drie abonnementen is "per les" een aanname: daar zit geen strip op.
 * Die bedragen zijn met de hand vastgesteld en mogen niet uit een formule
 * worden herleid — anders verdwijnt uit het zicht dat het een keuze was.
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
