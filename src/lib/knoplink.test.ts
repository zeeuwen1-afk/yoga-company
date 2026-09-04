import { describe, expect, it } from "vitest";

import { isExtern, veiligeLink } from "./knoplink";

describe("veiligeLink", () => {
  it("laat een gewone pagina op deze site door", () => {
    expect(veiligeLink("/lessen", "/contact")).toBe("/lessen");
    expect(veiligeLink("/lessen/tarieven", "/contact")).toBe(
      "/lessen/tarieven",
    );
  });

  it("laat een sectie op een pagina door", () => {
    expect(veiligeLink("#aanvraag", "/contact")).toBe("#aanvraag");
    expect(veiligeLink("/bedrijfsyoga#aanvraag", "/contact")).toBe(
      "/bedrijfsyoga#aanvraag",
    );
  });

  it("laat een andere website, e-mail en telefoon door", () => {
    expect(veiligeLink("https://yogaschool.nl/tarieven", "/contact")).toBe(
      "https://yogaschool.nl/tarieven",
    );
    expect(veiligeLink("mailto:info@yogacompany.eu", "/contact")).toBe(
      "mailto:info@yogacompany.eu",
    );
    expect(veiligeLink("tel:+31612345678", "/contact")).toBe(
      "tel:+31612345678",
    );
  });

  it("valt terug op het adres uit de code als het veld leeg is", () => {
    // Een leeg veld betekent "niet ingevuld", niet "kapotte knop".
    expect(veiligeLink("", "/contact")).toBe("/contact");
    expect(veiligeLink("   ", "/contact")).toBe("/contact");
    expect(veiligeLink(undefined, "/contact")).toBe("/contact");
    expect(veiligeLink(null, "/contact")).toBe("/contact");
  });

  it("weigert een adres dat code uitvoert", () => {
    // De reden dat deze functie bestaat: een tekstveld in een beheerscherm mag
    // nooit een klikbare javascript-link kunnen worden.
    expect(veiligeLink("javascript:alert(1)", "/contact")).toBe("/contact");
    expect(veiligeLink("JavaScript:alert(1)", "/contact")).toBe("/contact");
    expect(veiligeLink("data:text/html,<script>", "/contact")).toBe("/contact");
  });

  it("weigert http zonder s", () => {
    // Een onbeveiligde link vanaf een beveiligde pagina levert een waarschuwing
    // op in de browser, en dat is precies het tegenovergestelde van vertrouwen.
    expect(veiligeLink("http://voorbeeld.nl", "/contact")).toBe("/contact");
  });

  it("weigert losse tekst", () => {
    // Iemand die "lessen" typt in plaats van "/lessen" krijgt een werkende knop
    // in plaats van een 404.
    expect(veiligeLink("lessen", "/opleidingen")).toBe("/opleidingen");
    expect(veiligeLink("Bekijk het rooster", "/opleidingen")).toBe(
      "/opleidingen",
    );
  });

  it("negeert spaties rondom een verder geldig adres", () => {
    expect(veiligeLink("  /lessen  ", "/contact")).toBe("/lessen");
  });
});

describe("isExtern", () => {
  it("herkent een link naar buiten", () => {
    expect(isExtern("https://yogaschool.nl")).toBe(true);
    expect(isExtern("mailto:info@yogacompany.eu")).toBe(true);
    expect(isExtern("tel:+31612345678")).toBe(true);
  });

  it("herkent een link binnen de site", () => {
    expect(isExtern("/lessen")).toBe(false);
    expect(isExtern("#aanvraag")).toBe(false);
  });
});
