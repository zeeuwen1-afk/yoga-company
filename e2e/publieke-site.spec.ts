import { expect, test } from "@playwright/test";

test.describe("Landingspagina", () => {
  test("toont beide proposities, zakelijk en persoonlijk", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Voor je vak", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Voor jezelf", level: 2 }),
    ).toBeVisible();
  });

  test("toont de drie ingangen en het waarom-blok", async ({ page }) => {
    await page.goto("/");

    for (const ingang of ["Opleidingen", "Trainingen", "Yogalessen"]) {
      await expect(
        page.getByRole("heading", { name: ingang, level: 3 }),
      ).toBeVisible();
    }

    await expect(
      page.getByRole("heading", { name: "Waarom YogaCompany", level: 2 }),
    ).toBeVisible();
    await expect(page.getByText("Maximaal twaalf deelnemers")).toBeVisible();
  });

  test("toont opleidingen met prijs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("€ 2.795").first()).toBeVisible();
  });

  test("toont drie ervaringen van deelnemers", async ({ page }) => {
    await page.goto("/");

    const ervaringen = page.locator("figure blockquote");
    await expect(ervaringen).toHaveCount(3);
  });
});

test.describe("Opleidingen", () => {
  test("het overzicht toont het volledige aanbod met prijzen", async ({
    page,
  }) => {
    await page.goto("/opleidingen");

    await expect(
      page.getByRole("heading", { name: "Opleidingen", level: 2 }),
    ).toBeVisible();

    // De volledige opleiding plus de vier losse modules. Tellen op de links
    // naar detailpagina's, zodat de lijsten in de paginavoet niet meetellen.
    await expect(page.locator('main a[href^="/opleidingen/"]')).toHaveCount(5);
    await expect(page.getByText("€ 795").first()).toBeVisible();

    // De bundel wordt getoond met het voordeel ten opzichte van vier losse
    // modules: 4 × € 795 = € 3.180, min € 2.795 (§7.1 van de bouwprompt).
    await expect(page.getByText("bespaar € 385")).toBeVisible();
  });

  test("de detailpagina toont curriculum, praktische gegevens en prijs", async ({
    page,
  }) => {
    await page.goto("/opleidingen/200-uurs-yin-yoga-specialist");

    await expect(
      page.getByRole("heading", {
        name: "200-uurs Yin Yoga Specialist Opleiding",
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByText("€ 2.795")).toBeVisible();
    await expect(
      page.getByText("Betalen in termijnen is mogelijk"),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Inschrijven" })).toBeVisible();

    // Vier modules in de accordeon.
    await expect(page.locator("details")).toHaveCount(4);
    await expect(
      page.getByText("Module 4 — Herstel & revalidatie"),
    ).toBeVisible();

    // Praktische gegevens uit §19.
    await expect(page.getByText("maximaal 12 deelnemers")).toBeVisible();
    await expect(page.getByText("200 uur")).toBeVisible();
  });

  test("een module opent en toont de onderdelen", async ({ page }) => {
    await page.goto("/opleidingen/200-uurs-yin-yoga-specialist");

    const module2 = page.locator("details").nth(1);
    const onderdeel = module2.getByText(
      "Wat langdurige stress met het lichaam",
    );

    // Alleen de eerste module staat open; de rest is dichtgeklapt.
    await expect(onderdeel).toBeHidden();

    await module2.locator("summary").click();
    await expect(onderdeel).toBeVisible();
  });

  test("een onbekende opleiding geeft een nette 404", async ({ page }) => {
    const antwoord = await page.goto("/opleidingen/bestaat-niet");

    expect(antwoord?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Deze pagina bestaat niet" }),
    ).toBeVisible();
  });

  test("bevat gestructureerde gegevens voor zoekmachines", async ({ page }) => {
    await page.goto("/opleidingen/200-uurs-yin-yoga-specialist");

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(jsonLd ?? "{}");

    expect(data["@type"]).toBe("Course");
    expect(data.offers.price).toBe("2795.00");
    expect(data.offers.priceCurrency).toBe("EUR");
    expect(data.provider.name).toBe("YogaCompany");
  });
});

test.describe("Trainingen", () => {
  test("toont Eerst Jij en Hormoonyoga", async ({ page }) => {
    await page.goto("/trainingen");

    await expect(page.getByText("Eerst Jij")).toBeVisible();
    await expect(page.getByText("Hormoonyoga-training")).toBeVisible();
    await expect(page.getByText("€ 797")).toBeVisible();
    await expect(page.getByText("€ 295")).toBeVisible();
  });
});

test.describe("Contact", () => {
  test("wijst een te kort bericht af", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Naam").fill("Test Persoon");
    await page.getByLabel("E-mailadres").fill("test@voorbeeld.nl");
    await page.getByLabel("Je bericht").fill("kort");
    await page.getByRole("button", { name: "Verstuur bericht" }).click();

    await expect(page.getByText("Schrijf iets meer")).toBeVisible();
  });

  test("het telefoonnummer is niet verplicht", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByText("(niet verplicht)")).toBeVisible();
  });
});

