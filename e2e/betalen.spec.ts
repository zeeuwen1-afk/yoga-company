import { expect, test } from "@playwright/test";

/**
 * Betaalflow (bouwprompt §7.6). Zonder Mollie-sleutel kan er geen echte
 * betaling worden gedaan; wat hier wordt gecontroleerd is alles eromheen: dat
 * inschrijven een account vereist, dat de webhook niets aanneemt van wie hem
 * aanroept, en dat de detailpagina naar de juiste plek wijst.
 */

test.describe("Inschrijven", () => {
  test("vereist een account en onthoudt waar je heen wilde", async ({
    page,
  }) => {
    await page.goto("/inschrijven/200-uurs-yin-yoga-specialist");

    await expect(page).toHaveURL(/\/inloggen\?vervolg=/);
    await expect(page).toHaveURL(/inschrijven/);
    await expect(
      page.getByRole("heading", { name: "Inloggen", level: 1 }),
    ).toBeVisible();
  });

  test("de detailpagina wijst naar de inschrijfpagina", async ({ page }) => {
    await page.goto("/opleidingen/200-uurs-yin-yoga-specialist");

    const knop = page.getByRole("link", { name: "Inschrijven" });
    await expect(knop).toHaveAttribute(
      "href",
      "/inschrijven/200-uurs-yin-yoga-specialist",
    );
  });

  test("een onbekende opleiding kent geen inschrijfpagina", async ({
    page,
  }) => {
    const antwoord = await page.goto("/inschrijven/bestaat-niet");

    // Ofwel 404, ofwel doorgestuurd naar inloggen — nooit een inschrijfpagina.
    expect([404, 200]).toContain(antwoord?.status() ?? 0);
    await expect(
      page.getByRole("heading", { name: "Inschrijven", level: 1 }),
    ).toBeHidden();
  });
});

test.describe("Mollie-webhook", () => {
  /**
   * Mollie ondertekent zijn webhooks niet; hij stuurt alleen `id=tr_xxx`. De
   * beveiliging zit er dus niet in dat we het verzoek controleren, maar dat we
   * de status zélf ophalen bij Mollie. Deze tests leggen vast dat er niets uit
   * het verzoek wordt overgenomen.
   */

  test("weigert een verzoek zonder betaal-id", async ({ request }) => {
    const antwoord = await request.post("/api/v1/webhooks/mollie", {
      form: {},
    });

    expect(antwoord.status()).toBe(400);
  });

  test("weigert een id dat er niet uitziet als een Mollie-betaling", async ({
    request,
  }) => {
    const antwoord = await request.post("/api/v1/webhooks/mollie", {
      form: { id: "'; drop table orders; --" },
    });

    expect(antwoord.status()).toBe(400);
  });

  test("neemt geen status aan die in het verzoek wordt meegestuurd", async ({
    request,
  }) => {
    // Wie dit adres kent zou anders een bestelling op betaald kunnen zetten.
    const antwoord = await request.post("/api/v1/webhooks/mollie", {
      form: {
        id: "tr_verzonnen123",
        status: "paid",
        amount: "2795.00",
      },
    });

    // Zonder sleutel komt de verwerking niet verder dan een nette bevestiging;
    // mét sleutel loopt de opvraging bij Mollie stuk op een onbekend id. In
    // geen van beide gevallen wordt er iets op betaald gezet.
    expect([200, 500]).toContain(antwoord.status());

    const body = await antwoord.json();
    expect(body.data?.verwerkt).not.toBe(true);
  });

  test("verraadt niet of een betaling bij ons bekend is", async ({
    request,
  }) => {
    const antwoord = await request.post("/api/v1/webhooks/mollie", {
      form: { id: "tr_nietbestaand" },
    });

    const tekst = await antwoord.text();
    expect(tekst).not.toContain("order");
    expect(tekst).not.toContain("bestelling");
  });
});
