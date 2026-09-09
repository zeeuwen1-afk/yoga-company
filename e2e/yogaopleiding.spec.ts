import { expect, test } from "@playwright/test";

/**
 * De 200-uurs Yogaopleiding: één overzichtspagina en vier modulepagina's.
 *
 * De teksten komen uit de site-editor en mogen veranderen. Deze tests toetsen
 * daarom niet wát er staat maar dat de constructie klopt: elke pagina bestaat,
 * elke modulepagina is los leesbaar met een prijs en een inschrijfknop, en de
 * verwijzingen tussen de pagina's kloppen. Dat is precies wat stukgaat als
 * iemand een slug hernoemt.
 */

const MODULES = [
  "module-1-hatha-vinyasa",
  "module-2-anatomie-filosofie-meditatie",
  "module-3-yin-yoga-het-lichaam",
  "module-4-zenuwstelsel-meridianen",
] as const;

const BASIS = "/opleidingen/200-uurs-yogaopleiding";

test.describe("200-uurs Yogaopleiding", () => {
  test("de overzichtspagina staat er met een kop en de vier modules", async ({
    page,
  }) => {
    await page.goto(BASIS);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Alle vier de modulepagina's moeten vanaf hier bereikbaar zijn; een
    // module zonder link is een module die niemand vindt.
    for (const segment of MODULES) {
      await expect(
        page.locator(`main a[href="${BASIS}/${segment}"]`).first(),
      ).toBeVisible();
    }
  });

  test("de prijstabel staat op de overzichtspagina", async ({ page }) => {
    await page.goto(BASIS);

    // De bedragen staan twee keer in de pagina: als tabel voor een breed
    // scherm en als lijst voor een telefoon, waarvan er steeds één zichtbaar
    // is. Zonder het filter op zichtbaarheid pakt de test de verborgen variant
    // en valt hij om op precies één van de twee schermformaten.
    const zichtbaar = (bedrag: string) =>
      page.getByText(bedrag, { exact: false }).filter({ visible: true });

    await expect(zichtbaar("€ 2.795").first()).toBeVisible();
    await expect(zichtbaar("€ 1.495").first()).toBeVisible();
  });

  for (const segment of MODULES) {
    test(`${segment} is zelfstandig leesbaar`, async ({ page }) => {
      const antwoord = await page.goto(`${BASIS}/${segment}`);
      expect(antwoord?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Terug naar de opleiding: wie hier binnenkomt via Google moet weten
      // waar deze module bij hoort.
      await expect(
        page.locator(`main a[href="${BASIS}"]`).first(),
      ).toBeVisible();

      // Een prijs en een knop die ergens heen gaat. Een modulepagina zonder
      // inschrijfknop is een folder.
      await expect(page.getByText("€ 795").first()).toBeVisible();
      await expect(
        page.locator('main a[href^="/inschrijven/"]').first(),
      ).toBeVisible();
    });
  }

  test("de inschrijfknoppen wijzen naar bestaande producten", async ({
    page,
    request,
  }) => {
    for (const segment of MODULES) {
      await page.goto(`${BASIS}/${segment}`);
      const href = await page
        .locator('main a[href^="/inschrijven/"]')
        .first()
        .getAttribute("href");

      expect(href).toBeTruthy();

      // Inschrijven vraagt om een sessie en stuurt door naar inloggen. Een
      // onbekend product geeft een 404, en dát is wat hier misgaat als iemand
      // een slug hernoemt.
      const antwoord = await request.get(href!, { maxRedirects: 0 });
      expect(antwoord.status(), `${segment} → ${href}`).not.toBe(404);
    }
  });

  test("module 3 en 4 zijn bereikbaar vanaf de Yin Yoga Specialist", async ({
    page,
  }) => {
    await page.goto("/opleidingen/200-uurs-yin-yoga-specialist");

    for (const segment of [
      "module-3-yin-yoga-het-lichaam",
      "module-4-zenuwstelsel-meridianen",
    ]) {
      await expect(
        page.locator(`main a[href="${BASIS}/${segment}"]`).first(),
      ).toBeVisible();
    }
  });
});
