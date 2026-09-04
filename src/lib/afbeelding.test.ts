import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_ZIJDE, verkleinAfbeelding } from "./afbeelding";

/**
 * Het echte verkleinen gebeurt met canvas en `createImageBitmap`, en die
 * bestaan niet in een testomgeving. Wat hier wordt vastgelegd is daarom de
 * belofte die er onder alle omstandigheden toe doet: er komt altijd een
 * bruikbaar bestand terug. Gaat er iets mis, dan gaat het origineel alsnog weg
 * en loopt de gebruiker nergens op vast.
 */

function bestand(naam: string, type: string, bytes = 1024): File {
  return new File([new Uint8Array(bytes)], naam, { type });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verkleinAfbeelding", () => {
  it("laat iets dat geen afbeelding is met rust", async () => {
    const origineel = bestand("aantekeningen.pdf", "application/pdf");
    const { bestand: uit, verkleind } = await verkleinAfbeelding(origineel);

    expect(uit).toBe(origineel);
    expect(verkleind).toBe(false);
  });

  it("laat een gif met rust, want die kan bewegen", async () => {
    // Verkleinen zou er één stilstaand plaatje van maken, en dat is niet wat
    // iemand bedoelde toen hij hem uitkoos.
    const origineel = bestand("groet.gif", "image/gif");
    const { bestand: uit, verkleind } = await verkleinAfbeelding(origineel);

    expect(uit).toBe(origineel);
    expect(verkleind).toBe(false);
  });

  it("geeft het origineel terug als de browser het bestand niet kan openen", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("niet te lezen")),
    );

    const origineel = bestand("kapot.jpg", "image/jpeg", 4 * 1024 * 1024);
    const { bestand: uit, verkleind } = await verkleinAfbeelding(origineel);

    expect(uit).toBe(origineel);
    expect(verkleind).toBe(false);
  });

  it("geeft het origineel terug als het verkleinen halverwege afbreekt", async () => {
    // Bijvoorbeeld te weinig geheugen op een ouder toestel bij een foto van
    // veertig megapixel. Trager uploaden is beter dan een foutmelding.
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({
        width: 7087,
        height: 5670,
        close: () => {
          throw new Error("mag niet omvallen");
        },
      }),
    );

    const origineel = bestand("groot.jpg", "image/jpeg", 4 * 1024 * 1024);
    const { bestand: uit } = await verkleinAfbeelding(origineel);

    expect(uit).toBe(origineel);
  });

  it("houdt de maximale zijde op 2560 pixels", () => {
    // Ruim twee keer de breedste plek waar een foto terechtkomt (1600 px voor
    // een hero). Verlagen mag, maar dan wel bewust.
    expect(MAX_ZIJDE).toBe(2560);
  });
});
