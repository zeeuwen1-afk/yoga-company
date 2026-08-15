/**
 * Publieke ingang van de crm-feature (BOUWPROMPT §4).
 */
export {
  haalKlanten,
  haalKlantDossier,
  heeftTweestapsverificatie,
  haalGezondheid,
  haalAnalyses,
  type KlantRij,
  type KlantFilter,
  type KlantDossier,
} from "./server/queries";

export {
  nodigKlantUit,
  werkKlantBij,
  zetKlantActief,
  verwijderKlantAvg,
  voegNotitieToe,
  wijzigRol,
  type AdminResultaat,
} from "./server/acties";

export {
  bewaarGezondheid,
  maakGespreksverslag,
  verwijderGespreksverslag,
  type DossierResultaat,
} from "./server/dossier-acties";
