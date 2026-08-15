import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  /**
   * Ruimer dan de standaard vijf seconden.
   *
   * De suite draait tegen `next dev`, en die compileert een route pas bij het
   * eerste bezoek. Met meerdere workers tegelijk duurt dat af en toe langer
   * dan vijf seconden, en dan valt een test om terwijl er niets mis is. Tegen
   * een productiebuild draaien zou dat oplossen, maar de styleguide op
   * /dev/styleguide bestaat daar bewust niet — die hoort niet op een
   * openbare server thuis.
   */
  expect: { timeout: 15_000 },

  /**
   * En om dezelfde reden een ruimere tijdslimiet per test op CI. De machine
   * daar is trager dan deze en compileert elke route koud. Dertig seconden —
   * de standaard — is dan krap, en een test die omvalt omdat de machine traag
   * was zegt niets over de code.
   */
  timeout: process.env.CI ? 60_000 : 30_000,

  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobiel", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
