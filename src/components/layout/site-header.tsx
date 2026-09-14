"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  /** Onderliggende pagina's; verschijnen als submenu onder het item. */
  sub?: { href: string; label: string }[];
};

const navigation: NavItem[] = [
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      {/* Breder dan de inhoud van de pagina's (max-w-6xl): het logo staat
          daardoor dichter bij de rand en de zes items in de balk krijgen de
          ruimte die "Yoga Company Academy" nodig heeft. */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="YogaCompany">
          {/* De compacte variant: merkteken en woordmerk, zonder de
              ondertitel. In een balk van veertig pixels hoog zou die op vier
              pixels uitkomen — onleesbaar klein is erger dan weglaten. De
              volledige variant staat in de paginavoet. Het beeld draagt geen
              tekst voor schermlezers, vandaar de aria-label op de link. */}
          <Image
            src="/brand/logo-compact-donker.png"
            alt=""
            width={900}
            height={248}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/* Pas vanaf 1280 pixels. Op 1024 brak de balk al vóór er een ingang
            bijkwam: "Yoga Company Academy" viel daar over drie regels, "Voor
            organisaties" en "Over ons" over twee, en het menu had 74 pixels
            nodig in een balk van 64. Met zeven ingangen is 1054 pixels aan
            woorden nodig, en dat past pas naast het logo en de twee knoppen
            vanaf 1280. Daaronder doet de menuknop het werk, en die was er al. */}
        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-6 xl:flex"
        >
          {navigation.map((item) =>
            item.sub ? (
              /* Het submenu opent op hover én op toetsenbordfocus. Bewust
                 zonder schakelaar in JavaScript: `focus-within` houdt het open
                 zolang iemand er met Tab doorheen loopt, en het bovenliggende
                 item blijft gewoon een link naar de pagina zelf. */
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-[0.95rem] text-ink transition-colors hover:text-green"
                >
                  {item.label}
                  <ChevronDown aria-hidden className="size-4 text-green" />
                </Link>

                <div className="invisible absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="min-w-44 rounded-lg border border-line bg-background py-1 shadow-lg">
                    {item.sub.map((onder) => (
                      <li key={onder.href}>
                        <Link
                          href={onder.href}
                          className="block px-4 py-2 text-[0.925rem] text-ink transition-colors hover:bg-hover hover:text-green"
                        >
                          {onder.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-[0.95rem] text-ink transition-colors hover:text-green"
              >
                {item.label}
              </Link>
            ),
          )}
          {/* Een lijn in plaats van een vlak: voor de bezoeker die een les
              zoekt is de docentenkant ruis, dus de inlogknop blijft de enige
              die roept. Voor de docent die hem zoekt is hij wel aanwezig. */}
          <Link
            href="/voor-yogadocenten"
            className="inline-flex h-10 items-center rounded-lg border border-green px-3.5 text-sm font-semibold text-green transition-colors hover:bg-hover"
          >
            Voor yogadocenten
          </Link>
          <Link
            href="/inloggen"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
          >
            Inloggen
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobiel-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-green-dark xl:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="mobiel-menu"
        hidden={!open}
        className={cn("border-t border-line bg-cream xl:hidden")}
      >
        <nav aria-label="Mobiel menu" className="flex flex-col px-4 py-2">
          {navigation.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-line/60 text-ink"
              >
                {item.label}
              </Link>
              {/* Geen uitklapper op de telefoon: die kost een extra tik voor
                  twee regels. Ze staan er meteen onder, ingesprongen. */}
              {item.sub?.map((onder) => (
                <Link
                  key={onder.href}
                  href={onder.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center border-b border-line/60 pl-4 text-[0.95rem] text-muted"
                >
                  {onder.label}
                </Link>
              ))}
            </div>
          ))}
          <Link
            href="/voor-yogadocenten"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-lg border border-green font-semibold text-green"
          >
            Voor yogadocenten
          </Link>
          <Link
            href="/inloggen"
            onClick={() => setOpen(false)}
            className="mt-2 mb-3 inline-flex h-11 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground"
          >
            Inloggen
          </Link>
        </nav>
      </div>
    </header>
  );
}
