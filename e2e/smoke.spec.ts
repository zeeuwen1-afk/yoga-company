import { expect, test } from "@playwright/test";

/** Gezet door playwright.config.ts: draaien we tegen een echte build? */
const PRODUCTIEBUILD = process.env.E2E_PRODUCTIEBUILD === "1";

test.describe("Fundament", () => {
  test("de landingspagina rendert met kop, navigatie en footer", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "YogaCompany — opleidingsinstituut voor yoga",
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByRole("contentinfo")).toContainText("YogaCompany");
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  });

  test("de designtokens zijn toegepast op de body", async ({ page }) => {
    await page.goto("/");

    const { kleur, achtergrond } = await page.evaluate(() => {
      const stijl = getComputedStyle(document.body);
      return { kleur: stijl.color, achtergrond: stijl.backgroundColor };
    });
    // --color-ink = #14332F
    expect(kleur).toBe("rgb(20, 51, 47)");
    // --color-paper = #F6FAF9
    expect(achtergrond).toBe("rgb(246, 250, 249)");
  });

  /**
   * De styleguide is een hulpmiddel voor het bouwen en hoort niet op een
   * openbare server. `/dev/styleguide` geeft in een productiebuild dan ook een
   * 404. Allebei die eigenschappen worden hier vastgelegd, elk in de omgeving
   * waar hij geldt.
   */
  test("de styleguide toont de kleurtokens", async ({ page }) => {
    test.skip(
      PRODUCTIEBUILD,
      "In een productiebuild bestaat de styleguide bewust niet.",
    );
    await page.goto("/dev/styleguide");

    await expect(
      page.getByRole("heading", { name: "Styleguide", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("--color-green", { exact: true }),
    ).toBeVisible();
  });

  test("de styleguide bestaat niet op een productieserver", async ({
    page,
  }) => {
    test.skip(
      !PRODUCTIEBUILD,
      "Alleen zinvol tegen een productiebuild; lokaal draait de ontwikkelserver.",
    );
    const antwoord = await page.goto("/dev/styleguide");

    expect(antwoord?.status()).toBe(404);
  });

  test("een onbekend adres toont een Nederlandse 404 met navigatie", async ({
    page,
  }) => {
    const response = await page.goto("/bestaat-niet");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Deze pagina bestaat niet", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Naar de startpagina" }),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
