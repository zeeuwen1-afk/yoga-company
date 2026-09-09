import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ACADEMIE, EIGEN_PAGINA } from "@/content/aanbod";

import { formateerPrijs } from "../prijs";
import type { Cursus } from "../server/queries";

/**
 * De YogaCompany Academie: het opleidingsaanbod, gegroepeerd.
 *
 * Eerst de opleidingen van 200 uur, daarna wat je er los uit kunt volgen. Dat
 * is de volgorde waarin iemand kiest: eerst welke route, dan of hij hem in
 * stukken doet.
 *
 * Het overzicht was een rij losse kaarten. Dat werkte zolang er vijf dingen
 * stonden, maar met twee opleidingen die elk uit modules en blokken bestaan
 * wordt het een lijst waarin een module van 50 uur er net zo uitziet als een
 * opleiding van 200 uur. Dan moet de bezoeker zelf uitzoeken wat waarbij hoort,
 * en dat doet niemand.
 *
 * Aanbod dat in geen enkele opleiding voorkomt verschijnt onderaan. Een nieuwe
 * cursus raakt daardoor nooit zoek doordat iemand vergeet hem in de indeling te
 * zetten.
 */
export function Academie({ cursussen }: { cursussen: Cursus[] }) {
  const opSlug = new Map(cursussen.map((cursus) => [cursus.slug, cursus]));
  const ondergebracht = new Set<string>();

  const groepen = ACADEMIE.map((groep) => {
    const opleiding = opSlug.get(groep.opleiding);
    if (!opleiding) return null;

    ondergebracht.add(groep.opleiding);
    const onderdelen = groep.onderdelen
      .map((slug) => opSlug.get(slug))
      .filter((cursus): cursus is Cursus => cursus !== undefined);

    for (const onderdeel of onderdelen) ondergebracht.add(onderdeel.slug);
    return { opleiding, onderdelen };
  }).filter((groep) => groep !== null);

  const los = cursussen.filter((cursus) => !ondergebracht.has(cursus.slug));
  const heeftOnderdelen = groepen.some((groep) => groep.onderdelen.length > 0);

  return (
    <div className="space-y-14">
      {/* --- De opleidingen -------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {groepen.map(({ opleiding, onderdelen }) => {
          const pad =
            EIGEN_PAGINA[opleiding.slug] ?? `/opleidingen/${opleiding.slug}`;

          return (
            <article
              key={opleiding.slug}
              className="relative flex flex-col rounded-[var(--radius-card)] border border-line bg-cream p-6 transition-colors hover:border-accent/60 sm:p-8"
            >
              <h3 className="text-2xl sm:text-3xl">
                <Link href={pad}>
                  <span className="absolute inset-0" aria-hidden />
                  {opleiding.titel}
                </Link>
              </h3>
              <p className="mt-3 flex-1 text-muted">{opleiding.samenvatting}</p>

              <p className="mt-5 font-semibold tabular-nums">
                {formateerPrijs(opleiding.prijsCenten)}
                {onderdelen.length > 0 ? (
                  <span className="font-normal text-muted">
                    {" · of per module"}
                  </span>
                ) : null}
              </p>

              <p className="mt-4 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
                Bekijk de opleiding
                <ArrowRight className="size-4" aria-hidden />
              </p>
            </article>
          );
        })}
      </div>

      {/* --- Wat je er los uit kunt volgen ------------------------------ */}
      {heeftOnderdelen ? (
        <div id="losse-modules" className="scroll-mt-24">
          <h3 className="text-2xl">Losse modules</h3>
          <p className="mt-2 max-w-2xl text-muted">
            Iedere module is ook los te boeken en wordt afgesloten met een eigen
            certificaat.
          </p>

          <div className="mt-8 space-y-8">
            {groepen
              .filter((groep) => groep.onderdelen.length > 0)
              .map(({ opleiding, onderdelen }) => (
                <div key={opleiding.slug}>
                  <h4 className="label-klein text-muted">
                    Uit de {opleiding.titel}
                  </h4>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {onderdelen.map((onderdeel) => (
                      <li
                        key={onderdeel.slug}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
                      >
                        <Link
                          href={`/opleidingen/${onderdeel.slug}`}
                          className="font-medium underline underline-offset-4 hover:no-underline"
                        >
                          {onderdeel.titel}
                        </Link>
                        <span className="text-sm font-semibold tabular-nums">
                          {formateerPrijs(onderdeel.prijsCenten)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {los.length > 0 ? (
        <div>
          <h3 className="text-2xl">Overig aanbod</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {los.map((cursus) => (
              <li
                key={cursus.slug}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
              >
                <Link
                  href={`/opleidingen/${cursus.slug}`}
                  className="font-medium underline underline-offset-4 hover:no-underline"
                >
                  {cursus.titel}
                </Link>
                <span className="text-sm font-semibold tabular-nums">
                  {formateerPrijs(cursus.prijsCenten)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
