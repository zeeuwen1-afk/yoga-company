import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formateerDag, formateerTijdvak } from "@/features/bookings";
import { LesFormulier } from "@/features/bookings/components/les-formulier";
import { haalBeheerRooster } from "@/features/bookings/server/admin-queries";

export const metadata: Metadata = {
  title: "Lesrooster",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLessenPage() {
  const rooster = await haalBeheerRooster();
  const nu = Date.now();
  const komend = rooster.filter(
    (les) => new Date(les.begintOp).getTime() >= nu,
  );
  const geweest = rooster
    .filter((les) => new Date(les.begintOp).getTime() < nu)
    .reverse()
    .slice(0, 20);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl">Lesrooster</h1>
        <p className="mt-2 max-w-2xl text-muted">
          De wekelijkse yogalessen. Klanten boeken hier hun plek; is een les
          vol, dan komen ze op de wachtlijst en schuiven ze vanzelf door zodra
          er iemand annuleert.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nieuwe les</CardTitle>
        </CardHeader>
        <CardContent>
          <LesFormulier />
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl">Komende lessen</h2>
        {komend.length === 0 ? (
          <p className="mt-3 text-muted">
            Er staan nog geen lessen gepland. Voeg er hierboven een toe.
          </p>
        ) : (
          <ul className="mt-4 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {komend.map((les) => (
              <li key={les.id}>
                <Link
                  href={`/admin/lessen/${les.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-hover"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-green-dark">{les.titel}</p>
                    <p className="text-sm text-muted first-letter:uppercase">
                      {formateerDag(les.begintOp)} ·{" "}
                      {formateerTijdvak(les.begintOp, les.duurMinuten)} ·{" "}
                      {les.locatie}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {les.afgelastOp ? (
                      <span className="rounded-full bg-error px-2.5 py-0.5 text-xs font-semibold text-cream">
                        Afgelast
                      </span>
                    ) : null}
                    {!les.gepubliceerd ? (
                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-green-dark">
                        Concept
                      </span>
                    ) : null}
                    <span className="text-muted">
                      {les.geboekt} van {les.capaciteit} geboekt
                      {les.wachtlijst > 0
                        ? ` · ${les.wachtlijst} op de wachtlijst`
                        : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {geweest.length > 0 ? (
        <section>
          <h2 className="text-xl">Geweest</h2>
          <ul className="mt-4 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {geweest.map((les) => (
              <li key={les.id}>
                <Link
                  href={`/admin/lessen/${les.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 text-sm transition-colors hover:bg-hover"
                >
                  <span className="first-letter:uppercase">
                    {formateerDag(les.begintOp)} — {les.titel}
                  </span>
                  <span className="text-muted">{les.geboekt} deelnemers</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
