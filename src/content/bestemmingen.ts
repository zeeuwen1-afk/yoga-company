/**
 * Waar een knop heen kan wijzen.
 *
 * Een leeg tekstveld waarin je `/lessen/tarieven` moet typen is geen bewerkbare
 * knop maar een raadspelletje: je moet weten hoe de adressen heten, en één
 * typfout levert een 404 op zonder dat iemand het merkt. Deze lijst wordt in de
 * site-editor naast het veld getoond, zodat je een bestemming aanklikt in
 * plaats van hem uit je hoofd te schrijven.
 *
 * Zet hier een pagina bij zodra er een bijkomt. Staat hij er niet in, dan kan
 * de beheerder het adres nog steeds met de hand invullen; hij krijgt alleen
 * geen hulp.
 *
 * De ankers verwijzen naar een `id` op een `Sectie`. Voeg je er een toe, geef
 * die sectie dan ook echt dat id, anders springt de knop nergens heen.
 */

export type Bestemming = {
  /** Wat er in het veld komt te staan. */
  pad: string;
  /** Hoe het heet voor de beheerder. */
  label: string;
};

export const BESTEMMINGEN: { groep: string; items: Bestemming[] }[] = [
  {
    groep: "Aanbod",
    items: [
      { pad: "/opleidingen", label: "Opleidingen" },
      { pad: "/trainingen", label: "Trainingen" },
      { pad: "/lessen", label: "Lessen" },
      { pad: "/lessen/tarieven", label: "Lessen, workshops en privéyoga" },
      { pad: "/lessen#rooster", label: "Lessen · het weekrooster" },
    ],
  },
  {
    groep: "Organisaties",
    items: [
      { pad: "/bedrijfsyoga", label: "Bedrijfsyoga" },
      { pad: "/sportclubs", label: "Sportclubs" },
      { pad: "/onderwijs", label: "Onderwijs" },
      { pad: "#aanvraag", label: "Aanvraagformulier op deze pagina" },
    ],
  },
  {
    groep: "Over YogaCompany",
    items: [
      { pad: "/over-ons", label: "Over ons" },
      { pad: "/portfolio", label: "Portfolio" },
      { pad: "/onze-docenten", label: "Onze docenten" },
      { pad: "/voor-yogadocenten", label: "Voor yogadocenten" },
      { pad: "/veiligheid", label: "Veiligheid" },
    ],
  },
  {
    groep: "Contact en account",
    items: [
      { pad: "/contact", label: "Contact" },
      { pad: "/inloggen", label: "Inloggen" },
      { pad: "/registreren", label: "Account aanmaken" },
      { pad: "mailto:info@yogacompany.eu", label: "E-mail sturen" },
    ],
  },
];

/** Alles op één hoop, voor een snelle controle of een pad bestaat. */
export const ALLE_BESTEMMINGEN: Bestemming[] = BESTEMMINGEN.flatMap(
  (groep) => groep.items,
);
