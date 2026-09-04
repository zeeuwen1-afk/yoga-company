import { describe, expect, it } from "vitest";

import { MIDDEN, focusStijl, leesFocus } from "./beeldfocus";

/**
 * De focuswaarde komt uit de database en belandt in een stijl-attribuut.
 * Daarom is de vraag hier niet alleen "rekent hij goed", maar vooral: kan er
 * ooit iets anders uitkomen dan twee percentages?
 */

describe("leesFocus", () => {
  it("leest een gewone waarde", () => {
    expect(leesFocus("30% 70%")).toEqual({ x: 30, y: 70 });
    expect(leesFocus(MIDDEN)).toEqual({ x: 50, y: 50 });
    expect(leesFocus("0% 100%")).toEqual({ x: 0, y: 100 });
  });

  it("valt terug op het midden als er niets staat", () => {
    // Elk blok van vóór deze functie heeft geen focus. Die moeten er precies
    // uitzien zoals ze er altijd uitzagen.
    expect(leesFocus(undefined)).toEqual({ x: 50, y: 50 });
    expect(leesFocus(null)).toEqual({ x: 50, y: 50 });
    expect(leesFocus("")).toEqual({ x: 50, y: 50 });
  });

  it("weigert alles wat geen twee percentages is", () => {
    expect(leesFocus("left top")).toEqual({ x: 50, y: 50 });
    expect(leesFocus("30%")).toEqual({ x: 50, y: 50 });
    expect(leesFocus("30px 70px")).toEqual({ x: 50, y: 50 });
    expect(leesFocus("120% 30%")).toEqual({ x: 50, y: 50 });
  });

  it("laat geen losse CSS de pagina in", () => {
    // Een handmatig bewerkt blok mag niet meer kunnen dan een punt aanwijzen.
    expect(
      focusStijl("50% 50%; background: url(https://elders/plaatje.png)"),
    ).toBe(MIDDEN);
    expect(focusStijl("}")).toBe(MIDDEN);
    expect(focusStijl("50% 50%)")).toBe(MIDDEN);
  });
});

describe("focusStijl", () => {
  it("geeft altijd iets bruikbaars terug", () => {
    expect(focusStijl("25% 80%")).toBe("25% 80%");
    expect(focusStijl(undefined)).toBe(MIDDEN);
    expect(focusStijl("onzin")).toBe(MIDDEN);
  });
});
