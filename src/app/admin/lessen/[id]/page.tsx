import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOEKING_LABEL,
  formateerDag,
  formateerTijdvak,
} from "@/features/bookings";
import {
  AanwezigheidKnop,
  LesAfgelastenFormulier,
} from "@/features/bookings/components/deelnemer-acties";
import { LesFormulier } from "@/features/bookings/components/les-formulier";
import {
  haalBeheerLes,
  haalDeelnemers,
} from "@/features/bookings/server/admin-queries";

export const metadata: Metadata = {
  title: "Les",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const les = await haalBeheerLes(id);
  if (!les) notFound();

  const deelnemers = await haalDeelnemers(id);
  const aanwezig = deelnemers.filter(
    (deelnemer) =>
      deelnemer.status === "geboekt" || deelnemer.status === "niet_verschenen",
  );
  const wachtlijst = deelnemers.filter(
    (deelnemer) => deelnemer.status === "wachtlijst",
  );
  const afgemeld = deelnemers.filter(
    (deelnemer) => deelnemer.status === "geannuleerd",
  );

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/lessen"
          className="inline-flex h-11 items-center gap-2 text-sm font-semibold text-green-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Terug naar het rooster
        </Link>

        <h1 className="mt-2 text-3xl">{les.titel}</h1>
        <p className="mt-2 text-muted first-letter:uppercase">
          {formateerDag(les.begintOp)} ·{" "}
          {formateerTijdvak(les.begintOp, les.duurMinuten)} · {les.locatie}
        </p>
        {les.afgelastOp ? (
          <p className="mt-3 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            Deze les is afgelast
            {les.afgelastReden ? `: ${les.afgelastReden}` : "."} De deelnemers
            zien dat in hun portaal, maar krijgen er geen bericht van — stuur ze
            dat zelf even.
          </p>
        ) : null}
      </div>

      <section>
        <h2 className="text-xl">
          Deelnemers ({aanwezig.length} van {les.capaciteit})
        </h2>

        {aanwezig.length === 0 ? (
          <p className="mt-3 text-muted">Er heeft nog niemand geboekt.</p>
        ) : (
          <ul className="mt-4 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {aanwezig.map((deelnemer) => (
              <li
                key={deelnemer.boekingId}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/klanten/${deelnemer.profielId}`}
                    className="font-semibold text-green-dark hover:underline"
                  >
                    {deelnemer.naam}
                  </Link>
                  <p className="text-sm text-muted">{deelnemer.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  {deelnemer.status === "niet_verschenen" ? (
                    <span className="text-sm font-semibold text-error">
                      Niet verschenen
                    </span>
                  ) : null}
                  <AanwezigheidKnop
                    boekingId={deelnemer.boekingId}
                    lesId={les.id}
                    afwezig={deelnemer.status === "niet_verschenen"}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {wachtlijst.length > 0 ? (
        <section>
          <h2 className="text-xl">Wachtlijst ({wachtlijst.length})</h2>
          <p className="mt-2 text-sm text-muted">
            Op volgorde van aanmelden. Wie bovenaan staat schuift automatisch
            door zodra een deelnemer annuleert.
          </p>
          <ol className="mt-4 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {wachtlijst.map((deelnemer, index) => (
              <li
                key={deelnemer.boekingId}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="label-klein">{index + 1}</span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/klanten/${deelnemer.profielId}`}
                    className="font-semibold text-green-dark hover:underline"
                  >
                    {deelnemer.naam}
                  </Link>
                  <p className="text-sm text-muted">{deelnemer.email}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {afgemeld.length > 0 ? (
        <section>
          <h2 className="text-xl">Afgemeld ({afgemeld.length})</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {afgemeld.map((deelnemer) => (
              <li key={deelnemer.boekingId}>
                {deelnemer.naam} —{" "}
                {BOEKING_LABEL[deelnemer.status].toLowerCase()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Les aanpassen</CardTitle>
        </CardHeader>
        <CardContent>
          <LesFormulier les={les} />
        </CardContent>
      </Card>

      {!les.afgelastOp ? (
        <Card>
          <CardHeader>
            <CardTitle>Les afgelasten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 max-w-prose text-sm text-muted">
              De les en de boekingen blijven staan, zodat de deelnemers kunnen
              zien dat hij niet doorgaat en jij de lijst houdt om ze te
              bereiken.
            </p>
            <LesAfgelastenFormulier lesId={les.id} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
