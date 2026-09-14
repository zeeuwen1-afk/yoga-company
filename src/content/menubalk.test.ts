import { describe, expect, it } from "vitest";

import { BLOKKEN } from "./blokken";
import { alsRegels, bouwMenu, VASTE_BALK, type MenuRegel } from "./menubalk";

const regel = (titel: string, href: string, onder?: string): MenuRegel => ({
  titel,
  href,
  onder,
});

describe("bouwMenu", () => {
  it("maakt van een platte lijst een balk met uitklapmenu's", () => {
    const menu = bouwMenu([
      regel("Yoga Company Academy", "/opleidingen"),
      regel(
        "Losse modules",
        "/opleidingen#losse-modules",
        "Yoga Company Academy",
      ),
      regel(
        "Waar de Academy voor staat",
        "/opleidingen/academy",
        "Yoga Company Academy",
      ),
      regel("Workshops", "/workshops"),
      regel("Privéyoga", "/lessen/tarieven#prive"),
    ]);

    expect(menu.map((ingang) => ingang.label)).toEqual([
      "Yoga Company Academy",
      "Workshops",
      "Privéyoga",
    ]);
    expect(menu[0]!.sub?.map((onder) => onder.label)).toEqual([
      "Losse modules",
      "Waar de Academy voor staat",
    ]);
    expect(menu[1]!.sub).toBeUndefined();
  });

  it("houdt de volgorde van de lijst aan", () => {
    const menu = bouwMenu([
      regel("Contact", "/contact"),
      regel("Over ons", "/over-ons"),
    ]);

    expect(menu.map((ingang) => ingang.label)).toEqual(["Contact", "Over ons"]);
  });

  it("trekt zich niets aan van hoofdletters en spaties in het veld valt onder", () => {
    const menu = bouwMenu([
      regel("Voor organisaties", "/bedrijfsyoga"),
      regel("Bedrijven", "/bedrijfsyoga", "  VOOR ORGANISATIES "),
    ]);

    expect(menu).toHaveLength(1);
    expect(menu[0]!.sub?.[0]?.label).toBe("Bedrijven");
  });

  it("laat een regel weg zonder titel of zonder werkend adres", () => {
    // Een halve regel is wat je overhoudt als iemand een ingang toevoegt en
    // hem niet invult. Die hoort niet als lege knop in de balk te komen.
    const menu = bouwMenu([
      regel("", "/contact"),
      regel("Contact", ""),
      regel("Contact", "geen adres"),
      regel("Over ons", "/over-ons"),
    ]);

    expect(menu.map((ingang) => ingang.label)).toEqual(["Over ons"]);
  });

  it("zet een regel in de balk als het veld valt onder nergens op slaat", () => {
    // Liever een ingang te veel dan een pagina die door een typfout
    // onvindbaar wordt.
    const menu = bouwMenu([
      regel("Workshops", "/workshops"),
      regel("Privéyoga", "/lessen/tarieven#prive", "Wrokshops"),
    ]);

    expect(menu.map((ingang) => ingang.label)).toEqual([
      "Workshops",
      "Privéyoga",
    ]);
  });

  it("maakt van een titel met een enter toch één regel", () => {
    // Het veld is één regel in het scherm, maar geplakte tekst kan een
    // regeleinde meebrengen, en dat breekt de balk in tweeën.
    const menu = bouwMenu([regel("Over\nons", "/over-ons")]);

    expect(menu[0]!.label).toBe("Over ons");
  });

  it("geeft een lege lijst terug bij niets bruikbaars", () => {
    // De balk valt dan terug op de vaste lijst; dat gebeurt bij de aanroeper.
    expect(bouwMenu([])).toEqual([]);
    expect(bouwMenu([regel("", "")])).toEqual([]);
  });
});

/**
 * De balk die de bezoeker ziet komt uit de database, met de vaste lijst als
 * vangnet. Die twee moeten hetzelfde opleveren zolang niemand iets wijzigt —
 * anders verspringt het menu bij de eerste keer opslaan, of toont een storing
 * een andere site dan normaal.
 */
describe("de startinhoud en het vangnet zijn dezelfde balk", () => {
  const blok = BLOKKEN.find(
    (kandidaat) =>
      kandidaat.page_key === "menubalk" && kandidaat.block_key === "ingangen",
  );

  it("staat als bewerkbaar blok in de startinhoud", () => {
    expect(blok).toBeDefined();
    expect(blok!.lijst).toBeDefined();
    expect(blok!.value).toHaveProperty("items");
  });

  it("levert precies de vaste balk op", () => {
    const items = (blok!.value as { items: MenuRegel[] }).items;
    expect(bouwMenu(items)).toEqual(VASTE_BALK);
  });

  it("past binnen het maximum dat het bewerkscherm toestaat", () => {
    const items = (blok!.value as { items: MenuRegel[] }).items;
    expect(items.length).toBeLessThanOrEqual(blok!.lijst!.max);
  });

  it("houdt de balk zelf op zeven ingangen", () => {
    // Meer past er niet naast het logo en de twee knoppen; bij acht viel de
    // balk over twee regels.
    expect(VASTE_BALK).toHaveLength(7);
  });

  it("gaat heen en weer zonder iets te verliezen", () => {
    expect(bouwMenu(alsRegels(VASTE_BALK))).toEqual(VASTE_BALK);
  });
});
