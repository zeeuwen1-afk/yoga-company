"use client";

import { useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";

import {
  voegVrijBlokToe,
  type VrijBlokResultaat,
} from "../server/vrije-blokken-acties";
import { VrijBlokBewerker } from "./vrij-blok-bewerker";

/**
 * Een foto of een tekst bij één sectie.
 *
 * De verleiding was om aan elke sectie een fotoveld te hangen. Dat zouden
 * eenenzestig extra velden zijn in een scherm waar net orde in is gebracht, en
 * de meeste zou niemand ooit invullen: een prijstabel wordt niet beter van een
 * foto.
 *
 * Daarom een knop en geen veld. Een sectie zonder foto toont alleen de knop; er
 * staat niets leegs dat je moet negeren. Wat je toevoegt is hetzelfde blok als
 * in de vrije zone onderaan, met het focuspunt, de indeling en de
 * achtergrondkeuze die je kent, alleen verankerd aan déze sectie.
 */
export function SectieFotos({
  pageKey,
  sectie,
  sectieNaam,
  blokken,
}: {
  pageKey: string;
  sectie: string;
  sectieNaam: string;
  blokken: {
    id: string;
    type: string;
    inhoud: Record<string, unknown>;
    conceptInhoud: Record<string, unknown> | null;
    zichtbaar: boolean;
    conceptVerwijderd: boolean;
    heeftConcept: boolean;
  }[];
}) {
  const [melding, setMelding] = useState<VrijBlokResultaat>({ status: "idle" });
  const [bezig, startOvergang] = useTransition();

  function voegToe(type: string) {
    startOvergang(async () =>
      setMelding(await voegVrijBlokToe(pageKey, type, sectie)),
    );
  }

  const staand = blokken.filter((blok) => !blok.conceptVerwijderd);

  return (
    <div className="space-y-2 border-t border-dashed border-line pt-3">
      {melding.status === "fout" ? (
        <FormMessage variant="fout">{melding.bericht}</FormMessage>
      ) : null}
      {melding.status === "gelukt" ? (
        <p className="text-sm text-success" aria-live="polite">
          {melding.bericht}
        </p>
      ) : null}

      {blokken.map((blok, index) => (
        <VrijBlokBewerker
          key={blok.id}
          pageKey={pageKey}
          blok={blok}
          eerste={index === 0}
          laatste={index === blokken.length - 1}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => voegToe("beeld")}
          disabled={bezig}
          className="hover:bg-accent-wash inline-flex items-center gap-1.5 rounded-lg border border-dashed border-accent px-3 py-1.5 text-sm text-accent transition-colors disabled:opacity-50"
        >
          <ImagePlus className="size-4" aria-hidden />
          {staand.length === 0 ? "Foto bij deze sectie" : "Nog een foto"}
        </button>
        <button
          type="button"
          onClick={() => voegToe("tekst_beeld")}
          disabled={bezig}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm transition-colors hover:bg-hover disabled:opacity-50"
        >
          Foto met tekst
        </button>
      </div>

      <p className="text-sm text-muted">
        Komt onder <span className="font-semibold">{sectieNaam}</span> te staan,
        en gaat online zodra je de pagina publiceert.
      </p>
    </div>
  );
}
