import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Sectie } from "@/components/layout/sectie";
import { KaartKnop } from "@/features/requests/components/kaart-knop";
import { haalTarief } from "@/features/requests/server/strippenkaart";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

export const metadata: Metadata = {
  title: "Kaart aanvragen",
  robots: { index: false, follow: false },
};

export default async function KaartAanvragenPage({
  searchParams,
}: {
  searchParams: Promise<{ kaart?: string }>;
}) {
  const { kaart } = await searchParams;
  const index = Number(kaart);

  if (!Number.isInteger(index) || index < 0) notFound();

  const tarief = await haalTarief(index);
  if (!tarief) notFound();

  // Aanvragen kan alleen met een account: de aanvraag hangt aan een profiel,
  // en zonder dat weten we niet wie er iets vraagt (§9).
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    redirect(
      `/inloggen?vervolg=${encodeURIComponent(`/lessen/tarieven/aanvragen?kaart=${index}`)}`,
    );
  }

  return (
    <Sectie>
      <div className="mx-auto max-w-xl">
        <nav aria-label="Kruimelpad" className="text-sm text-muted">
          <Link href="/lessen/tarieven" className="underline hover:text-green">
            Terug naar de tarieven
          </Link>
        </nav>

        <h1 className="mt-4 text-4xl">Kaart aanvragen</h1>

        <div className="mt-8 rounded-[var(--radius-card)] border border-line p-6">
          <h2 className="text-xl">{tarief.naam}</h2>
          {tarief.toelichting ? (
            <p className="mt-1 text-sm text-muted">{tarief.toelichting}</p>
          ) : null}

          <dl className="mt-5 space-y-2 border-t border-line pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt>Bedrag</dt>
              <dd className="font-serif text-2xl font-semibold text-green-dark tabular-nums">
                {tarief.prijs}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-sm text-muted">
              <dt>Per les</dt>
              <dd className="tabular-nums">{tarief.per_les}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-sm text-muted">
              <dt>Geldig</dt>
              <dd>{tarief.geldig}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <KaartKnop index={index} />
          </div>
        </div>
      </div>
    </Sectie>
  );
}
