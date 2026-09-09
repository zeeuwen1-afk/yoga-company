import { describe, expect, it } from "vitest";

import { BLOKKEN } from "@/content/blokken";
import { cursusSleutel } from "@/content/vrije-blokken";

import { kanVoorvertonen } from "./server/queries";

/**
 * De voorvertoning moet elke pagina aankunnen die in de editor te bewerken is.
 *
 * Dat was niet zo: de route had een handmatige lijst van zeven sleutels terwijl
 * er drieëntwintig pagina's zijn. Dertien gaven een 404, en de beheerder zag
 * dus geen voorvertoning van bedrijfsyoga, portfolio, de tarieven of de hele
 * yogaopleiding.
 *
 * Een browsertest kan dit niet vangen: de route zit achter de beheerdersinlog,
 * dus zonder sessie krijg je altijd een doorverwijzing en nooit een 404. Zo'n
 * test zou ook vóór de reparatie geslaagd zijn. Vandaar hier, op de regel zelf.
 */
describe("de voorvertoning kent elke bewerkbare pagina", () => {
  const paginas = [...new Set(BLOKKEN.map((blok) => blok.page_key))];

  it("vindt er genoeg om iets te toetsen", () => {
    // Zonder deze regel zou een lege BLOKKEN de lus hieronder stilzwijgend
    // overslaan en de test altijd laten slagen.
    expect(paginas.length).toBeGreaterThan(15);
  });

  it.each(paginas)("%s is te bekijken", (pageKey) => {
    expect(kanVoorvertonen(pageKey)).toBe(true);
  });

  it("kent de paginavoet, die geen eigen pagina heeft", () => {
    expect(kanVoorvertonen("footer")).toBe(true);
  });

  it("kent de pagina van één cursus", () => {
    // Die staat niet in BLOKKEN: hij bestaat pas als er een cursus is
    // aangemaakt. De route controleert daarna zelf of de slug ergens bij hoort.
    expect(kanVoorvertonen(cursusSleutel("hormoonyoga"))).toBe(true);
  });

  it("weigert een sleutel die niet bestaat", () => {
    // Anders zou elk verzonnen adres een lege pagina opleveren in plaats van
    // een nette 404.
    expect(kanVoorvertonen("verzonnen-pagina")).toBe(false);
    expect(kanVoorvertonen("")).toBe(false);
    // Het voorvoegsel zonder slug erachter hoort geen pagina te zijn.
    expect(kanVoorvertonen("cursus--")).toBe(false);
  });
});
