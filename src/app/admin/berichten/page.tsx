import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumTijd,
} from "@/features/admin/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Berichten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Inbox over alle klantgesprekken (BOUWPROMPT §13).
 *
 * Antwoorden gebeurt op de klantpagina, waar het gesprek in zijn context
 * staat: wie iemand is, welke opleiding hij volgt en wat er eerder besproken
 * is. Dat voorkomt antwoorden zonder te weten tegen wie je het hebt.
 */
export default async function AdminBerichtenPage() {
  const supabase = await createClient();

  const { data } = await supabase.from("conversations").select(
    `id,
       profiles!inner (id, first_name, last_name, email),
       messages (id, body, sender_id, created_at, read_at)`,
  );

  const gesprekken = (data ?? [])
    .flatMap((rij) => {
      const klant = Array.isArray(rij.profiles)
        ? rij.profiles[0]
        : rij.profiles;
      if (!klant) return [];

      const berichten = [...(rij.messages ?? [])].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
      if (berichten.length === 0) return [];

      const laatste = berichten[0]!;
      const ongelezen = berichten.filter(
        (bericht) => !bericht.read_at && bericht.sender_id === klant.id,
      ).length;

      return [
        {
          klantId: klant.id,
          naam: `${klant.first_name} ${klant.last_name}`,
          laatsteTekst: laatste.body,
          laatsteVanKlant: laatste.sender_id === klant.id,
          laatsteOp: laatste.created_at,
          ongelezen,
        },
      ];
    })
    .sort((a, b) => b.laatsteOp.localeCompare(a.laatsteOp));

  const totaalOngelezen = gesprekken.reduce(
    (som, gesprek) => som + gesprek.ongelezen,
    0,
  );

  return (
    <>
      <AdminKop
        titel="Berichten"
        toelichting={
          totaalOngelezen > 0
            ? `${totaalOngelezen} ongelezen`
            : "Alles gelezen."
        }
      />

      <Paneel>
        {gesprekken.length === 0 ? (
          <LegeLijst>Nog geen berichten van klanten.</LegeLijst>
        ) : (
          <ul className="divide-y divide-line">
            {gesprekken.map((gesprek) => (
              <li key={gesprek.klantId}>
                <Link
                  href={`/admin/klanten/${gesprek.klantId}`}
                  className="block px-5 py-4 transition-colors hover:bg-cream"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">
                      {gesprek.naam}
                      {gesprek.ongelezen > 0 ? (
                        <span className="ml-2 rounded-full bg-error px-2 py-0.5 text-xs font-semibold text-cream">
                          {gesprek.ongelezen}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-muted">
                      {datumTijd(gesprek.laatsteOp)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {gesprek.laatsteVanKlant ? "" : "Jij: "}
                    {gesprek.laatsteTekst}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Paneel>
    </>
  );
}
