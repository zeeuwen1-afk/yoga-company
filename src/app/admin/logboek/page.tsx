import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumTijd,
} from "@/features/admin/components/ui";
import { ACTIE_LABEL, haalAuditLog } from "@/features/audit";

export const metadata: Metadata = {
  title: "Logboek",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ENTITEITEN = [
  { waarde: "", label: "Alles" },
  { waarde: "profiles", label: "Klanten" },
  { waarde: "enrollments", label: "Inschrijvingen" },
  { waarde: "courses", label: "Aanbod" },
  { waarde: "content_items", label: "Lesmateriaal" },
  { waarde: "requests", label: "Aanvragen" },
];

export default async function LogboekPage({
  searchParams,
}: {
  searchParams: Promise<{ entiteit?: string }>;
}) {
  const { entiteit } = await searchParams;
  const regels = await haalAuditLog({
    entiteit: entiteit || undefined,
    limiet: 200,
  });

  return (
    <>
      <AdminKop
        titel="Logboek"
        toelichting="Elke beheerhandeling op klantgegevens, inschrijvingen en content."
      />

      <nav aria-label="Filter" className="mb-6 flex flex-wrap gap-2">
        {ENTITEITEN.map((optie) => {
          const actief = (entiteit ?? "") === optie.waarde;
          return (
            <Link
              key={optie.waarde || "alles"}
              href={
                optie.waarde
                  ? `/admin/logboek?entiteit=${optie.waarde}`
                  : "/admin/logboek"
              }
              className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
                actief
                  ? "border-green bg-green text-cream"
                  : "border-line hover:bg-white"
              }`}
            >
              {optie.label}
            </Link>
          );
        })}
      </nav>

      <Paneel>
        {regels.length === 0 ? (
          <LegeLijst>Nog niets vastgelegd.</LegeLijst>
        ) : (
          <ul className="divide-y divide-line">
            {regels.map((regel) => (
              <li key={regel.id} className="px-5 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">
                    {ACTIE_LABEL[regel.actie] ?? regel.actie}
                  </span>
                  <span className="text-sm text-muted">
                    {datumTijd(regel.tijdstip)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {regel.actorNaam ?? "Systeem"}
                  {regel.entiteit === "profiles" && regel.entiteitId ? (
                    <>
                      {" · "}
                      <Link
                        href={`/admin/klanten/${regel.entiteitId}`}
                        className="underline"
                      >
                        klantpagina
                      </Link>
                    </>
                  ) : null}
                </p>
                {regel.meta && typeof regel.meta === "object" ? (
                  <p className="mt-1 font-mono text-xs text-muted">
                    {JSON.stringify(regel.meta)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Paneel>

      <p className="mt-4 text-sm text-muted">
        Het logboek is onveranderlijk: ook een beheerder kan regels niet
        aanpassen of verwijderen. Ze worden na 24 maanden automatisch opgeruimd
        (BOUWPROMPT §17.6).
      </p>
    </>
  );
}
