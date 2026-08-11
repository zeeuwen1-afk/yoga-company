import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formateerPrijs } from "../prijs";
import type { Cursus } from "../server/queries";

/** Kaart in het overzicht: titel, samenvatting, prijs en startinformatie. */
export function CursusKaart({ cursus }: { cursus: Cursus }) {
  const pad = cursus.type === "opleiding" ? "/opleidingen" : "/trainingen";
  const uren = cursus.curriculum.reduce(
    (totaal, module) => totaal + module.uren,
    0,
  );

  return (
    <Card className="flex flex-col transition-colors hover:border-green/40">
      <CardHeader>
        <p className="text-sm font-semibold text-muted">
          {cursus.type === "opleiding" ? "Opleiding" : "Training"}
          {uren > 0 ? ` · ${uren} uur` : null}
          {cursus.locatie === "Online" ? " · online" : null}
        </p>
        <CardTitle>
          <Link
            href={`${pad}/${cursus.slug}`}
            className="transition-colors hover:text-green"
          >
            {/* De hele kaart klikbaar maken via een uitgerekte link, zodat er
                maar één tabstop per kaart is. */}
            <span className="absolute inset-0" aria-hidden />
            {cursus.titel}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="text-sm">{cursus.samenvatting}</p>

        <dl className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line pt-4">
          <div>
            <dt className="sr-only">Prijs</dt>
            <dd className="text-lg font-semibold text-green-dark">
              {formateerPrijs(cursus.prijsCenten)}
            </dd>
          </div>
          {cursus.maxDeelnemers ? (
            <div>
              <dt className="sr-only">Groepsgrootte</dt>
              <dd className="text-sm text-muted">
                maximaal {cursus.maxDeelnemers} deelnemers
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Rooster van kaarten; `relative` is nodig voor de uitgerekte links. */
export function CursusRooster({ cursussen }: { cursussen: Cursus[] }) {
  if (cursussen.length === 0) {
    return (
      <p className="text-muted">
        Er staat op dit moment geen aanbod klaar. Neem gerust contact met ons
        op.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cursussen.map((cursus) => (
        <li key={cursus.slug} className="relative flex">
          <CursusKaart cursus={cursus} />
        </li>
      ))}
    </ul>
  );
}
