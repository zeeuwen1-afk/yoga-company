import { expect, test } from "@playwright/test";

/**
 * De lessenpagina, en het roosterbeheer dat erachter blijft bestaan.
 *
 * Er stond een weekrooster op deze pagina. Dat is er in september 2026
 * uitgehaald: er heeft nooit een les in gestaan en er is nooit geboekt, dus
 * het enige wat bezoekers zagen was de melding dat het rooster leeg was. Wat
 * wel klopt, staat in de tekst: Wietske geeft les bij drie scholen en je boekt
 * een proefles bij die school.
 *
 * Het boekingssysteem zelf staat er nog, in het portaal en in het beheer. Die
 * twee zijn afgeschermd, en dat hoort zo te blijven: dat is wat de laatste
 * twee tests hier bewaken.
 */
test.describe("Lessenpagina", () => {
  test("is openbaar en toont haar eigen tekst", async ({ page }) => {
    await page.goto("/lessen");

    // De kop komt uit de site-editor en mag veranderen; dát er een kop staat
    // en dat er tekst onder staat, niet.
    const kop = page.getByRole("heading", { level: 1 });
    await expect(kop).toBeVisible();
    await expect(kop).not.toBeEmpty();
  });

  test("belooft geen rooster meer", async ({ page }) => {
    await page.goto("/lessen");

    // Geen lege roosterstrook, en geen boekknop die nergens heen gaat. Dit is
    // precies wat er stond toen het rooster nog leeg op de pagina stond.
    await expect(
      page.getByText("Er staan op dit moment geen lessen in het rooster"),
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Boek een les" })).toHaveCount(
      0,
    );
  });

  test("is bereikbaar vanuit de paginavoet", async ({ page }) => {
    await page.goto("/");

    // Het menu-item Weekrooster is verdwenen; de weg naar de lessenpagina
    // loopt nu via de voet, waar het aanbod staat.
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Lessen", exact: true })
      .click();

    await expect(page).toHaveURL(/\/lessen$/);
  });

  test("het rooster staat niet in het portaal zonder sessie", async ({
    page,
  }) => {
    const response = await page.goto("/portaal/lessen");

    await expect(page).toHaveURL(/\/inloggen/);
    expect(response?.status()).toBeLessThan(400);
  });

  test("het roosterbeheer is afgeschermd", async ({ page }) => {
    await page.goto("/admin/lessen");
    await expect(page).toHaveURL(/\/inloggen/);
  });
});
