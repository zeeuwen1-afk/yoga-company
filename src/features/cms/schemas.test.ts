import { describe, expect, it } from "vitest";

import { registratieSchema } from "./schemas";

const geldig = {
  name: "Anna de Vries",
  organisatie: "Studio Stil",
  email: "anna@studiostil.nl",
  phone: "",
  opleiding: "Yin Yoga Docentenopleiding",
  niveau: "YAA",
  plaats: "Utrecht",
  webadres: "https://studiostil.nl",
  body: "",
};

describe("registratieSchema", () => {
  it("accepteert een volledige aanvraag en laat de lege velden leeg", () => {
    const uitkomst = registratieSchema.safeParse(geldig);
    expect(uitkomst.success).toBe(true);
    if (uitkomst.success) {
      expect(uitkomst.data.niveau).toBe("YAA");
      expect(uitkomst.data.email).toBe("anna@studiostil.nl");
    }
  });

  it("vraagt om de naam van de opleiding en van de onderneming", () => {
    const zonder = registratieSchema.safeParse({
      ...geldig,
      opleiding: "",
      organisatie: "",
    });
    expect(zonder.success).toBe(false);
    if (!zonder.success) {
      const velden = zonder.error.issues.map((issue) => issue.path[0]);
      expect(velden).toContain("opleiding");
      expect(velden).toContain("organisatie");
    }
  });

  it("kent alleen de drie niveaus van de Academy", () => {
    expect(registratieSchema.safeParse({ ...geldig, niveau: "" }).success).toBe(
      false,
    );
    expect(
      registratieSchema.safeParse({ ...geldig, niveau: "YAX" }).success,
    ).toBe(false);
  });

  it("laat de website van de opleider toe en houdt de spamval leeg", () => {
    // "website" is de spamval; de site van de opleider heet "webadres".
    expect(
      registratieSchema.safeParse({ ...geldig, website: "http://spam" })
        .success,
    ).toBe(false);
    expect(
      registratieSchema.safeParse({ ...geldig, webadres: "geen adres" })
        .success,
    ).toBe(false);
  });
});
