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
  "Lessen Rinske Yoga Almere — losse lessen, strippenkaarten en abonnementen voor de yogalessen van YogaCompany.";

export const TARIEVEN_LOCATIE = "Lessen Rinske Yoga, Almere";

export const TARIEVEN_INLEIDING =
  "Alle kaarten naast elkaar. Hoe meer lessen op je kaart, hoe voordeliger je per keer uit bent — dat staat in de derde kolom, zodat je het niet zelf hoeft uit te rekenen.";

export const TARIEVEN: Tarief[] = [
  {
    naam: "Snuffelkaart",
    toelichting: "3 lessen, om kennis te maken",
    prijs: "€ 9,00",
    per_les: "€ 3,00",
    geldig: "—",
    uitgelicht: "",
    rail: "",
  },
  {
    naam: "Losse les",
    toelichting: "Eén les, zonder verplichting",
    prijs: "€ 17,00",
    per_les: "€ 17,00",
    geldig: "—",
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
<p>Reserveer je plek vooraf; een kaart geeft toegang tot alle lessen in het weekrooster. Tot <strong>24 uur</strong> voor de les annuleren is kosteloos — daarna kost het een strip.</p>
<p>Lukt het een keer echt niet, laat het dan weten. We kijken er niet moeilijk over.</p>
`;

export const TARIEVEN_RAIL_TITEL = "Strippenkaarten";

export const TARIEVEN_RAIL_VOET = "Een kaart geldt voor alle lessen hiernaast.";

/** Waar of een veld met "ja" is aangezet. Alles daarbuiten telt als nee. */
export function aangezet(waarde: string | undefined): boolean {
  return waarde?.trim().toLowerCase() === "ja";
}
