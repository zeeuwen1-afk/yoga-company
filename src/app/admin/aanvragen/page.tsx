import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import { StatusKeuze } from "@/features/requests/components/admin-acties";
import { SOORT_LABEL } from "@/features/requests";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aanvragen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAanvragenPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("requests")
    .select(
      "id, kind, body, status, created_at, closed_at, profiles!requests_profile_id_fkey (id, first_name, last_name, email)",
    )
    .order("created_at", { ascending: false });

  const aanvragen = (data ?? []).flatMap((rij) => {
    const klant = Array.isArray(rij.profiles) ? rij.profiles[0] : rij.profiles;
    if (!klant) return [];
    return [{ ...rij, klant }];
  });

  const open = aanvragen.filter((rij) => rij.status !== "afgerond");
  const afgerond = aanvragen.filter((rij) => rij.status === "afgerond");

  return (
    <>
      <AdminKop
        titel="Aanvragen"
        toelichting={`${open.length} openstaand · ${afgerond.length} afgerond`}
      />

      <div className="space-y-6">
        <Paneel titel="Openstaand">
          {open.length === 0 ? (
            <LegeLijst>Niets openstaand. Mooi.</LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {open.map((aanvraag) => (
                <li key={aanvraag.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {SOORT_LABEL[aanvraag.kind]}
                      </p>
                      <Link
                        href={`/admin/klanten/${aanvraag.klant.id}`}
                        className="text-sm text-muted underline hover:text-green"
                      >
                        {aanvraag.klant.first_name} {aanvraag.klant.last_name}
                      </Link>
                      <p className="text-sm text-muted">
                        {datumKort(aanvraag.created_at)}
                      </p>
                    </div>
                    <StatusKeuze
                      aanvraagId={aanvraag.id}
                      huidig={aanvraag.status}
                    />
                  </div>

                  {aanvraag.body ? (
                    <p className="mt-3 rounded-lg bg-cream px-4 py-3 text-sm whitespace-pre-wrap">
                      {aanvraag.body}
                    </p>
                  ) : null}

                  {aanvraag.kind === "avg_verwijdering" ||
                  aanvraag.kind === "avg_export" ? (
                    <p className="mt-3 text-sm text-muted">
                      AVG-verzoek: handel dit binnen een maand af. Beide
                      handelingen staan op de{" "}
                      <Link
                        href={`/admin/klanten/${aanvraag.klant.id}`}
                        className="underline"
                      >
                        klantpagina
                      </Link>
                      .
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Paneel>

        {afgerond.length > 0 ? (
          <Paneel titel="Afgerond">
            <ul className="divide-y divide-line">
              {afgerond.slice(0, 20).map((aanvraag) => (
                <li key={aanvraag.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm">
                      {SOORT_LABEL[aanvraag.kind]} · {aanvraag.klant.first_name}{" "}
                      {aanvraag.klant.last_name}
                    </span>
                    <span className="text-sm text-muted">
                      {datumKort(aanvraag.closed_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Paneel>
        ) : null}
      </div>
    </>
  );
}
