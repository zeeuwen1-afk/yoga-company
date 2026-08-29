import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import { UitnodigenFormulier } from "@/features/crm/components/uitnodigen-formulier";
import { haalKlanten } from "@/features/crm";

export const metadata: Metadata = {
  title: "Klanten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KlantenPage({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string; rol?: string; status?: string }>;
}) {
  const params = await searchParams;

  const klanten = await haalKlanten({
    zoek: params.zoek,
    rol:
      params.rol === "admin" || params.rol === "klant" ? params.rol : undefined,
    status:
      params.status === "actief" || params.status === "gedeactiveerd"
        ? params.status
        : undefined,
  });

  return (
    <>
      <AdminKop
        titel="Klanten"
        toelichting={`${klanten.length} ${klanten.length === 1 ? "resultaat" : "resultaten"}`}
      />

      {/* Zoeken en filteren — als gewoon formulier, zodat de filters in de
          URL staan en een gefilterd overzicht te delen of te bewaren is. */}
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label
            htmlFor="zoek"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Zoeken
          </label>
          <input
            id="zoek"
            name="zoek"
            defaultValue={params.zoek ?? ""}
            placeholder="Naam of e-mailadres"
            className="h-11 w-full rounded-lg border border-line bg-white px-3"
          />
        </div>

        <div>
          <label
            htmlFor="rol"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Rol
          </label>
          <select
            id="rol"
            name="rol"
            defaultValue={params.rol ?? ""}
            className="h-11 rounded-lg border border-line bg-white px-3"
          >
            <option value="">Alle</option>
            <option value="klant">Klant</option>
            <option value="admin">Beheerder</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="h-11 rounded-lg border border-line bg-white px-3"
          >
            <option value="">Alle</option>
            <option value="actief">Actief</option>
            <option value="gedeactiveerd">Gedeactiveerd</option>
          </select>
        </div>

        <button
          type="submit"
          className="h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
        >
          Filteren
        </button>

        {params.zoek || params.rol || params.status ? (
          <Link
            href="/admin/klanten"
            className="h-11 text-sm leading-[2.75rem] text-muted underline hover:text-green"
          >
            Wissen
          </Link>
        ) : null}
      </form>

      <Paneel>
        {klanten.length === 0 ? (
          <LegeLijst>Geen klanten gevonden met deze filters.</LegeLijst>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Naam</th>
                  <th className="px-5 py-3 font-semibold">E-mailadres</th>
                  <th className="px-5 py-3 font-semibold">Opleidingen</th>
                  <th className="px-5 py-3 font-semibold">Sinds</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {klanten.map((klant) => (
                  <tr
                    key={klant.id}
                    className="transition-colors hover:bg-hover"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/klanten/${klant.id}`}
                        className="font-semibold hover:text-green"
                      >
                        {klant.voornaam} {klant.achternaam}
                      </Link>
                      {klant.rol === "admin" ? (
                        <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-green-dark">
                          Beheerder
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {klant.email}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {klant.aantalBetaald} betaald
                      {klant.aantalInschrijvingen > klant.aantalBetaald
                        ? ` · ${klant.aantalInschrijvingen - klant.aantalBetaald} open`
                        : null}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {datumKort(klant.aangemaaktOp)}
                    </td>
                    <td className="px-5 py-3">
                      {klant.actief ? (
                        <span className="text-sm text-success">Actief</span>
                      ) : (
                        <span className="text-sm text-muted">
                          Gedeactiveerd
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>

      <div className="mt-6">
        <Paneel titel="Nieuwe klant uitnodigen">
          <div className="p-5">
            <UitnodigenFormulier />
          </div>
        </Paneel>
      </div>
    </>
  );
}
