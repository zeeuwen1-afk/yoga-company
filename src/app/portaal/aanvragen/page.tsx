import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { AanvraagFormulier } from "@/features/requests/components/aanvraag-formulier";
import { haalAanvragen, SOORT_LABEL, STATUS_LABEL } from "@/features/requests";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aanvragen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AanvragenPage({
  searchParams,
}: {
  searchParams: Promise<{ soort?: string }>;
}) {
  const { soort } = await searchParams;
  const aanvragen = await haalAanvragen();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">Aanvragen</h1>
        <p className="mt-2 text-muted">
          Een vraag, een wijziging of een verzoek over je gegevens. We houden je
          op de hoogte van de status.
        </p>
      </div>

      {aanvragen.length > 0 ? (
        <section>
          <h2 className="text-xl">Je aanvragen</h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {aanvragen.map((aanvraag) => (
              <li key={aanvraag.id} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {SOORT_LABEL[aanvraag.soort]}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      aanvraag.status === "afgerond"
                        ? "bg-success/10 text-success"
                        : aanvraag.status === "in_behandeling"
                          ? "bg-sand text-green-dark"
                          : "bg-sand-light text-muted",
                    )}
                  >
                    {STATUS_LABEL[aanvraag.status]}
                  </span>
                </div>

                {aanvraag.toelichting ? (
                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted">
                    {aanvraag.toelichting}
                  </p>
                ) : null}

                <p className="mt-2 text-xs text-muted">
                  Ingediend op {datum(aanvraag.ingediendOp)}
                  {aanvraag.afgerondOp
                    ? ` · afgerond op ${datum(aanvraag.afgerondOp)}`
                    : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl">Nieuwe aanvraag</h2>
        <Card className="mt-3 bg-white">
          <CardContent className="p-6">
            <AanvraagFormulier standaardSoort={soort} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
