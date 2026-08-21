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
  { href: "/opleidingen", label: "Opleidingen" },
  { href: "/trainingen", label: "Trainingen" },
  {
    href: "/lessen",
    label: "Lessen",
    sub: [
      { href: "/lessen", label: "Weekrooster" },
      { href: "/lessen/tarieven", label: "Tarieven" },
    ],
  },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
  { href: "/veiligheid", label: "Veiligheid" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="YogaCompany">
          {/* De compacte variant: merkteken en woordmerk, zonder de
              ondertitel. In een balk van veertig pixels hoog zou die op vier
              pixels uitkomen — onleesbaar klein is erger dan weglaten. De
              volledige variant staat in de paginavoet. Het beeld draagt geen
              tekst voor schermlezers, vandaar de aria-label op de link. */}
          <Image
            src="/brand/logo-compact.png"
            alt=""
            width={900}
            height={248}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-7 md:flex"
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
                          className="block px-4 py-2 text-[0.925rem] text-ink transition-colors hover:bg-cream hover:text-green"
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
            className="inline-flex h-10 items-center rounded-lg border border-green px-3.5 text-sm font-semibold text-green transition-colors hover:bg-cream"
          >
            Voor yogadocenten
          </Link>
          <Link
            href="/inloggen"
            className="inline-flex h-10 items-center rounded-lg bg-green px-4 text-sm font-semibold text-cream transition-colors hover:bg-green-dark"
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
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-green-dark md:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="mobiel-menu"
        hidden={!open}
        className={cn("border-t border-line bg-cream md:hidden")}
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
            className="mt-2 mb-3 inline-flex h-11 items-center justify-center rounded-lg bg-green font-semibold text-cream"
          >
            Inloggen
          </Link>
        </nav>
      </div>
    </header>
  );
}
