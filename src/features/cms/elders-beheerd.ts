/**
 * Pagina's waarvan de inhoud maar deels in de site-editor staat.
 *
 * Op de pagina Trainingen kun je hier de kop, de inleiding en het beeld
 * aanpassen, maar de trainingen zelf staan er niet: dat zijn cursussen in de
 * database, met een prijs, een inschrijfformulier en lesmateriaal eraan. Die
 * hebben een eigen scherm nodig.
 *
 * Dat is verdedigbaar, maar het was niet te zien. Wie een training wilde
 * toevoegen kwam op de logische plek terecht, vond drie tekstvelden en geen
 * knop, en concludeerde dat het niet kon. Deze verwijzing lost dat op: op de
 * pagina zelf staat waar de rest te vinden is.
 */

export type ElderBeheerd = {
  /** Wat er op deze pagina staat dat je hier niet kunt bewerken. */
  wat: string;
  /** Waar het wél kan. */
  href: string;
  knop: string;
};

export const ELDERS_BEHEERD: Record<string, ElderBeheerd> = {
  trainingen: {
    wat: "De trainingen zelf staan hier niet. Die beheer je bij Aanbod, samen met hun prijs, inschrijvingen en lesmateriaal.",
    href: "/admin/aanbod",
    knop: "Naar Aanbod",
  },
  opleidingen: {
    wat: "De opleidingen zelf staan hier niet. Die beheer je bij Aanbod, samen met hun prijs, inschrijvingen en lesmateriaal.",
    href: "/admin/aanbod",
    knop: "Naar Aanbod",
  },
  lessen: {
    wat: "Het weekrooster staat hier niet. Losse lessen voeg je toe en haal je weg bij Lessen.",
    href: "/admin/lessen",
    knop: "Naar Lessen",
  },
  "onze-docenten": {
    wat: "De docenten zelf staan hier niet. Elke docent maakt zijn eigen pagina; die verschijnt hier zodra hij hem publiceert.",
    href: "/admin/klanten",
    knop: "Naar Klanten",
  },
  home: {
    wat: "De eerstvolgende lessen en het aanbod op deze pagina komen uit Lessen en Aanbod. Hier bepaal je de teksten eromheen.",
    href: "/admin/lessen",
    knop: "Naar Lessen",
  },
};
