import { expect, test } from "@playwright/test";

test.describe("Landingspagina", () => {
  test("stuurt bezoekers met een account naar de juiste omgeving", async ({
    page,
  }) => {
    await page.goto("/");

    // De twee inlogdeuren staan onderaan: eerst de bezoeker overtuigen, dan pas
    // de mensen die hier al thuis zijn.
    await expect(
      page.getByRole("heading", { name: "Mijn omgeving", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Docentenportal", level: 3 }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Inloggen als docent" }),
    ).toHaveAttribute("href", "/inloggen?vervolg=/docenten");
  });

  test("toont de drie ingangen en het waarom-blok", async ({ page }) => {
    await page.goto("/");

    // Elke deur draagt zijn categorie als label en een belofte als kop. Dat
    // label staat ook in het hoofdmenu, dus zoek hem binnen de deur zelf —
    // anders vindt de test op een telefoon het verborgen menu-item.
    for (const [kop, label] of [
      ["Elke week op de mat", "Yogalessen"],
      ["Verdiep je in één onderwerp", "Trainingen"],
      ["Leer het vak", "Opleidingen"],
    ] as const) {
      const deur = page.getByRole("listitem").filter({ hasText: kop });
      await expect(
        deur.getByRole("heading", { name: kop, level: 3 }),
      ).toBeVisible();
      await expect(deur.getByText(label, { exact: true })).toBeVisible();
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
      page.getByText("Module 4: Herstel & revalidatie"),
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
    test(`${pad} rendert zonder conceptwaarschuwing`, async ({ page }) => {
      await page.goto(pad!);

      await expect(
        page.getByRole("heading", { name: kop!, level: 1 }),
      ).toBeVisible();

      // De waarschuwing is een blok in de site-editor; leegmaken laat hem
      // verdwijnen. Hij hoort weg te zijn zodra de tekst is nagekeken, en
      // deze test bewaakt dat hij niet per ongeluk terugkomt.
      await expect(
        page.getByText("moet nog juridisch worden getoetst"),
      ).toHaveCount(0);
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

test.describe("Tarieven", () => {
  /**
   * De prijslijst staat twee keer in de pagina: als tabel voor een breed
   * scherm en als lijst voor een telefoon, waarvan er steeds één zichtbaar is.
   * De tests filteren daarom op zichtbaarheid — anders zou dezelfde test op
   * desktop slagen en op mobiel omvallen, of andersom.
   */
  const zichtbaar = (page: import("@playwright/test").Page, tekst: string) =>
    page.getByText(tekst, { exact: false }).filter({ visible: true });

  test("toont de prijslijst met de prijs per les", async ({ page }) => {
    await page.goto("/lessen/tarieven");

    await expect(
      page.getByRole("heading", { name: "Tarieven", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Lessen Rinske Yoga, Almere")).toBeVisible();

    await expect(zichtbaar(page, "10-strippenkaart").first()).toBeVisible();
    await expect(zichtbaar(page, "€ 145,00").first()).toBeVisible();
    // Het getal waarop mensen werkelijk vergelijken, en dat de voorbeeldsite
    // niet toont.
    await expect(zichtbaar(page, "€ 14,50").first()).toBeVisible();
  });

  test("licht één kaart uit als meest gekozen", async ({ page }) => {
    await page.goto("/lessen/tarieven");

    await expect(zichtbaar(page, "Meest gekozen").first()).toBeVisible();
  });

  test("noemt de annuleringsregel op de pagina zelf", async ({ page }) => {
    await page.goto("/lessen/tarieven");

    await expect(page.getByText("24 uur")).toBeVisible();
  });

  test("is bereikbaar via het menu onder Lessen", async ({ page }) => {
    await page.goto("/");

    const lessen = page
      .getByRole("navigation", { name: "Hoofdmenu" })
      .getByRole("link", { name: "Lessen" });

    if (await lessen.isVisible()) {
      // Op een breed scherm klapt het submenu open bij hover.
      await lessen.hover();
    } else {
      await page.getByRole("button", { name: "Menu openen" }).click();
    }

    await page.getByRole("link", { name: "Tarieven" }).first().click();
    await expect(page).toHaveURL(/\/lessen\/tarieven$/);
  });

  test("het zijbalkje staat naast het weekrooster", async ({ page }) => {
    await page.goto("/lessen");

    await expect(
      page.getByRole("heading", { name: "Strippenkaarten" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Kaart kopen" })).toBeVisible();
    // Dezelfde prijs als op de tarievenpagina: één lijst voedt allebei.
    await expect(zichtbaar(page, "€ 145,00").first()).toBeVisible();
  });

  test("aanvragen vraagt eerst om inloggen", async ({ page }) => {
    await page.goto("/lessen/tarieven/aanvragen?kaart=3");

    await expect(page).toHaveURL(/\/inloggen\?vervolg=/);
  });

  test("een kaart die niet bestaat geeft een nette 404", async ({ page }) => {
    const antwoord = await page.goto("/lessen/tarieven/aanvragen?kaart=99");

    expect(antwoord?.status()).toBe(404);
  });
});

test.describe("Voor yogadocenten", () => {
  test("is bereikbaar via de knop in de balk", async ({ page }) => {
    await page.goto("/");

    const knop = page
      .getByRole("navigation", { name: "Hoofdmenu" })
      .getByRole("link", { name: "Voor yogadocenten" });

    if (!(await knop.isVisible())) {
      await page.getByRole("button", { name: "Menu openen" }).click();
    }

    await page.getByRole("link", { name: "Voor yogadocenten" }).first().click();
    await expect(page).toHaveURL(/\/voor-yogadocenten$/);
    await expect(
      page.getByRole("heading", { name: "Voor yogadocenten", level: 1 }),
    ).toBeVisible();
  });

  /**
   * De twee dingen die bepalen of een docent meedoet: het geld blijft van hem,
   * en wat een kruisles kost. Allebei horen ze op de pagina zelf te staan en
   * niet in een gesprek achteraf.
   */
  test("noemt het bedrag en dat het geld niet via het platform loopt", async ({
    page,
  }) => {
    await page.goto("/voor-yogadocenten");

    await expect(page.getByText("€ 13,30")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Het geld loopt niet via ons" }),
    ).toBeVisible();
  });

  test("de docentenportal vraagt eerst om inloggen", async ({ page }) => {
    await page.goto("/docenten");
    await expect(page).toHaveURL(/\/inloggen\?vervolg=/);
  });

  test("mijn kaarten vraagt eerst om inloggen", async ({ page }) => {
    await page.goto("/portaal/kaarten");
    await expect(page).toHaveURL(/\/inloggen\?vervolg=/);
  });
});

test.describe("Docentenpagina's", () => {
  test("de lijst met docenten is openbaar", async ({ page }) => {
    await page.goto("/onze-docenten");

    await expect(
      page.getByRole("heading", { name: "Onze docenten", level: 2 }),
    ).toBeVisible();
  });

  /**
   * Een adres dat niet bestaat, een pagina die nog concept is, en een docent
   * zonder abonnement zijn van buitenaf niet te onderscheiden — alle drie een
   * 404. Dat is met opzet: een bezoeker hoeft niet te weten of iemand zijn
   * rekening niet betaald heeft.
   */
  test("een onbekende docent geeft een nette 404", async ({ page }) => {
    const antwoord = await page.goto("/docent/bestaat-niet");

    expect(antwoord?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Deze pagina bestaat niet" }),
    ).toBeVisible();
  });

  test("de editor vraagt eerst om inloggen", async ({ page }) => {
    await page.goto("/docenten/pagina");
    await expect(page).toHaveURL(/\/inloggen\?vervolg=/);
  });
});

test.describe("Voor organisaties", () => {
  test("de drie markten staan in de menubalk en op de startpagina", async ({
    page,
  }) => {
    await page.goto("/");

    for (const [pad, kop] of [
      ["/bedrijfsyoga", "Yoga op de werkvloer"],
      ["/sportclubs", "De dag na de wedstrijd"],
      ["/onderwijs", "Een lesuur waarin het stil wordt"],
    ] as const) {
      await expect(
        page.getByRole("link", { name: kop }).first(),
      ).toHaveAttribute("href", pad);
    }
  });

  for (const [pad, kop] of [
    ["/bedrijfsyoga", "Yoga op de werkvloer"],
    ["/sportclubs", "De dag na de wedstrijd"],
    ["/onderwijs", "Een lesuur waarin het stil wordt"],
  ] as const) {
    test(`${pad} toont de pagina met een aanvraagformulier`, async ({
      page,
    }) => {
      await page.goto(pad);

      await expect(
        page.getByRole("heading", { name: kop, level: 1 }),
      ).toBeVisible();

      // Het formulier vraagt méér dan een contactformulier: zonder de omvang
      // en de periode kan er geen prijs worden genoemd.
      await expect(page.getByLabel("Organisatie en plaats")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Verstuur de aanvraag" }),
      ).toBeVisible();
    });
  }
});

test.describe("Veiligheid en privacy", () => {
  test("is bereikbaar via de paginavoet", async ({ page }) => {
    await page.goto("/");

    // Stond in de menubalk; die was vol en dit is een pagina waar iemand
    // bewust naartoe gaat. Nu staat hij bij de juridische pagina's onderaan.
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Veiligheid" });

    await link.click();

    await expect(
      page.getByRole("heading", { name: "Veiligheid en privacy", level: 1 }),
    ).toBeVisible();
  });

  test("staat niet meer in de menubalk", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByRole("navigation", { name: "Hoofdmenu" })
        .getByRole("link", { name: "Veiligheid" }),
    ).toHaveCount(0);
  });

  /**
   * De kern staat er bewust boven de uitklappers: wie niets openklapt moet de
   * belangrijkste vier punten toch gelezen hebben. Zodra iemand ze achter een
   * uitklapper zou verstoppen, valt deze test om.
   */
  test("toont de kern zonder dat er iets opengeklapt hoeft", async ({
    page,
  }) => {
    await page.goto("/veiligheid");

    await expect(
      page.getByText("Je gegevens staan in Frankfurt"),
    ).toBeVisible();
    await expect(page.getByText("Alleen jij ziet jouw dossier")).toBeVisible();
    await expect(page.getByText("Je wachtwoord kennen we niet")).toBeVisible();
    await expect(page.getByText("We volgen je niet")).toBeVisible();
  });

  test("een uitklapper opent en toont het antwoord", async ({ page }) => {
    await page.goto("/veiligheid");

    const antwoord = page.getByText("Bij veel websites is de website zelf");
    await expect(antwoord).not.toBeVisible();

    await page
      .getByText("Hoe weten jullie zo zeker dat niemand anders bij mijn")
      .click();

    await expect(antwoord).toBeVisible();
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
    expect(xml).toContain("/veiligheid");
    expect(xml).toContain("/lessen/tarieven");
    expect(xml).toContain("/voor-yogadocenten");
    expect(xml).toContain("/onze-docenten");
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
    ["/veiligheid", "Veiligheid en privacy"],
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

    // De tests draaien op localhost, en dat is niet het eigen domein: de site
    // hoort zichzelf dan uit de zoekmachines te houden. Op yogacompany.eu
    // hoort deze header juist te verdwijnen — zie src/lib/domein.ts.
    expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});
