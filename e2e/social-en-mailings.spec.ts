import { expect, test } from "@playwright/test";

/**
 * Social, mailings en de opschoontaak (BOUWPROMPT §15, §10.7, §17.6).
 *
 * De socialmediatool en de mailings bevatten klantgegevens en de mogelijkheid
 * om namens YogaCompany te publiceren. Ze horen dus achter dezelfde deur als
 * de rest van het beheer. De afmeldpagina is juist bewust openbaar — anders
 * zou afmelden een inlog vereisen, en dat is geen afmelden.
 */

test.describe("Beheer is afgeschermd", () => {
  for (const route of ["/admin/social", "/admin/mailings"]) {
    test(`${route} weigert een bezoeker zonder sessie`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/inloggen/);
      await expect(
        page.getByRole("heading", { name: "Inloggen", level: 1 }),
      ).toBeVisible();
    });
  }
});

test.describe("De opschoontaak is niet publiek aan te roepen", () => {
  test("zonder geheim bestaat de route niet", async ({ request }) => {
    const antwoord = await request.get("/api/v1/cron/opschonen");

    // 404 en niet 401: een 401 zou bevestigen dat deze route bestaat.
    expect(antwoord.status()).toBe(404);
  });

  test("een verzonnen geheim werkt niet", async ({ request }) => {
    const antwoord = await request.get("/api/v1/cron/opschonen", {
      headers: { authorization: "Bearer dit-is-niet-het-geheim" },
    });

    expect(antwoord.status()).toBe(404);
  });
});

test.describe("Afmelden werkt zonder inlog", () => {
  test("de afmeldpagina is openbaar en vraagt om bevestiging", async ({
    page,
  }) => {
    await page.goto("/afmelden/willekeurig-token");

    await expect(page).not.toHaveURL(/\/inloggen/);
    await expect(
      page.getByRole("heading", { name: "Afmelden voor mailings", level: 1 }),
    ).toBeVisible();

    // Bewust een knop en geen automatische afmelding: mailprogramma's volgen
    // links vooruit, en dan zou een scanner iemand afmelden.
    await expect(
      page.getByRole("button", { name: "Ja, meld me af" }),
    ).toBeVisible();
  });

  test("een ongeldig token meldt niemand af", async ({ page }) => {
    await page.goto("/afmelden/onzin.handtekening");
    await page.getByRole("button", { name: "Ja, meld me af" }).click();

    await expect(page.getByText(/afmeldlink klopt niet/i)).toBeVisible();
  });

  test("robots.txt houdt persoonlijke afmeldlinks uit de zoekmachine", async ({
    request,
  }) => {
    const tekst = await (await request.get("/robots.txt")).text();
    expect(tekst).toContain("Disallow: /afmelden");
  });
});
