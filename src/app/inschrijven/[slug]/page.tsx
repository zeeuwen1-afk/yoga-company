import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FormMessage } from "@/components/ui/form-message";
import { formateerPrijs, haalCursus } from "@/features/courses";
import { InschrijfKnop } from "@/features/enrollments/components/inschrijf-knop";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

export const metadata: Metadata = {
  title: "Inschrijven",
  robots: { index: false, follow: false },
};

export default async function InschrijvenPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ geannuleerd?: string }>;
}) {
  const { slug } = await params;
  const { geannuleerd } = await searchParams;

  const cursus = await haalCursus(slug);
  if (!cursus) notFound();

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  // Inschrijven kan alleen met een account (BOUWPROMPT §9).
  if (!gebruiker) {
    redirect(`/inloggen?vervolg=${encodeURIComponent(`/inschrijven/${slug}`)}`);
  }

  const overzichtPad =
    cursus.type === "opleiding" ? "/opleidingen" : "/trainingen";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <nav aria-label="Kruimelpad" className="text-sm text-muted">
            <Link
              href={`${overzichtPad}/${cursus.slug}`}
              className="underline hover:text-green"
            >
              Terug naar {cursus.titel}
            </Link>
          </nav>

          <h1 className="mt-4 text-4xl">Inschrijven</h1>

          {geannuleerd ? (
            <div className="mt-6">
              <FormMessage variant="fout">
                Je hebt de betaling afgebroken. Er is niets afgeschreven en je
                inschrijving staat nog klaar.
              </FormMessage>
            </div>
          ) : null}

          <div className="mt-8 rounded-[var(--radius-card)] border border-line p-6">
            <h2 className="text-xl">{cursus.titel}</h2>
            <p className="mt-2 text-sm text-muted">{cursus.samenvatting}</p>

            <dl className="mt-5 border-t border-line pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt>Totaalbedrag</dt>
                <dd className="font-serif text-2xl font-semibold text-green-dark">
                  {formateerPrijs(cursus.prijsCenten)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <InschrijfKnop slug={cursus.slug} />
          </div>

          <p className="mt-6 text-sm text-muted">
            Je betaalt met iDEAL of creditcard via Stripe. Wij zien of ontvangen
            je betaalgegevens nooit. Liever in termijnen betalen?{" "}
            <Link href="/contact" className="underline">
              Neem contact op
            </Link>{" "}
            — dat regelen we in overleg.
          </p>

          <p className="mt-3 text-xs text-muted">
            Door in te schrijven ga je akkoord met onze{" "}
            <Link href="/algemene-voorwaarden" className="underline">
              algemene voorwaarden
            </Link>
            . Als consument heb je veertien dagen bedenktijd.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
