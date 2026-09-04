import { describe, expect, it } from "vitest";

import { isNaastElkaar, leesLayout } from "./beeldlayout";

describe("leesLayout", () => {
  it("herkent de vier indelingen", () => {
    expect(leesLayout("breed")).toBe("breed");
    expect(leesLayout("links")).toBe("links");
    expect(leesLayout("rechts")).toBe("rechts");
    expect(leesLayout("onder")).toBe("onder");
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
