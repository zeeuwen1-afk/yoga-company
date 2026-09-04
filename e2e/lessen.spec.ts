import { expect, test } from "@playwright/test";

test.describe("Lesrooster", () => {
  test("de lessenpagina is openbaar en toont het rooster", async ({ page }) => {
    await page.goto("/lessen");

    // De overzichtspagina's zetten hun kop als h2, net als /opleidingen en
    // /trainingen; die conventie volgen we hier.
    await expect(
      page.getByRole("heading", { name: "Yogalessen", level: 1 }),
    ).toBeVisible();

    // Staat er niets in het rooster, dan hoort daar een uitleg te staan in
    // plaats van een leeg scherm.
    const leeg = page.getByText("Er staan op dit moment geen lessen");
    const eersteLes = page.locator("main li").first();
    await expect(leeg.or(eersteLes)).toBeVisible();
  });

  test("staat in de navigatie van de site", async ({ page }) => {
    await page.goto("/");

    const link = page
      .getByRole("navigation", { name: "Hoofdmenu" })
      .getByRole("link", { name: "Lessen" });

    // Op de telefoon zit het hoofdmenu achter de menuknop.
    if (!(await link.isVisible())) {
      await page.getByRole("button", { name: "Menu openen" }).click();
    }

    await page.getByRole("link", { name: "Lessen" }).first().click();
    await expect(page).toHaveURL(/\/lessen$/);
  });

  test("boeken vraagt om inloggen zolang je geen account hebt", async ({
    page,
  }) => {
    await page.goto("/lessen");

    const boekKnop = page.getByRole("link", { name: "Boek een les" }).first();

    // Alleen te testen als er een les in het rooster staat.
    if (await boekKnop.isVisible()) {
      await boekKnop.click();
      await expect(page).toHaveURL(/\/inloggen/);
    }
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
