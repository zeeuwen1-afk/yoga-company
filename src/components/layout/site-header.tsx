"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/opleidingen", label: "Opleidingen" },
  { href: "/trainingen", label: "Trainingen" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-xl leading-none font-semibold text-green-dark"
        >
          Yoga Companie
        </Link>

        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-7 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.95rem] text-ink transition-colors hover:text-green"
            >
              {item.label}
            </Link>
          ))}
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
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center border-b border-line/60 text-ink last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/inloggen"
            onClick={() => setOpen(false)}
            className="mt-3 mb-3 inline-flex h-11 items-center justify-center rounded-lg bg-green font-semibold text-cream"
          >
            Inloggen
          </Link>
        </nav>
      </div>
    </header>
  );
}
