/**
 * De menubalk: welke ingangen erin staan en in welke volgorde.
 *
 * Dit bestand staat in `content` en niet bij de balk zelf, om twee redenen.
 * De startinhoud in `blokken.ts` wordt eruit opgebouwd, en dat bestand wordt
 * ook rechtstreeks door Node gelezen bij `pnpm db:generate-seed` — vandaar de
 * import mét bestandsextensie daar, en hier geen pad-aliassen of imports die
 * alleen Next begrijpt. En de balk zelf is een clientcomponent: die mag niet
 * de hele `blokken.ts` meenemen naar de browser om aan zijn lijst te komen.
 *
 * De beheerder bewerkt de balk in de site-editor als één platte lijst: per
 * regel een titel, een adres en een veld "valt onder". Dat is met opzet geen
 * boom met knoppen. Een boom van twee niveaus met een "voeg hier iets toe" per
 * tak levert een scherm vol knoppen op waarin je de goede moet zoeken, terwijl
 * de balk zeven ingangen telt. Een lijst met één extra veld is wat je toch al
 * zou opschrijven.
 */

export type MenuIngang = {
  href: string;
  label: string;
  /** Onderliggende pagina's; verschijnen als submenu onder het item. */
  sub?: { href: string; label: string }[];
};

/** Eén regel zoals hij in het bewerkscherm staat. */
export type MenuRegel = {
  titel?: string;
  href?: string;
  /** De titel van de ingang waar deze regel onder hangt. Leeg is in de balk. */
  onder?: string;
};

/**
 * De balk zoals hij is zolang niemand hem heeft aangeraakt.
 *
 * Dit is tegelijk de startinhoud van het bewerkbare blok én het vangnet: komt
 * er uit de database geen bruikbare lijst, dan toont de site deze. De
 * navigatie is daarmee niet stuk te maken vanuit de editor.
 */
export const VASTE_BALK: MenuIngang[] = [
  {
    // De Academy is de paraplu boven het opleidingsaanbod. Het adres blijft
    // /opleidingen: dat staat in Google en in bestaande links.
    href: "/opleidingen",
    label: "Yoga Company Academy",
    // Eerst de twee opleidingen van 200 uur, daarna wat je er los uit kunt
    // volgen. Dat is ook de volgorde waarin iemand kiest: eerst welke route,
    // dan of hij hem in stukken doet.
    sub: [
      {
        href: "/opleidingen/200-uurs-yogaopleiding",
        label: "200-uurs Yogaopleiding",
      },
      {
        href: "/opleidingen/200-uurs-yin-yoga-specialist",
        label: "200-uurs Yin Yoga Specialist",
      },
      { href: "/opleidingen#losse-modules", label: "Losse modules" },
      { href: "/opleidingen/academy", label: "Waar de Academy voor staat" },
      {
        href: "/opleidingen/academy#registreren",
        label: "Je opleiding registreren",
      },
    ],
  },
  // Workshops hebben sinds september 2026 hun eigen pagina, met een pagina per
  // workshop eronder. Het uitklapmenu eronder is weg: het bevatte één regel
  // naar diezelfde pagina, één naar privéyoga en één naar de tarieven. Dat is
  // een menu dat je moet openklappen om te ontdekken dat je er niets aan hebt.
  { href: "/workshops", label: "Workshops" },
  // Privéyoga stond onder Workshops en was daar niet te vinden voor wie er
  // juist voor kwam. Het adres wijst naar het stuk over privéyoga op de
  // tarievenpagina; dat is waar de tarieven staan.
  { href: "/lessen/tarieven#prive", label: "Privéyoga" },
  {
    // Eén ingang voor de drie markten waar niet de deelnemer betaalt maar zijn
    // werkgever, club of school. Drie losse items zouden de balk overladen en
    // ze op één hoop gooien met het aanbod waar iemand zelf voor kiest.
    href: "/bedrijfsyoga",
    label: "Voor organisaties",
    sub: [
      { href: "/bedrijfsyoga", label: "Bedrijven" },
      { href: "/sportclubs", label: "Sportclubs" },
      { href: "/onderwijs", label: "Onderwijs" },
    ],
  },
  // Hierna de losse pagina's, zonder uitklapmenu.
  { href: "/trainingen", label: "Trainingen" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
  // "Veiligheid" stond hier ook; die staat nu in de paginavoet bij de
  // juridische pagina's. Dat is een pagina waar iemand bewust naartoe gaat, en
  // hij kostte een van de plekken die de balk aankan. Zeven ingangen is het
  // maximum: daarboven knelt de balk ook op een breed scherm.
];

/**
 * De balk plat slaan tot de regels die de beheerder in het scherm ziet.
 *
 * Zo staat de startinhoud van het bewerkbare blok niet een tweede keer
 * uitgeschreven naast de lijst hierboven. Twee kopieën zouden na de eerste
 * wijziging uit elkaar lopen, en dan toont de site iets anders dan wat er in
 * de editor staat.
 */
export function alsRegels(
  balk: MenuIngang[],
): { titel: string; href: string; onder: string }[] {
  return balk.flatMap((ingang) => [
    { titel: ingang.label, href: ingang.href, onder: "" },
    ...(ingang.sub ?? []).map((onder) => ({
      titel: onder.label,
      href: onder.href,
      onder: ingang.label,
    })),
  ]);
}

/**
 * Wat telt als een adres waar je heen kunt.
 *
 * Bewust geen terugval naar de startpagina bij onzin: een ingang die ergens
 * anders uitkomt dan hij belooft is erger dan een ingang die er niet is. Wat
 * hier niet doorheen komt, laat de balk weg.
 */
const ADRES = /^(\/[^\s]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/;

/** Eén regel tot bruikbare tekst maken; een titel is altijd één regel. */
function schoon(waarde: string | undefined): string {
  return (waarde ?? "").replace(/\s+/g, " ").trim();
}

/** Bouwt de balk op uit de regels van de beheerder. */
export function bouwMenu(regels: MenuRegel[]): MenuIngang[] {
  const bruikbaar = regels
    .map((regel) => ({
      label: schoon(regel.titel),
      href: schoon(regel.href),
      onder: schoon(regel.onder),
    }))
    .filter((regel) => regel.label !== "" && ADRES.test(regel.href));

  const sleutel = (waarde: string) => waarde.toLowerCase();
  const hoofditems = new Map<string, MenuIngang>();
  const uit: MenuIngang[] = [];

  // Eerste ronde: alles zonder "valt onder" wordt een ingang in de balk.
  for (const regel of bruikbaar) {
    if (regel.onder !== "") continue;
    const ingang: MenuIngang = { href: regel.href, label: regel.label };
    // Staat een titel er twee keer, dan wint de eerste als ouder. De tweede
    // komt gewoon in de balk; hem weglaten zou een link laten verdwijnen.
    if (!hoofditems.has(sleutel(ingang.label))) {
      hoofditems.set(sleutel(ingang.label), ingang);
    }
    uit.push(ingang);
  }

  // Tweede ronde: de rest hangt onder de ingang met die titel. Slaat het veld
  // "valt onder" nergens op, dan komt de regel zelf in de balk — lelijker dan
  // bedoeld, maar de pagina blijft bereikbaar. Hem weglaten zou hem onvindbaar
  // maken door een typfout in een ander veld.
  for (const regel of bruikbaar) {
    if (regel.onder === "") continue;
    const item = { href: regel.href, label: regel.label };
    const ouder = hoofditems.get(sleutel(regel.onder));

    if (ouder) {
      (ouder.sub ??= []).push(item);
    } else {
      uit.push(item);
    }
  }

  return uit;
}
