import { expect, test } from "@playwright/test";

/**
 * Betaalflow (BOUWPROMPT §9). Zonder Stripe-sleutels kan er geen echte
 * betaling worden gedaan; wat hier wordt gecontroleerd is alles eromheen:
 * dat inschrijven een account vereist, dat de webhook niet te misleiden is, en
 * dat de detailpagina naar de juiste plek wijst.
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

test.describe("Stripe-webhook", () => {
  test("weigert een verzoek zonder handtekening", async ({ request }) => {
    const antwoord = await request.post("/api/v1/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
    });

    expect(antwoord.status()).toBe(400);
    const body = await antwoord.json();
    expect(body.error).toBeTruthy();
    expect(body.data).toBeNull();
  });

  test("weigert een verzonnen handtekening", async ({ request }) => {
    const antwoord = await request.post("/api/v1/webhooks/stripe", {
      headers: {
        "stripe-signature": "t=1,v1=verzonnen",
        "content-type": "application/json",
      },
      data: JSON.stringify({
        type: "checkout.session.completed",
        data: { object: { id: "cs_nep", payment_status: "paid" } },
      }),
    });

    expect(antwoord.status()).toBe(400);
  });

  test("verraadt niet waaróm de handtekening wordt geweigerd", async ({
    request,
  }) => {
    const antwoord = await request.post("/api/v1/webhooks/stripe", {
      headers: { "stripe-signature": "t=1,v1=verzonnen" },
      data: "{}",
    });

    const body = await antwoord.json();
    // Een generieke melding: details zouden helpen bij het vervalsen ervan.
    expect(JSON.stringify(body)).not.toContain("whsec");
    expect(JSON.stringify(body)).not.toContain("timestamp");
  });
});
