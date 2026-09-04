"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { MAX_ZIJDE, verkleinAfbeelding } from "@/lib/afbeelding";
import { uploadFoto, type PaginaResultaat } from "../server/acties";

const BEGIN: PaginaResultaat = { status: "idle" };

/**
 * Een foto toevoegen aan de eigen beeldbank.
 *
 * Het bestand komt in een map die alleen van deze docent is. Dat is niet
 * alleen netjes: zonder die scheiding kan een collega jouw foto overschrijven
 * door er een met dezelfde naam te uploaden.
 *
 * De foto wordt in de browser verkleind zodra hij is gekozen, nog vóór het
 * verzenden. Dat is hier geen bijzaak maar de kern: een gewone telefoonfoto is
 * groter dan wat een serveractie mag ontvangen, dus zonder deze stap liep een
 * docent vast op een foutmelding die hij niet kon oplossen. Nu is het bestand
 * al klein tegen de tijd dat het formulier wordt verzonden.
 */
export function FotoUploaden() {
  const [resultaat, actie] = useActionState(uploadFoto, BEGIN);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bezig, setBezig] = useState(false);
  const [klaargezet, setKlaargezet] = useState<string | null>(null);

  async function voorbereiden(event: React.ChangeEvent<HTMLInputElement>) {
    const bestand = event.target.files?.[0];
    setKlaargezet(null);
    if (!bestand) return;

    setBezig(true);
    try {
      const { bestand: kleiner, verkleind } = await verkleinAfbeelding(bestand);

      if (verkleind && inputRef.current) {
        // Het gekozen bestand vervangen door de verkleinde versie. Het
        // formulier verstuurt daarna vanzelf de kleine variant.
        const overdracht = new DataTransfer();
        overdracht.items.add(kleiner);
        inputRef.current.files = overdracht.files;

        setKlaargezet(
          `Verkleind van ${mb(bestand.size)} naar ${mb(kleiner.size)}.`,
        );
      }
    } finally {
      setBezig(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-background p-5">
      <h2 className="text-lg">Foto toevoegen</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Je foto&rsquo;s blijven van jou en staan in je eigen map. Kies ze daarna
        in een blok.
      </p>

      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <form action={actie} className="mt-3 space-y-3">
        <div>
          <Label htmlFor="foto">Bestand</Label>
          <Input
            ref={inputRef}
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={voorbereiden}
            className="h-auto py-2.5"
          />
          <p className="mt-1 text-sm text-muted" aria-live="polite">
            {bezig
              ? "Foto voorbereiden…"
              : (klaargezet ??
                `Jpg, png of webp. Grote foto's worden automatisch teruggebracht naar ${MAX_ZIJDE} pixels, dus je hoeft zelf niets te verkleinen.`)}
          </p>
        </div>

        <div>
          <Label htmlFor="foto-alt">Wat er op de foto te zien is</Label>
          <Input
            id="foto-alt"
            name="alt"
            placeholder="Portret in de studio, zittend op een kussen"
          />
        </div>

        {bezig ? (
          <Button type="button" variant="ghost" disabled aria-busy>
            Foto voorbereiden…
          </Button>
        ) : (
          <SubmitButton variant="ghost" bezigLabel="Uploaden…">
            Uploaden
          </SubmitButton>
        )}
      </form>
    </section>
  );
}

function mb(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
