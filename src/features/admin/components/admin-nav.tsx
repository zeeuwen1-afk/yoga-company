"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAVIGATIE, isAdminActief } from "../navigatie";

/**
 * Navigatie van de beheeromgeving (BOUWPROMPT §13).
 *
 * Beheer gebeurt vrijwel altijd achter een laptop, dus dit is een zijbalk en
 * geen bottom-navigatie zoals in het klantportaal. Op een klein scherm klapt
 * hij uit, zodat het onderweg ook te doen is.
 */
export function AdminNav() {
  const pad = usePathname();
  const [open, setOpen] = useState(false);

  const lijst = (
    <div className="space-y-6">
      {ADMIN_NAVIGATIE.map((groep) => (
        <div key={groep.titel}>
          <p className="px-3 text-xs font-semibold tracking-wide text-muted uppercase">
            {groep.titel}
          </p>
          <ul className="mt-2 space-y-0.5">
            {groep.items.map((item) => {
              const actief = isAdminActief(item.href, pad);
              const Icoon = item.icoon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={actief ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.95rem] transition-colors",
                      actief
                        ? "bg-white font-semibold text-green-dark"
                        : "text-ink hover:bg-white/60",
                    )}
                  >
                    <Icoon className="size-5 shrink-0 text-muted" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.komtLater ? (
                      <span className="text-xs text-muted">
                        {item.komtLater}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((waarde) => !waarde)}
        aria-expanded={open}
        aria-controls="admin-menu"
        className="mb-4 inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 font-semibold text-green-dark lg:hidden"
      >
        {open ? (
          <X className="size-5" aria-hidden />
        ) : (
          <Menu className="size-5" aria-hidden />
        )}
        Menu
      </button>

      <nav
        id="admin-menu"
        aria-label="Beheermenu"
        className={cn(
          "w-full shrink-0 lg:block lg:w-56 lg:pt-8",
          open ? "block pb-6" : "hidden",
        )}
      >
        <div className="lg:sticky lg:top-24">{lijst}</div>
      </nav>
    </>
  );
}
