import type { CurriculumBlok, CurriculumModule } from "@/content/aanbod";

/**
 * Het curriculum van een opleiding, heen en weer tussen scherm en database.
 *
 * In de database is het een boom: een module heeft blokken, en een blok heeft
 * onderdelen. Dat is drie niveaus diep, en drie niveaus diep is precies waar
 * een bewerkscherm met knoppen ophoudt bruikbaar te zijn — je krijgt een
 * "onderdeel toevoegen"-knop per blok, een "blok toevoegen"-knop per module, en
 * dan zoekt iemand op een scherm van veertig knoppen naar de goede.
 *
 * Daarom is de inhoud van een module één tekstveld, in de vorm waarin je het
 * toch al zou opschrijven:
 *
 *     Fundamenten van yin en yang
 *     - Het onderscheid tussen yin en yang
 *     - Waar de vorm vandaan komt
 *
 *     Basisprincipes
 *     - De drie principes van een yin-houding
 *
 * Een regel met een streepje ervoor is een onderdeel, elke andere regel is een
 * kopje. Meer regels zijn er niet, en dat is het punt: wie dit ziet staan kan
 * het lezen zonder uitleg, en de opmaak van de pagina verandert er niet van.
 */

/** De streepjes die mensen gebruiken als opsommingsteken. */
const STREEPJE = /^[-–—•*]\s*/;

/** Tekst uit het bewerkscherm naar de blokken zoals de pagina ze toont. */
export function leesOnderdelen(tekst: string): CurriculumBlok[] {
  const blokken: CurriculumBlok[] = [];

  for (const ruweRegel of tekst.split("\n")) {
    const regel = ruweRegel.trim();
    if (!regel) continue;

    if (STREEPJE.test(regel)) {
      const onderdeel = regel.replace(STREEPJE, "").trim();
      if (!onderdeel) continue;

      // Een opsomming zonder kopje erboven hoort niet te verdwijnen. Hij komt
      // in een blok zonder titel; de pagina laat dat kopje dan weg.
      const laatste = blokken[blokken.length - 1];
      if (laatste) {
        laatste.onderdelen.push(onderdeel);
      } else {
        blokken.push({ titel: "", onderdelen: [onderdeel] });
      }
      continue;
    }

    blokken.push({ titel: regel, onderdelen: [] });
  }

  return blokken;
}

/** En weer terug, zodat het bewerkscherm laat zien wat er is opgeslagen. */
export function schrijfOnderdelen(blokken: CurriculumBlok[]): string {
  return blokken
    .map((blok) =>
      [blok.titel, ...blok.onderdelen.map((deel) => `- ${deel}`)]
        .filter((regel) => regel.trim())
        .join("\n"),
    )
    .filter((stuk) => stuk)
    .join("\n\n");
}

/** Eén module zoals het bewerkscherm hem vasthoudt. */
export type ModuleInvoer = {
  titel: string;
  /** Als tekst, want een leeg getalveld is geen 0 maar niets. */
  uren: string;
  samenvatting: string;
  onderdelen: string;
};

export function naarInvoer(module: CurriculumModule): ModuleInvoer {
  return {
    titel: module.titel,
    uren: module.uren ? String(module.uren) : "",
    samenvatting: module.samenvatting,
    onderdelen: schrijfOnderdelen(module.blokken),
  };
}

/**
 * De ingevulde modules naar wat er in de database komt.
 *
 * De nummers komen uit de volgorde en niet uit een veld. Een beheerder die een
 * module tussenvoegt zou anders alle nummers erna met de hand moeten
 * bijwerken, en één vergeten nummer levert twee keer "Module 3" op de pagina op.
 *
 * Modules zonder titel vallen weg. Dat is hoe je er een weghaalt zonder een
 * aparte knop, en het voorkomt dat een per ongeluk toegevoegde lege module als
 * naamloos kopje op de site komt.
 */
export function naarCurriculum(modules: ModuleInvoer[]): CurriculumModule[] {
  return modules
    .filter((module) => module.titel.trim())
    .map((module, index) => ({
      nummer: index + 1,
      titel: module.titel.trim(),
      uren: Number.parseInt(module.uren, 10) || 0,
      samenvatting: module.samenvatting.trim(),
      blokken: leesOnderdelen(module.onderdelen),
    }));
}
