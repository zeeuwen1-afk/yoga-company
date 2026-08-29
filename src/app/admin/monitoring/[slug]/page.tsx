import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Download, Minus } from "lucide-react";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import { haalVoortgangsmatrix } from "@/features/enrollments/server/admin-queries";

export const metadata: Metadata = {
  title: "Voortgang",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Voortgangsmatrix: deelnemers × lesonderdelen (BOUWPROMPT §12).
 *
 * Drie standen per vakje: niet gestart, bezig, afgerond. De betekenis staat
 * er ook in tekst bij, want kleur alleen is voor sommige mensen niet te
 * onderscheiden (§18, WCAG).
 */
export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const matrix = await haalVoortgangsmatrix(slug);

  if (!matrix) notFound();

  const { cursus, kolommen, rijen } = matrix;

  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/inschrijvingen", label: "Inschrijvingen" }}
        titel={cursus.title}
        toelichting={`${rijen.length} ${rijen.length === 1 ? "deelnemer" : "deelnemers"} · ${kolommen.length} lesonderdelen`}
        actie={
          rijen.length > 0 ? (
            <a
              href={`/api/v1/admin/voortgang-csv/${cursus.slug}`}
              download
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-5 font-semibold text-green-dark transition-colors hover:bg-hover"
            >
              <Download className="size-4" aria-hidden />
              Exporteer als CSV
            </a>
          ) : null
        }
      />

      <Paneel>
        {rijen.length === 0 ? (
          <LegeLijst>
            Nog geen deelnemers met een betaalde inschrijving.
          </LegeLijst>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="sticky left-0 bg-white px-5 py-3 font-semibold">
                    Deelnemer
                  </th>
                  {kolommen.map((kolom) => (
                    <th
                      key={kolom.id}
                      scope="col"
                      className="px-2 py-3 text-center font-semibold"
                    >
                      <span
                        className="block max-w-24 truncate"
                        title={`${kolom.moduleTitel} — ${kolom.titel}`}
                      >
                        {kolom.titel}
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3 font-semibold whitespace-nowrap">
                    Laatst actief
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rijen.map((rij) => (
                  <tr key={rij.profileId} className="hover:bg-hover">
                    <th
                      scope="row"
                      className="sticky left-0 bg-white px-5 py-3 text-left font-normal"
                    >
                      <span className="block font-semibold">{rij.naam}</span>
                      <span className="block text-xs text-muted">
                        {rij.afgerond} van {kolommen.length} afgerond
                      </span>
                    </th>

                    {rij.standen.map((stand, index) => (
                      <td key={kolommen[index]?.id} className="px-2 py-3">
                        <span className="flex justify-center">
                          {stand === "afgerond" ? (
                            <span
                              className="flex size-6 items-center justify-center rounded-full bg-success text-cream"
                              title="Afgerond"
                            >
                              <Check className="size-3.5" aria-hidden />
                              <span className="sr-only">Afgerond</span>
                            </span>
                          ) : stand === "bezig" ? (
                            <span
                              className="flex size-6 items-center justify-center rounded-full bg-sand text-xs font-semibold text-green-dark"
                              title="Bezig"
                            >
                              ·<span className="sr-only">Bezig</span>
                            </span>
                          ) : (
                            <span
                              className="flex size-6 items-center justify-center rounded-full border border-line text-muted"
                              title="Niet gestart"
                            >
                              <Minus className="size-3" aria-hidden />
                              <span className="sr-only">Niet gestart</span>
                            </span>
                          )}
                        </span>
                      </td>
                    ))}

                    <td className="px-5 py-3 whitespace-nowrap text-muted">
                      {datumKort(rij.laatstActiefOp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-success">✓</span> afgerond ·{" "}
        <span className="font-semibold text-green-dark">·</span> bezig ·{" "}
        <span className="font-semibold">–</span> niet gestart
      </p>
    </>
  );
}
