import { CmsKnop } from "@/components/ui/cms-knop";
import { NIVEAU_INFO, NIVEAUS } from "@/content/niveaus";
import type { Pagina } from "@/features/cms";

import { AcademyBadge } from "./academy-badge";

/**
 * De drie niveaus van de Academy, boven het aanbod op het overzicht.
 *
 * Wie het overzicht opent ziet tien kaarten en regels met prijzen. Wat er
 * niet stond is waar al die modules toe leiden: dat één module een
 * certificaat oplevert, twee samen Advanced, en een hele opleiding een
 * diploma. Dat is de kapstok waaraan het aanbod hangt, dus hij staat erboven.
 *
 * De kop, de zinnen en de knop komen uit de site-editor; de badges en hun
 * labels niet. Een certificaatmerk hoort niet per pagina anders te heten.
 * Kop leeg laten haalt de hele sectie weg.
 */
export function NiveausOverzicht({ pagina }: { pagina: Pagina }) {
  const titel = pagina.tekst("niveaus_titel");
  if (!titel) return null;

  return (
    <div data-sectie="niveaus" className="mb-14 border-b border-line pb-14">
      <h2 className="text-2xl sm:text-3xl">{titel}</h2>
      {pagina.tekst("niveaus_tekst") ? (
        <p className="mt-3 max-w-2xl text-muted">
          {pagina.tekst("niveaus_tekst")}
        </p>
      ) : null}

      <ul className="mt-8 grid gap-8 sm:grid-cols-3">
        {NIVEAUS.map((niveau) => (
          <li key={niveau} className="flex items-center gap-5 sm:block">
            <AcademyBadge niveau={niveau} className="w-24 shrink-0 sm:w-32" />
            <div className="sm:mt-4">
              <h3 className="text-lg font-semibold">
                {NIVEAU_INFO[niveau].label}
              </h3>
              {pagina.tekst(`niveaus_${niveau}`) ? (
                <p className="mt-1 text-[0.975rem] text-muted">
                  {pagina.tekst(`niveaus_${niveau}`)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <CmsKnop
        tekst={pagina.tekst("niveaus_knop")}
        link={pagina.tekst("niveaus_link")}
        terugval="/opleidingen/academy"
        variant="omlijnd"
        className="mt-8"
      />
    </div>
  );
}
