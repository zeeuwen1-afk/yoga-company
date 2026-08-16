import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formateerPrijs } from "../prijs";
import type { Cursus } from "../server/queries";

/** Kaart in het overzicht: titel, samenvatting, prijs en startinformatie. */
export function CursusKaart({
  cursus,
  kortingCenten = null,
}: {
  cursus: Cursus;
  /** Bedrag dat een bundel scheelt ten opzichte van de losse modules (§7.1). */
  kortingCenten?: number | null;
}) {
  const pad = cursus.type === "opleiding" ? "/opleidingen" : "/trainingen";
  const uren = cursus.curriculum.reduce(
    (totaal, module) => totaal + module.uren,
    0,
  );

  return (
    <Card
      className={
        kortingCenten
          ? "flex flex-col border-green/50 bg-sand-light/40 transition-colors hover:border-green"
          : "flex flex-col transition-colors hover:border-green/40"
      }
    >
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
          {kortingCenten ? (
            <div>
              <dt className="sr-only">
                Voordeel ten opzichte van losse modules
              </dt>
              <dd className="text-sm font-semibold text-green">
                bespaar {formateerPrijs(kortingCenten)}
              </dd>
            </div>
          ) : null}
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

/**
 * Wat een bundel scheelt ten opzichte van dezelfde modules los gekocht.
 *
 * De korting wordt afgeleid uit de prijzen die in de database staan, niet
 * ergens los ingetypt. Wijzigt de beheerder een prijs, dan klopt het bedrag
 * op de site meteen mee (§7.1).
 */
function berekenKortingCenten(cursus: Cursus, alle: Cursus[]): number | null {
  if (cursus.curriculum.length < 2) return null;

  const nummers = new Set(cursus.curriculum.map((module) => module.nummer));
  const losseModules = alle.filter(
    (kandidaat) =>
      kandidaat.slug !== cursus.slug &&
      kandidaat.curriculum.length === 1 &&
      nummers.has(kandidaat.curriculum[0].nummer),
  );

  // Alleen tonen als élke module ook los te koop is; anders is de vergelijking
  // niet eerlijk en zeggen we er liever niets over.
  if (losseModules.length !== nummers.size) return null;

  const samenLos = losseModules.reduce(
    (totaal, module) => totaal + module.prijsCenten,
    0,
  );
  const verschil = samenLos - cursus.prijsCenten;
  return verschil > 0 ? verschil : null;
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
          <CursusKaart
            cursus={cursus}
            kortingCenten={berekenKortingCenten(cursus, cursussen)}
          />
        </li>
      ))}
    </ul>
  );
}
