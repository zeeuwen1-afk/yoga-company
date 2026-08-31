"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { uploadFoto, type PaginaResultaat } from "../server/acties";

const BEGIN: PaginaResultaat = { status: "idle" };

/**
 * Een foto toevoegen aan de eigen beeldbank.
 *
 * Het bestand komt in een map die alleen van deze docent is. Dat is niet
 * alleen netjes: zonder die scheiding kan een collega jouw foto overschrijven
 * door er een met dezelfde naam te uploaden.
 */
export function FotoUploaden() {
  const [resultaat, actie] = useActionState(uploadFoto, BEGIN);

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
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="h-auto py-2.5"
          />
          <p className="mt-1 text-xs text-muted">
            jpg, png of webp, maximaal 3 MB.
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

        <SubmitButton variant="ghost" bezigLabel="Uploaden…">
          Uploaden
        </SubmitButton>
      </form>
    </section>
  );
}
