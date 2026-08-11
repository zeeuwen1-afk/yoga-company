import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AfrondKnop } from "@/features/content/components/afrond-knop";
import { DocumentViewer } from "@/features/content/components/document-viewer";
import { VideoSpeler } from "@/features/content/components/video-speler";
import { haalItemMetBuren } from "@/features/content";
import { haalVoortgang } from "@/features/progress";

export const metadata: Metadata = {
  title: "Lesonderdeel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * De contentspeler (BOUWPROMPT §11).
 *
 * Eén onderdeel per scherm, met vorige en volgende eronder. Dat past bij het
 * uitgangspunt "één taak per scherm" en werkt op de telefoon net zo goed als
 * op een laptop.
 */
export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;

  const [context, voortgang] = await Promise.all([
    haalItemMetBuren(slug, itemId),
    haalVoortgang(),
  ]);

  // Geen toegang en niet-bestaand geven hetzelfde antwoord: welke van de twee
  // het is, gaat een bezoeker niets aan.
  if (!context) notFound();

  const { item, vorige, volgende, materiaal, positie, totaal } = context;
  const stand = voortgang.get(item.id);

  return (
    <div className="space-y-6">
      <nav aria-label="Kruimelpad" className="text-sm text-muted">
        <Link
          href={`/portaal/opleidingen/${materiaal.cursusSlug}`}
          className="underline hover:text-green"
        >
          {materiaal.cursusTitel}
        </Link>
      </nav>

      <div>
        <p className="text-sm text-muted">
          Onderdeel {positie} van {totaal}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl">{item.titel}</h1>
      </div>

      {/* Het onderdeel zelf ------------------------------------------------- */}
      {item.kind === "video" ? (
        <VideoSpeler
          itemId={item.id}
          startSeconden={stand?.positieSeconden ?? 0}
          titel={item.titel}
        />
      ) : null}

      {item.kind === "pdf" ? (
        <DocumentViewer itemId={item.id} titel={item.titel} />
      ) : null}

      {item.kind === "tekst" && item.body ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
          <div className="max-w-2xl space-y-4">
            {item.body
              .split("\n\n")
              .filter(Boolean)
              .map((alinea, index) => (
                <p key={index}>{alinea}</p>
              ))}
          </div>
        </div>
      ) : null}

      {/* Afronden ----------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <AfrondKnop itemId={item.id} isAfgerond={Boolean(stand?.afgerondOp)} />
        {stand?.afgerondOp ? (
          <span className="text-sm text-muted">
            Je hebt dit onderdeel afgerond.
          </span>
        ) : null}
      </div>

      {/* Vorige en volgende -------------------------------------------------- */}
      <nav
        aria-label="Navigatie tussen lesonderdelen"
        className="flex flex-wrap gap-3"
      >
        {vorige ? (
          <Link
            href={`/portaal/opleidingen/${materiaal.cursusSlug}/${vorige.id}`}
            className="inline-flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-line px-4 text-green-dark transition-colors hover:bg-white sm:flex-none"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs text-muted">Vorige</span>
              <span className="block truncate text-sm font-semibold">
                {vorige.titel}
              </span>
            </span>
          </Link>
        ) : null}

        {volgende ? (
          <Link
            href={`/portaal/opleidingen/${materiaal.cursusSlug}/${volgende.id}`}
            className="inline-flex min-h-11 flex-1 items-center justify-end gap-2 rounded-lg border border-line px-4 text-green-dark transition-colors hover:bg-white sm:flex-none"
          >
            <span className="min-w-0 text-right">
              <span className="block text-xs text-muted">Volgende</span>
              <span className="block truncate text-sm font-semibold">
                {volgende.titel}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