test.describe("Juridische pagina's", () => {
  for (const [pad, kop] of [
    ["/privacyverklaring", "Privacyverklaring"],
    ["/algemene-voorwaarden", "Algemene voorwaarden"],
    ["/cookies", "Cookies"],
  ]) {
    test(`${pad} rendert met de conceptwaarschuwing`, async ({ page }) => {
      await page.goto(pad!);

      await expect(
        page.getByRole("heading", { name: kop!, level: 1 }),
      ).toBeVisible();
      await expect(
        page.getByText("moet nog juridisch worden getoetst"),
      ).toBeVisible();
    });
  }

  test("de privacyverklaring benoemt alle subverwerkers", async ({ page }) => {
    await page.goto("/privacyverklaring");

    for (const verwerker of [
      "Supabase",
      "Vercel",
      "Mollie",
      "Resend",
      "Anthropic",
      "Meta",
    ]) {
      await expect(page.getByText(verwerker, { exact: true })).toBeVisible();
    }
  });
});

test.describe("SEO", () => {
  test("de sitemap bevat alle publieke pagina's", async ({ request }) => {
    const antwoord = await request.get("/sitemap.xml");
    expect(antwoord.status()).toBe(200);

    const xml = await antwoord.text();
    expect(xml).toContain("/opleidingen/200-uurs-yin-yoga-specialist");
    expect(xml).toContain("/trainingen/eerst-jij");
    expect(xml).toContain("/privacyverklaring");
  });

  test("robots.txt sluit de afgeschermde delen uit", async ({ request }) => {
    const antwoord = await request.get("/robots.txt");
    const tekst = await antwoord.text();

    expect(tekst).toContain("Disallow: /admin");
    expect(tekst).toContain("Disallow: /portaal");
    expect(tekst).toContain("Sitemap:");
  });

  /**
   * Eén test per pagina, en niet vier pagina's in één test.
   *
   * De suite draait tegen `next dev`, die een route pas compileert bij het
   * eerste bezoek. Vier van die eerste bezoeken achter elkaar passen op een
   * koude CI-machine niet in de tijdslimiet van één test — dat is precies wat
   * er gebeurde toen de pijplijn voor het eerst draaide. Zo krijgt elke pagina
   * zijn eigen tijd, en wijst een rode test meteen de pagina aan.
   */
  for (const [pad, fragment] of [
    ["/", "opleidingsinstituut voor yoga"],
    ["/opleidingen", "Yogaopleidingen"],
    ["/over-ons", "Over ons"],
    ["/contact", "Contact"],
  ] as const) {
    test(`${pad} heeft een eigen titel en omschrijving`, async ({ page }) => {
      await page.goto(pad);
      await expect(page).toHaveTitle(new RegExp(fragment, "i"));

      const omschrijving = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(omschrijving?.length).toBeGreaterThan(50);
    });
  }
});

test.describe("Beveiligingsheaders", () => {
  test("de securityheaders staan op elke pagina", async ({ request }) => {
    const antwoord = await request.get("/");
    const headers = antwoord.headers();

    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
