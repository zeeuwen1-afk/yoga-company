"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { BLOKTYPEN, MAX_VRIJE_BLOKKEN } from "@/content/vrije-blokken";

import {
  voegVrijBlokToe,
  type VrijBlokResultaat,
} from "../server/vrije-blokken-acties";
import { VrijBlokBewerker } from "./vrij-blok-bewerker";

/**
 * De vrije zone onder aan een pagina.
 *
 * De vaste secties erboven hebben elk hun eigen ontwerp en liggen vast: die
 * dragen het gezicht van de site. Hier zet je zelf iets neer, in de volgorde
 * die jij wilt.
 *
 * Alles wat je hier doet is concept. Het gaat mee met dezelfde publiceerknop
 * die de rest van de pagina publiceert, zodat je niet twee keer hoeft te
 * publiceren voor één pagina.
 */
export function VrijeBlokkenPaneel({
  pageKey,
  blokken,
}: {
  pageKey: string;
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
  const [kiezen, setKiezen] = useState(false);
  const [melding, setMelding] = useState<VrijBlokResultaat>({ status: "idle" });
  const [bezig, startOvergang] = useTransition();

  const zichtbaar = blokken.filter((blok) => !blok.conceptVerwijderd);
  const vol = blokken.length >= MAX_VRIJE_BLOKKEN;

  function voegToe(type: string) {
    startOvergang(async () => {
      setMelding(await voegVrijBlokToe(pageKey, type));
      setKiezen(false);
    });
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-sm text-muted">
        Blokken die je zelf onder deze pagina zet, onder de vaste secties. Ze
        gaan online zodra je de pagina publiceert.
      </p>

      {melding.status === "fout" ? (
        <FormMessage variant="fout">{melding.bericht}</FormMessage>
      ) : null}
      {melding.status === "gelukt" ? (
        <p className="text-sm text-success" aria-live="polite">
          {melding.bericht}
        </p>
      ) : null}

      {zichtbaar.length === 0 && blokken.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
          Nog niets. Voeg een blok toe als je onder deze pagina iets
          extra&rsquo;s wilt zetten.
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

      {kiezen ? (
        <div className="space-y-2 rounded-[var(--radius-card)] border border-line bg-cream p-4">
          <p className="font-semibold">Wat wil je toevoegen?</p>
          <ul className="space-y-2">
            {BLOKTYPEN.map((type) => (
              <li key={type.type}>
                <button
                  type="button"
                  onClick={() => voegToe(type.type)}
                  disabled={bezig}
                  className="w-full rounded-lg border border-line bg-background p-3 text-left transition-colors hover:bg-hover disabled:opacity-60"
                >
                  <span className="block font-semibold">{type.naam}</span>
                  <span className="block text-sm text-muted">
                    {type.omschrijving}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setKiezen(false)}
          >
            Annuleren
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setKiezen(true)}
          disabled={vol || bezig}
        >
          <Plus className="size-4" aria-hidden />
          Blok toevoegen
        </Button>
      )}

      {vol ? (
        <p className="text-sm text-muted">
          Er passen {MAX_VRIJE_BLOKKEN} blokken onder een pagina. Haal er eerst
          een weg.
        </p>
      ) : null}
    </div>
  );
}
