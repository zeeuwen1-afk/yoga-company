import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  Kerncijfer,
  LegeLijst,
  Paneel,
  StatusPil,
  datumKort,
} from "@/features/admin/components/ui";
import { haalDashboard } from "@/features/admin/server/dashboard";
import { formateerPrijs } from "@/features/courses";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const gegevens = await haalDashboard();

  return (
    <>
      <AdminKop
        titel="Dashboard"
        toelichting="Wat er vandaag aandacht vraagt."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kerncijfer
          label="Omzet deze maand"
          waarde={formateerPrijs(gegevens.omzetDezeMaandCenten)}
          toelichting="Betaalde inschrijvingen"
        />
        <Kerncijfer
          label="Actieve klanten"
          waarde={gegevens.aantalKlanten}
          href="/admin/klanten"
        />
        <Kerncijfer
          label="Openstaande aanvragen"
          waarde={gegevens.openAanvragen}
          href="/admin/aanvragen"
        />
        <Kerncijfer
          label="Ongelezen berichten"
          waarde={gegevens.ongelezenBerichten}
          href="/admin/berichten"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Paneel
          titel="Nieuwste inschrijvingen"
          actie={
            <Link
              href="/admin/inschrijvingen"
              className="text-sm font-semibold text-green underline"
            >
              Alles
            </Link>
          }
        >
          {gegevens.nieuweInschrijvingen.length === 0 ? (
            <LegeLijst>Nog geen inschrijvingen.</LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {gegevens.nieuweInschrijvingen.map((inschrijving) => (
                <li key={inschrijving.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/admin/klanten/${inschrijving.klantId}`}
                      className="font-semibold hover:text-green"
                    >
                      {inschrijving.klantNaam}
                    </Link>
                    <StatusPil status={inschrijving.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {inschrijving.cursusTitel} ·{" "}
                    {datumKort(inschrijving.aangemaaktOp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Paneel>

        <Paneel
          titel="Laatste contactberichten"
          actie={
            <Link
              href="/admin/contactberichten"
              className="text-sm font-semibold text-green underline"
            >
              Alles
            </Link>
          }
        >
          {gegevens.contactberichten.length === 0 ? (
            <LegeLijst>Nog geen contactberichten.</LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {gegevens.contactberichten.map((bericht) => (
                <li key={bericht.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{bericht.naam}</span>
                    <span className="text-sm text-muted">
                      {datumKort(bericht.ontvangenOp)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {bericht.bericht}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Paneel>
      </div>
    </>
  );
}
