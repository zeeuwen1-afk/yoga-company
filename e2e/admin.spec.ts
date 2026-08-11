import { expect, test } from "@playwright/test";

/**
 * De beheeromgeving (BOUWPROMPT §13).
 *
 * Zonder Supabase-project kan er niet worden ingelogd. Wat hier wordt
 * gecontroleerd is de buitenrand: geen enkele beheerroute of beheer-API mag
 * iets prijsgeven aan wie niet is ingelogd — en dat is precies de plek waar
 * álle klantgegevens samenkomen.
 */

const BEHEERROUTES = [
  "/admin",
  "/admin/klanten",
  "/admin/klanten/11111111-1111-1111-1111-111111111111",
  "/admin/inschrijvingen",
  "/admin/aanvragen",
  "/admin/berichten",
  "/admin/contactberichten",
  "/admin/aanbod",
  "/admin/aanbod/nieuw",
  "/admin/aanbod/eerst-jij",
  "/admin/aanbod/eerst-jij/content",
  "/admin/monitoring/eerst-jij",
  "/admin/instellingen",
  "/admin/logboek",
];

test.describe("Beheer is afgeschermd", () => {
  for (const route of BEHEERROUTES) {
    test(`${route} weigert een bezoeker zonder sessie`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/inloggen/);
      await expect(
        page.getByRole("heading", { name: "Inloggen", level: 1 }),
      ).toBeVisible();
    });
  }
});

test.describe("Beheer-API's", () => {
  test("de klantexport levert zonder sessie niets", async ({ request }) => {
    const antwoord = await request.get(
      "/api/v1/admin/klant-export/11111111-1111-1111-1111-111111111111",
    );

    expect(antwoord.status()).toBe(401);
    const body = await antwoord.json();
    expect(body.data).toBeNull();
  });

  test("de voortgangsexport levert zonder sessie niets", async ({
    request,
  }) => {
    const antwoord = await request.get("/api/v1/admin/voortgang-csv/eerst-jij");

    expect(antwoord.status()).toBe(401);
    // Geen enkele naam of e-mailadres in het antwoord.
    const tekst = await antwoord.text();
    expect(tekst).not.toContain("@");
  });
});
