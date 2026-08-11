import { expect, test } from "@playwright/test";

test.describe("Fundament", () => {
  test("de landingspagina rendert met kop, navigatie en footer", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Yoga Companie — opleidingsinstituut voor yoga",
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByRole("contentinfo")).toContainText("Yoga Companie");
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  });

  test("de designtokens zijn toegepast op de body", async ({ page }) => {
    await page.goto("/");

    const kleur = await page.evaluate(
      () => getComputedStyle(document.body).color,
    );
    // --color-ink = #2B2A26
    expect(kleur).toBe("rgb(43, 42, 38)");
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
});
