import { expect, test } from "@playwright/test";

/**
 * Het klantportaal (BOUWPROMPT §11).
 *
 * Zonder Supabase-project kan er niet worden ingelogd; wat hier wordt
 * gecontroleerd is de buitenrand: dat geen enkele portaalroute of
 * portaal-API iets prijsgeeft aan wie niet is ingelogd.
 */

const PORTAALROUTES = [
  "/portaal",
  "/portaal/opleidingen",
  "/portaal/opleidingen/eerst-jij",
  "/portaal/berichten",
  "/portaal/aanvragen",
  "/portaal/profiel",
];

test.describe("Portaal is afgeschermd", () => {
  for (const route of PORTAALROUTES) {
    test(`${route} stuurt een bezoeker zonder sessie naar inloggen`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/inloggen/);
      await expect(
        page.getByRole("heading", { name: "Inloggen", level: 1 }),
      ).toBeVisible();
    });
  }

  test("onthoudt waar je heen wilde", async ({ page }) => {
    await page.goto("/portaal/berichten");

    await expect(page).toHaveURL(/vervolg=%2Fportaal%2Fberichten/);
  });
});

test.describe("Beschermde bestanden", () => {
  test("geven zonder sessie geen tijdelijke link af", async ({ request }) => {
    const antwoord = await request.get(
      "/api/v1/content/00000000-0000-0000-0000-000000000001",
    );

    expect(antwoord.status()).toBe(401);
    const body = await antwoord.json();
    expect(body.data).toBeNull();
    // Nooit een pad naar de opslag in het antwoord.
    expect(JSON.stringify(body)).not.toContain("supabase.co");
    expect(JSON.stringify(body)).not.toContain("protected-content");
  });

  test("een verzonnen item geeft hetzelfde antwoord als een bestaand item", async ({
    request,
  }) => {
    // Wie niet is ingelogd, mag niet kunnen afleiden welk item bestaat.
    const eerste = await request.get("/api/v1/content/geen-geldige-uuid");
    const tweede = await request.get(
      "/api/v1/content/11111111-1111-1111-1111-111111111111",
    );

    expect(eerste.status()).toBe(tweede.status());
  });
});

test.describe("AVG-export", () => {
  test("levert zonder sessie geen gegevens", async ({ request }) => {
    const antwoord = await request.get("/api/v1/mijn-gegevens");

    expect(antwoord.status()).toBe(401);
    const body = await antwoord.json();
    expect(body.data).toBeNull();
  });
});

test.describe("Zoekmachines", () => {
  test("robots.txt houdt het portaal buiten de index", async ({ request }) => {
    const tekst = await (await request.get("/robots.txt")).text();

    expect(tekst).toContain("Disallow: /portaal");
    expect(tekst).toContain("Disallow: /api/");
  });
});
