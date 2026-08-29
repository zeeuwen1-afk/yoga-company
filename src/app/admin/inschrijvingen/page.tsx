import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  StatusPil,
  datumKort,
} from "@/features/admin/components/ui";
import { formateerPrijs, haalAanbod } from "@/features/courses";
import {
  BetaallinkMaken,
  HandmatigBetaald,
} from "@/features/enrollments/components/admin-inschrijving-acties";
import { haalInschrijvingen } from "@/features/enrollments/server/admin-queries";
import type { EnrollmentStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Inschrijvingen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSSEN: EnrollmentStatus[] = [
  "in_afwachting",
  "betaald",
  "afgerond",
  "geannuleerd",
];

export default async function InschrijvingenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const gekozen = STATUSSEN.find((optie) => optie === status);

  const [inschrijvingen, aanbod] = await Promise.all([
    haalInschrijvingen({ status: gekozen }),
    haalAanbod(),
  ]);

  const totaalBetaald = inschrijvingen
    .filter((rij) => rij.status === "betaald" || rij.status === "afgerond")
    .reduce((som, rij) => som + (rij.bedragCenten ?? 0), 0);

  return (
    <>
      <AdminKop
        titel="Inschrijvingen"
        toelichting={`${inschrijvingen.length} ${
          inschrijvingen.length === 1 ? "inschrijving" : "inschrijvingen"
        } · ${formateerPrijs(totaalBetaald)} ontvangen`}
      />

      <nav aria-label="Filter op status" className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/inschrijvingen"
          className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
            gekozen
              ? "border-line hover:bg-hover"
              : "border-primary bg-primary text-primary-foreground"
          }`}
        >
          Alle
        </Link>
        {STATUSSEN.map((optie) => (
          <Link
            key={optie}
            href={`/admin/inschrijvingen?status=${optie}`}
            className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
              gekozen === optie
                ? "border-primary bg-primary text-primary-foreground"
                : "border-line hover:bg-hover"
            }`}
          >
            {optie === "in_afwachting"
              ? "In afwachting"
              : optie.charAt(0).toUpperCase() + optie.slice(1)}
          </Link>
        ))}
      </nav>

      <Paneel>
        {inschrijvingen.length === 0 ? (
          <LegeLijst>Geen inschrijvingen met dit filter.</LegeLijst>
        ) : (
          <ul className="divide-y divide-line">
            {inschrijvingen.map((rij) => (
              <li key={rij.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/klanten/${rij.klantId}`}
                      className="font-semibold hover:text-green"
                    >
                      {rij.klantNaam}
                    </Link>
                    <p className="text-sm text-muted">{rij.cursusTitel}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      Ingeschreven {datumKort(rij.aangemaaktOp)}
                      {rij.betaaldOp
                        ? ` · betaald ${datumKort(rij.betaaldOp)}`
                        : null}
                      {rij.bedragCenten
                        ? ` · ${formateerPrijs(rij.bedragCenten)}`
                        : null}
                    </p>
                  </div>
                  <StatusPil status={rij.status} />
                </div>

                {rij.status === "in_afwachting" ? (
                  <div className="mt-4 space-y-3">
                    <HandmatigBetaald
                      enrollmentId={rij.id}
                      standaardBedragCenten={rij.cursusPrijsCenten}
                    />
                    <BetaallinkMaken
                      enrollmentId={rij.id}
                      cursusTitel={rij.cursusTitel}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Paneel>

      <div className="mt-6">
        <Paneel titel="Voortgang per opleiding">
          {aanbod.filter((cursus) => cursus.digitaleContent).length === 0 ? (
            <LegeLijst>
              Geen opleidingen met digitaal lesmateriaal om te volgen.
            </LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {aanbod
                .filter((cursus) => cursus.digitaleContent)
                .map((cursus) => (
                  <li key={cursus.slug} className="px-5 py-3">
                    <Link
                      href={`/admin/monitoring/${cursus.slug}`}
                      className="font-semibold hover:text-green"
                    >
                      {cursus.titel}
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Paneel>
      </div>
    </>
  );
}
