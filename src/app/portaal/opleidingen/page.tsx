import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { haalMijnOpleidingen } from "@/features/content";
import { Voortgangsbalk } from "@/features/portaal/components/voortgangsbalk";
import { haalCursusVoortgang } from "@/features/progress";

export const metadata: Metadata = {
  title: "Mijn opleidingen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MijnOpleidingenPage() {
  const [opleidingen, voortgang] = await Promise.all([
    haalMijnOpleidingen(),
    haalCursusVoortgang(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl">Mijn opleidingen</h1>
        <p className="mt-2 text-muted">
          Alles waar je voor bent ingeschreven, met je voortgang.
        </p>
      </div>

      {opleidingen.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <p>Je hebt nog geen opleiding lopen.</p>
            <Link
              href="/opleidingen"
              className="mt-4 inline-flex items-center gap-1.5 font-semibold text-green underline"
            >
              Bekijk het aanbod
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {opleidingen.map((opleiding) => {
            const stand = voortgang.get(opleiding.cursusId);
            const heeftMateriaal = (stand?.totaalItems ?? 0) > 0;

            return (
              <li key={opleiding.enrollmentId}>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-xl">{opleiding.titel}</h2>
                        <p className="mt-1 text-sm text-muted">
                          {opleiding.samenvatting}
                        </p>
                      </div>
                      {opleiding.status === "afgerond" ? (
                        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                          Afgerond
                        </span>
                      ) : null}
                    </div>

                    {heeftMateriaal && stand ? (
                      <>
                        <div className="mt-6">
                          <Voortgangsbalk
                            afgerond={stand.afgerondItems}
                            totaal={stand.totaalItems}
                          />
                        </div>
                        <Link
                          href={`/portaal/opleidingen/${opleiding.slug}`}
                          className="mt-5 inline-flex h-11 items-center rounded-lg bg-green px-5 font-semibold text-cream transition-colors hover:bg-green-dark"
                        >
                          {stand.afgerondItems > 0 ? "Verder gaan" : "Beginnen"}
                        </Link>
                      </>
                    ) : (
                      <p className="mt-5 text-sm text-muted">
                        Deze opleiding volg je in de studio. De lesdata sturen
                        we je per e-mail toe; heb je een vraag, stel hem gerust
                        via{" "}
                        <Link
                          href="/portaal/berichten"
                          className="text-green underline"
                        >
                          berichten
                        </Link>
                        .
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
