import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mijn kaarten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function euro(centen: number) {
  return `€ ${(centen / 100).toFixed(2).replace(".", ",")}`;
}

/**
 * De strippenkaarten van de klant (§ docentenlaag).
 *
 * De belangrijkste informatie op dit scherm is niet het saldo maar de vraag
 * wáár de kaart geldt. Iemand die denkt dat zijn kaart overal werkt, staat
 * straks voor niets bij een privéles of bij een andere yogaschool. Daarom
 * draagt elke kaart zichtbaar allebei: waar wel, en waar niet.
 */
export default async function KaartenPage() {
  const supabase = await createClient();

  const { data: kaarten } = await supabase
    .from("passes")
    .select(
      `id, saldo, geldig_tot, status,
       pass_products(naam, aantal_lessen, prijs_centen, kruisgebruik_toegestaan,
                     studios(naam, plaats))`,
    )
    .eq("status", "actief")
    .order("uitgegeven_op", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Mijn kaarten</h1>
        <p className="mt-2 text-muted">
          Je saldo, tot wanneer je kaart geldt, en waar je ermee terechtkunt.
        </p>
      </div>

      {!kaarten || kaarten.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-background p-8">
          <h2 className="text-xl">Je hebt nog geen kaart</h2>
          <p className="mt-2 text-muted">
            Met een strippenkaart boek je lessen wanneer het je uitkomt.
          </p>
          <Link
            href="/lessen/tarieven"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
          >
            Bekijk de tarieven
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {kaarten.map((kaart) => {
            const product = kaart.pass_products;
            const studio = product?.studios;
            const totaal = product?.aantal_lessen ?? null;
            const percentage =
              totaal && kaart.saldo !== null
                ? Math.round((kaart.saldo / totaal) * 100)
                : null;

            return (
              <li
                key={kaart.id}
                className="rounded-[var(--radius-card)] border border-line bg-background p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xl">{product?.naam ?? "Kaart"}</h2>
                  {kaart.saldo !== null && totaal ? (
                    <p className="text-lg font-semibold tabular-nums">
                      {kaart.saldo}{" "}
                      <span className="text-sm font-normal text-muted">
                        van {totaal}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted">abonnement</p>
                  )}
                </div>

                {percentage !== null ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                ) : null}

                {kaart.geldig_tot ? (
                  <p className="mt-3 text-sm text-muted">
                    Geldig tot{" "}
                    {new Date(kaart.geldig_tot).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                ) : null}

                <div className="mt-4 rounded-lg border border-sand bg-cream px-4 py-3 text-sm">
                  <p className="font-semibold">
                    Geldig bij {studio?.naam ?? "de studio"}
                  </p>
                  <p className="mt-0.5 text-muted">
                    {product?.kruisgebruik_toegestaan
                      ? "Bij alle docenten die daar lesgeven, ook als je hem bij een andere docent kocht."
                      : "Alleen bij de docent die deze kaart aan je verkocht."}
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-sand bg-sand-light px-4 py-3 text-sm text-[#7a4526]">
                  <p className="font-semibold">Niet geldig voor</p>
                  <p className="mt-0.5">
                    privélessen en lessen bij een andere yogaschool. Die hebben
                    een eigen tarief.
                  </p>
                </div>

                {product?.prijs_centen ? (
                  <p className="mt-3 text-xs text-muted">
                    Aangeschaft voor {euro(product.prijs_centen)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-[var(--radius-card)] border border-line bg-background p-5">
        <h2 className="text-lg">Annuleren</h2>
        <p className="mt-2 text-sm text-muted">
          Meld je tot <strong className="text-ink">24 uur</strong> voor de les
          af, dan komt je strip terug. Daarna blijft hij eraf; de docent stond
          immers voor je klaar. Annuleren zelf kan tot vier uur van tevoren,
          zodat iemand op de wachtlijst je plek nog kan overnemen.
        </p>
      </div>
    </div>
  );
}
