import { expect, test } from "@playwright/test";

/**
 * Toegangscontrole zonder inlog. Deze tests hebben geen echte Supabase-sessie
 * nodig: ze controleren dat afgeschermde routes een bezoeker zonder sessie
 * altijd wegsturen (BOUWPROMPT §7).
 */
test.describe("Toegangscontrole", () => {
  test("het portaal stuurt een bezoeker zonder sessie naar inloggen", async ({
    page,
  }) => {
    await page.goto("/portaal");

    await expect(page).toHaveURL(/\/inloggen\?vervolg=%2Fportaal/);
    await expect(
      page.getByRole("heading", { name: "Inloggen", level: 1 }),
    ).toBeVisible();
  });

  test("het beheer stuurt een bezoeker zonder sessie naar inloggen", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/inloggen\?vervolg=%2Fadmin/);
  });

  test("een diepere adminroute is net zo goed afgeschermd", async ({
    page,
  }) => {
    await page.goto("/admin/klanten");

    await expect(page).toHaveURL(/\/inloggen/);
  });
});

test.describe("Inlogpagina", () => {
  test("toont de velden en verwijzingen die erbij horen", async ({ page }) => {
    await page.goto("/inloggen");

    await expect(page.getByLabel("E-mailadres")).toBeVisible();
    await expect(page.getByLabel("Wachtwoord")).toBeVisible();
    await expect(page.getByRole("link", { name: "Vergeten?" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Maak er een aan" }),
    ).toBeVisible();
  });

  test("wijst ongeldige invoer af zonder de pagina te verlaten", async ({
    page,
  }) => {
    await page.goto("/inloggen");

    await page.getByLabel("E-mailadres").fill("geen-emailadres");
    await page.getByLabel("Wachtwoord").fill("iets");
    await page.getByRole("button", { name: "Inloggen" }).click();

    await expect(
      page.getByText("Dit lijkt geen geldig e-mailadres"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/inloggen/);
  });
});

test.describe("Registratiepagina", () => {
  test("eist een wachtwoord van minstens 12 tekens", async ({ page }) => {
    await page.goto("/registreren");

    await page.getByLabel("Voornaam").fill("Test");
    await page.getByLabel("Achternaam").fill("Gebruiker");
    await page.getByLabel("E-mailadres").fill("test@voorbeeld.nl");
    await page.getByLabel("Wachtwoord").fill("kort");

    // De sterkte-indicator vertelt hoeveel tekens er nog nodig zijn.
    await expect(page.getByText(/Nog minstens \d+ tekens nodig/)).toBeVisible();

    await page.getByRole("button", { name: "Account aanmaken" }).click();
    await expect(page.getByText(/minstens 12 tekens/i).first()).toBeVisible();
  });

  test("verwijst in het formulier naar de juridische pagina's", async ({
    page,
  }) => {
    await page.goto("/registreren");

    // Scoped op het formulier: dezelfde links staan ook in de paginavoet.
    const formulier = page.locator("form");

    await expect(
      formulier.getByRole("link", { name: "privacyverklaring" }),
    ).toBeVisible();
    await expect(
      formulier.getByRole("link", { name: "algemene voorwaarden" }),
    ).toBeVisible();
  });
});
