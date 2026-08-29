import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileText, PlayCircle, Type } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { haalLesmateriaal } from "@/features/content";
import { Voortgangsbalk } from "@/features/portaal/components/voortgangsbalk";
import { haalVoortgang } from "@/features/progress";
import { cn } from "@/lib/utils";
import type { ContentKind } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Lesmateriaal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ICOON: Record<ContentKind, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  tekst: Type,
};

const SOORT: Record<ContentKind, string> = {
  video: "Video",
  pdf: "Document",
  tekst: "Tekst",
};

export default async function OpleidingOverzichtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [materiaal, voortgang] = await Promise.all([
    haalLesmateriaal(slug),
    haalVoortgang(),
  ]);

  if (!materiaal) notFound();

  const afgerond = materiaal.volgorde.filter(
    (item) => voortgang.get(item.id)?.afgerondOp,
  ).length;

  // Het eerste item dat nog niet af is; daar wil je meestal heen.
  const volgende =
    materiaal.volgorde.find((item) => !voortgang.get(item.id)?.afgerondOp) ??
    materiaal.volgorde[0];

  return (
    <div className="space-y-6">
      <nav aria-label="Kruimelpad" className="text-sm text-muted">
        <Link
          href="/portaal/opleidingen"
          className="underline hover:text-green"
        >
          Mijn opleidingen
        </Link>
      </nav>

      <div>
        <h1 className="text-3xl sm:text-4xl">{materiaal.cursusTitel}</h1>
      </div>

      {materiaal.volgorde.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <p>Voor deze opleiding staat nog geen lesmateriaal klaar.</p>
            <p className="mt-2 text-sm text-muted">
              Zodra we het toevoegen, vind je het hier terug.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white">
            <CardContent className="p-6">
              <Voortgangsbalk
                afgerond={afgerond}
                totaal={materiaal.volgorde.length}
              />
              {volgende ? (
                <Link
                  href={`/portaal/opleidingen/${materiaal.cursusSlug}/${volgende.id}`}
                  className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
                >
                  {afgerond === 0
                    ? "Beginnen"
                    : afgerond === materiaal.volgorde.length
                      ? "Opnieuw bekijken"
                      : "Verder gaan"}
                </Link>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-5">
            {materiaal.modules.map((module) => (
              <section key={module.id}>
                <h2 className="text-xl">{module.titel}</h2>

                <ul className="mt-3 divide-y overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                  {module.lessen.flatMap((les) =>
                    les.items.map((item) => {
                      const stand = voortgang.get(item.id);
                      const klaar = Boolean(stand?.afgerondOp);
                      const Icoon = ICOON[item.kind];

                      return (
                        <li key={item.id}>
                          <Link
                            href={`/portaal/opleidingen/${materiaal.cursusSlug}/${item.id}`}
                            className="flex min-h-14 items-center gap-4 px-5 py-3 transition-colors hover:bg-hover"
                          >
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-full",
                                klaar
                                  ? "bg-success text-cream"
                                  : "bg-sand-light text-muted",
                              )}
                              aria-hidden
                            >
                              {klaar ? (
                                <Check className="size-4" />
                              ) : (
                                <Icoon className="size-4" />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate">
                                {item.titel}
                              </span>
                              <span className="block text-sm text-muted">
                                {SOORT[item.kind]}
                                {item.duurSeconden
                                  ? ` · ${Math.round(item.duurSeconden / 60)} min`
                                  : null}
                                {item.isPreview ? " · proefles" : null}
                              </span>
                            </span>

                            {klaar ? (
                              <span className="shrink-0 text-sm font-semibold text-success">
                                Afgerond
                              </span>
                            ) : stand && stand.positieSeconden > 0 ? (
                              <span className="shrink-0 text-sm text-muted">
                                Bezig
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    }),
                  )}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
