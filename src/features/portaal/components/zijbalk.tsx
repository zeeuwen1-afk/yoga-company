"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isActief, PORTAAL_NAVIGATIE } from "../navigatie";

/** Zijbalk voor tablet en groter; op de telefoon neemt de bottom-nav het over. */
export function PortaalZijbalk({
  ongelezen,
  openAanvragen,
}: {
  ongelezen: number;
  openAanvragen: number;
}) {
  const pad = usePathname();

  return (
    <nav
      aria-label="Portaalmenu"
      className="hidden w-56 shrink-0 pt-8 md:block"
    >
      <ul className="sticky top-24 space-y-1">
        {PORTAAL_NAVIGATIE.map((item) => {
          const actief = isActief(item.href, pad);
          const Icoon = item.icoon;
          const teller =
            item.teller === "ongelezen"
              ? ongelezen
              : item.teller === "openAanvragen"
                ? openAanvragen
                : 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
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
                {teller > 0 ? (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-green px-1.5 text-xs font-semibold text-cream">
                    {teller}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
