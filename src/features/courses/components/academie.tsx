import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ACADEMIE, EIGEN_PAGINA } from "@/content/aanbod";

import { formateerPrijs } from "../prijs";
import type { Cursus } from "../server/queries";

/**
 * De YogaCompany Academie: het opleidingsaanbod, gegroepeerd.
 *
 * Het overzicht was een rij losse kaarten. Dat werkte zolang er vijf dingen
 * stonden, maar met twee opleidingen die elk uit losse modules en blokken
 * bestaan wordt het een lijst waarin een module van 50 uur er net zo uitziet
 * als een opleiding van 200 uur. Dan moet de bezoeker zelf uitzoeken wat
 * waarbij hoort, en dat doet niemand.
 *
 * Nu staat per opleiding één kaart, met de losse onderdelen als regels
 * eronder — elk met hun eigen prijs, want die zijn los te boeken.
 *
 * Aanbod dat in geen enkele opleiding voorkomt verschijnt onderaan als losse
 * kaart. Een nieuwe cursus raakt daardoor nooit zoek doordat iemand vergeet
 * hem in de indeling te zetten.
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

  return (
    <div className="space-y-10">
      {groepen.map(({ opleiding, onderdelen }) => {
        const pad =
          EIGEN_PAGINA[opleiding.slug] ?? `/opleidingen/${opleiding.slug}`;

        return (
          <article
            key={opleiding.slug}
            className="overflow-hidden rounded-[var(--radius-card)] border border-line"
          >
            <div className="bg-cream p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="text-2xl sm:text-3xl">
                  <Link href={pad} className="hover:text-green">
                    {opleiding.titel}
                  </Link>
                </h3>
                <p className="font-semibold tabular-nums">
                  {formateerPrijs(opleiding.prijsCenten)}
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-muted">
                {opleiding.samenvatting}
              </p>
              <Link
                href={pad}
                className="mt-5 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 hover:no-underline"
              >
                Bekijk de opleiding
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            {onderdelen.length > 0 ? (
              <div className="border-t border-line p-6 sm:p-8">
                <h4 className="label-klein text-muted">Los te volgen</h4>
                <ul className="mt-4 divide-y divide-line border-y border-line">
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
            ) : null}
          </article>
        );
      })}

      {los.length > 0 ? (
        <div>
          <h3 className="label-klein text-muted">Overig aanbod</h3>
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
