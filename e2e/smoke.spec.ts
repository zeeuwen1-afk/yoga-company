import { expect, test } from "@playwright/test";

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
    // --color-ink = #2F4239
    expect(kleur).toBe("rgb(47, 66, 57)");
    // --color-paper = #F9F7F1
    expect(achtergrond).toBe("rgb(249, 247, 241)");
  });

  test("de styleguide toont de kleurtokens", async ({ page }) => {
    await page.goto("/dev/styleguide");

    await expect(
      page.getByRole("heading", { name: "Styleguide", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("--color-green", { exact: true }),
    ).toBeVisible();
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
