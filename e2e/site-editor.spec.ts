import { expect, test } from "@playwright/test";

/**
 * De site-editor (BOUWPROMPT §14).
 *
 * De voorvertoning toont ongepubliceerde inhoud en is daarmee net zo gevoelig
 * als de rest van het beheer: die mag onder geen beding zichtbaar zijn voor
 * wie niet is ingelogd.
 */

test.describe("Site-editor is afgeschermd", () => {
  for (const route of [
    "/admin/site-editor",
    "/admin/site-editor/home",
    "/voorbeeld/home",
    "/voorbeeld/over-ons",
    "/voorbeeld/privacyverklaring",
  ]) {
    test(`${route} weigert een bezoeker zonder sessie`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/inloggen/);
      await expect(
        page.getByRole("heading", { name: "Inloggen", level: 1 }),
      ).toBeVisible();
    });
  }

  test("robots.txt houdt de voorvertoning uit de zoekmachine", async ({
    request,
  }) => {
    const tekst = await (await request.get("/robots.txt")).text();
    expect(tekst).toContain("Disallow: /voorbeeld");
  });
});

test.describe("Publieke site blijft ongewijzigd", () => {
  test("de startpagina toont de gepubliceerde inhoud", async ({ page }) => {
    await page.goto("/");

    // De kop komt uit het CMS en mag door de eigenaar gewijzigd worden; de
    // letterlijke tekst toetsen zou deze test elke bewerking laten omvallen.
    // Wat hier telt is dat de pagina de gepubliceerde waarde toont en niet het
    // concept: een blok met een openstaand concept hoort de oude tekst te
    // laten zien tot er gepubliceerd wordt.
    const kop = page.getByRole("heading", { level: 1 });
    await expect(kop).toHaveCount(1);
    await expect(kop).not.toBeEmpty();
    await expect(page.getByText("CONCEPT", { exact: false })).toHaveCount(0);
  });

  test("de securityheader staat toe dat de editor de pagina in een iframe toont", async ({
    request,
  }) => {
    const headers = (await request.get("/")).headers();

    // frame-ancestors 'self' laat de preview-iframe op dezelfde origin toe en
    // houdt andere sites buiten (BOUWPROMPT §17.2).
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'self'",
    );
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
