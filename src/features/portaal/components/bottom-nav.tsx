"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isActief, PORTAAL_NAVIGATIE } from "../navigatie";

/**
 * Bottom-navigatie voor de telefoon (bouwprompt §9).
 *
 * Vijf items — het maximum dat §9 toestaat — elk met een tap-target van
 * minstens 56 pixels hoog, ruim boven de 44px die de richtlijn vraagt. Dit is
 * de plek waar mensen met een duim mikken. Verdwijnt vanaf tabletformaat,
 * waar de zijbalk het overneemt.
 */
export function PortaalBottomNav({ ongelezen }: { ongelezen: number }) {
  const pad = usePathname();
  const items = PORTAAL_NAVIGATIE.filter((item) => item.mobiel);

  return (
    <nav
      aria-label="Hoofdmenu"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden"
      // Ruimte voor de thuisbalk van moderne telefoons.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {items.map((item) => {
          const actief = isActief(item.href, pad);
          const Icoon = item.icoon;
          const teller = item.teller === "ongelezen" ? ongelezen : 0;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={actief ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs",
                  actief ? "font-semibold text-green" : "text-muted",
                )}
              >
                <span className="relative">
                  <Icoon className="size-6" aria-hidden />
                  {teller > 0 ? (
                    <span
                      className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-semibold text-cream"
                      aria-hidden
                    >
                      {teller > 9 ? "9+" : teller}
                    </span>
                  ) : null}
                </span>
                {item.label}
                {teller > 0 ? (
                  <span className="sr-only">{teller} ongelezen</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
