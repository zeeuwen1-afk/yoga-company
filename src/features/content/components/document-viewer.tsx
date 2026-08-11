"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";

/**
 * Documenten (pdf) uit de beschermde opslag (BOUWPROMPT §11).
 *
 * De link is tijdelijk en persoonlijk, en wordt daarom pas na het laden
 * opgehaald. Op de telefoon tonen browsers pdf's in een iframe vaak slecht;
 * daar is de downloadknop de betrouwbare weg, dus die staat er altijd bij.
 */
export function DocumentViewer({
  itemId,
  titel,
}: {
  itemId: string;
  titel: string;
}) {
  const [bron, setBron] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let geannuleerd = false;

    void (async () => {
      try {
        const antwoord = await fetch(`/api/v1/content/${itemId}`);
        if (!antwoord.ok) throw new Error(String(antwoord.status));

        const { data } = await antwoord.json();
        if (!geannuleerd) setBron(data.url);
      } catch {
        if (!geannuleerd) {
          setFout(
            "Het document kon niet worden geladen. Ververs de pagina, of laat het ons weten als het blijft misgaan.",
          );
        }
      }
    })();

    return () => {
      geannuleerd = true;
    };
  }, [itemId]);

  if (fout) return <FormMessage variant="fout">{fout}</FormMessage>;

  if (!bron) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-[var(--radius-card)] border border-line bg-sand-light"
        aria-live="polite"
      >
        <span className="text-sm text-muted">Document wordt geladen…</span>
      </div>
    );
  }

  return (
    <div>
      <a
        href={bron}
        download
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-green px-5 font-semibold text-cream transition-colors hover:bg-green-dark"
      >
        <Download className="size-5" aria-hidden />
        Download {titel}
      </a>

      {/* Voorvertoning op grotere schermen; op de telefoon is downloaden
          betrouwbaarder dan een ingesloten pdf. */}
      <div className="mt-5 hidden overflow-hidden rounded-[var(--radius-card)] border border-line md:block">
        <iframe
          src={bron}
          title={titel}
          className="h-[36rem] w-full"
          // De pdf komt uit onze eigen opslag maar wordt door de browser
          // gerenderd; sandboxing houdt eventuele scripts erin tegen.
          sandbox=""
        />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted md:hidden">
        <FileText className="size-4" aria-hidden />
        Open het document na het downloaden.
      </p>
    </div>
  );
}
