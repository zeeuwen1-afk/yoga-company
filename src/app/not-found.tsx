import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  robots: { index: false, follow: false },
};

// Deze pagina valt buiten de (public)-groep en heeft daarom een eigen shell.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-cream">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <p className="text-sm font-semibold text-muted">Foutcode 404</p>
            <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">
              Deze pagina bestaat niet
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Misschien is de link verouderd of is er een typefout geslopen in
              het adres. Ga terug naar de startpagina of neem contact met ons
              op.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
              >
                Naar de startpagina
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-lg border border-line px-7 font-semibold text-green-dark transition-colors hover:bg-sand-light"
              >
                Contact opnemen
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
