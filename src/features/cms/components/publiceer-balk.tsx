"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import {
  herstelPagina,
  publiceerPagina,
  type EditorResultaat,
} from "../server/editor-acties";

/** Publiceren of concepten weggooien (BOUWPROMPT §14). */
export function PubliceerBalk({
  pageKey,
  aantalConcepten,
}: {
  pageKey: string;
  aantalConcepten: number;
}) {
  const [melding, setMelding] = useState<{
    soort: "gelukt" | "fout";
    tekst: string;
  } | null>(null);
  const [bevestigHerstel, setBevestigHerstel] = useState(false);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  function voerUit(handeling: () => Promise<EditorResultaat>) {
    startOvergang(async () => {
      const uitkomst = await handeling();
      if (uitkomst.status !== "idle") {
        setMelding({
          soort: uitkomst.status === "gelukt" ? "gelukt" : "fout",
          tekst: uitkomst.bericht,
        });
      }
      setBevestigHerstel(false);
      router.refresh();
    });
  }

  if (aantalConcepten === 0) {
    return melding ? (
      <FormMessage variant={melding.soort}>{melding.tekst}</FormMessage>
    ) : (
      <p className="text-sm text-muted">
        Alles wat je hier ziet staat ook op de website. Pas iets aan om te
        beginnen.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {melding ? (
        <FormMessage variant={melding.soort}>{melding.tekst}</FormMessage>
      ) : null}

      <p className="text-sm">
        <strong>{aantalConcepten}</strong>{" "}
        {aantalConcepten === 1 ? "wijziging staat" : "wijzigingen staan"} klaar.
        De website toont ze nog niet.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={bezig}
          onClick={() => voerUit(() => publiceerPagina(pageKey))}
        >
          {bezig ? "Bezig…" : "Publiceren"}
        </Button>

        {bevestigHerstel ? (
          <>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={bezig}
              onClick={() => voerUit(() => herstelPagina(pageKey))}
            >
              Ja, weggooien
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBevestigHerstel(false)}
            >
              Annuleren
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setBevestigHerstel(true)}
          >
            Concepten weggooien
          </Button>
        )}
      </div>
    </div>
  );
}
