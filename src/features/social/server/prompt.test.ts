import { describe, expect, it } from "vitest";

import { DOELEN, PLATFORMS } from "../opties";
import { SYSTEEM_PROMPT, bouwGebruikersPrompt } from "./prompt";

/**
 * De instructie voor de AI is de enige plek waar vastligt dat er geen
 * gezondheidsclaims in een bericht komen en dat er Nederlands uit komt. Raakt
 * die tekst bij een aanpassing kwijt wat hij moet zeggen, dan merkt niemand dat
 * — tot er iets online staat wat er niet had mogen staan.
 */

describe("systeeminstructie", () => {
  it("legt Nederlands vast", () => {
    expect(SYSTEEM_PROMPT).toMatch(/Nederlands/);
  });

  it("verbiedt gezondheids- en genezingsclaims", () => {
    expect(SYSTEEM_PROMPT).toMatch(/geneest/i);
    expect(SYSTEEM_PROMPT).toMatch(/gezondheid/i);
    expect(SYSTEEM_PROMPT).toMatch(/burn-out/i);
  });

  it("geeft ook aan wat wél mag, niet alleen wat niet mag", () => {
    // Een instructie die alleen verbiedt levert vage teksten op.
    expect(SYSTEEM_PROMPT).toMatch(/Wat wél kan/);
  });

  it("houdt de merkstijl uit §5 aan: je-vorm en kort", () => {
    expect(SYSTEEM_PROMPT).toMatch(/"je"/);
    expect(SYSTEEM_PROMPT).toMatch(/Kort, warm, direct/);
  });

  it("vraagt om drie verschillende varianten", () => {
    expect(SYSTEEM_PROMPT).toMatch(/drie varianten/);
  });
});

describe("opdracht per generatie", () => {
  it("neemt onderwerp, doel en platform mee", () => {
    const prompt = bouwGebruikersPrompt({
      onderwerp: "de 200-uurs opleiding start in september",
      doel: "inschrijvingen",
      platform: "instagram",
    });

    expect(prompt).toContain("de 200-uurs opleiding start in september");
    expect(prompt).toMatch(/Doel: inschrijvingen/);
    expect(prompt).toMatch(/Platform: Instagram/);
  });

  it("kent elk doel en elk platform uit het formulier", () => {
    // Zou het formulier een keuze tonen die de prompt niet kent, dan valt de
    // instructie stilletjes weg.
    for (const doel of DOELEN) {
      for (const platform of PLATFORMS) {
        const prompt = bouwGebruikersPrompt({
          onderwerp: "test",
          doel: doel.waarde,
          platform: platform.waarde,
        });
        expect(prompt).toMatch(/^Doel: /m);
        expect(prompt).toMatch(/^Platform: /m);
      }
    }
  });
});
