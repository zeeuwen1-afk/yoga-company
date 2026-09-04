import { describe, expect, it } from "vitest";

import {
  WAASSTANDEN,
  isAchtergrond,
  isNaastElkaar,
  leesLayout,
  leesWaas,
} from "./beeldlayout";

describe("leesLayout", () => {
  it("herkent de vijf indelingen", () => {
    expect(leesLayout("breed")).toBe("breed");
    expect(leesLayout("links")).toBe("links");
    expect(leesLayout("rechts")).toBe("rechts");
    expect(leesLayout("onder")).toBe("onder");
    expect(leesLayout("achtergrond")).toBe("achtergrond");
  });

  it("valt terug op de volle breedte", () => {
    // Elk beeldblok van vóór deze keuze heeft geen waarde. Die moeten er
    // precies zo blijven uitzien als ze eruitzagen, anders verandert er van
    // alles op de site zonder dat iemand erom vroeg.
    expect(leesLayout(undefined)).toBe("breed");
    expect(leesLayout(null)).toBe("breed");
    expect(leesLayout("")).toBe("breed");
    expect(leesLayout("midden")).toBe("breed");
    expect(leesLayout("<script>")).toBe("breed");
  });

  it("trekt zich niets aan van hoofdletters en spaties", () => {
    expect(leesLayout("  Links ")).toBe("links");
  });
});

describe("isNaastElkaar", () => {
  it("geldt alleen voor links en rechts", () => {
    // Alleen dan worden beeld en tekst één sectie; bij de andere twee blijven
    // het losse stroken onder elkaar, zoals het altijd was.
    expect(isNaastElkaar("links")).toBe(true);
    expect(isNaastElkaar("rechts")).toBe(true);
    expect(isNaastElkaar("breed")).toBe(false);
    expect(isNaastElkaar("onder")).toBe(false);
  });
});

describe("leesWaas", () => {
  it("herkent de twee standen", () => {
    expect(leesWaas("normaal")).toBe("normaal");
    expect(leesWaas("donkerder")).toBe("donkerder");
  });

  it("valt terug op normaal", () => {
    // Alles wat we niet kennen wordt de veilige stand, nooit een lichtere.
    expect(leesWaas(undefined)).toBe("normaal");
    expect(leesWaas("")).toBe("normaal");
    expect(leesWaas("lichter")).toBe("normaal");
    expect(leesWaas("0.2")).toBe("normaal");
  });
});

describe("isAchtergrond", () => {
  it("geldt alleen voor de vijfde keuze", () => {
    expect(isAchtergrond("achtergrond")).toBe(true);
    expect(isAchtergrond("breed")).toBe(false);
    expect(isAchtergrond("links")).toBe(false);
  });
});

describe("de waas kan nooit lichter worden gezet", () => {
  /**
   * De hele belofte van deze functie is dat tekst op een foto leesbaar blijft,
   * welke foto er ook onder ligt. Die belofte staat of valt met twee dingen:
   * er zijn maar twee standen, en de zwakste is nog steeds donker genoeg.
   *
   * Bij crèmewit op petrol over een spierwitte foto — het slechtste geval —
   * geeft 75% een contrast van 5,42 : 1 en 65% nog maar 4,05 : 1. De grens ligt
   * op 4,5 : 1. Komt er ooit een derde stand bij, dan moet die opnieuw worden
   * doorgerekend, en deze test valt om om daaraan te herinneren.
   */
  it("kent precies twee standen", () => {
    expect(WAASSTANDEN).toEqual(["normaal", "donkerder"]);
  });
});
