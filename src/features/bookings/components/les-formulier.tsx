"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { bewaarLes, type BeheerResultaat } from "../server/admin-acties";
import type { BeheerLes } from "../server/admin-queries";

const BEGIN: BeheerResultaat = { status: "idle" };

/**
 * Zet een ISO-tijdstip om naar de vorm die `datetime-local` verwacht, in de
 * Nederlandse tijdzone. Het veld kent geen zone, dus we moeten hem er hier
 * uithalen — anders staat een les van 19:00 als 17:00 in het formulier.
 */
function voorInvoerveld(iso: string): string {
  const delen = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

  return delen.replace(" ", "T");
}

export function LesFormulier({ les }: { les?: BeheerLes }) {
  const [resultaat, actie] = useActionState(bewaarLes, BEGIN);

  return (
    <form action={actie} className="space-y-5">
      {les ? <input type="hidden" name="id" value={les.id} /> : null}

      <div>
        <Label htmlFor="titel">Titel</Label>
        <Input
          id="titel"
          name="titel"
          required
          maxLength={120}
          defaultValue={les?.titel}
          placeholder="Yin Yoga op maandagavond"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="begintOp">Datum en tijd</Label>
          <Input
            id="begintOp"
            name="begintOp"
            type="datetime-local"
            required
            defaultValue={les ? voorInvoerveld(les.begintOp) : undefined}
          />
        </div>
        <div>
          <Label htmlFor="duurMinuten">Duur in minuten</Label>
          <Input
            id="duurMinuten"
            name="duurMinuten"
            type="number"
            min={15}
            max={480}
            step={5}
            required
            defaultValue={les?.duurMinuten ?? 75}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="locatie">Locatie</Label>
          <Input
            id="locatie"
            name="locatie"
            required
            maxLength={160}
            defaultValue={les?.locatie}
            placeholder="Studio"
          />
        </div>
        <div>
          <Label htmlFor="capaciteit">Aantal plekken</Label>
          <Input
            id="capaciteit"
            name="capaciteit"
            type="number"
            min={1}
            max={200}
            required
            defaultValue={les?.capaciteit ?? 12}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="omschrijving">Omschrijving (optioneel)</Label>
        <Textarea
          id="omschrijving"
          name="omschrijving"
          maxLength={1000}
          defaultValue={les?.omschrijving ?? ""}
          placeholder="Voor wie is deze les, en wat kun je verwachten?"
        />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="gepubliceerd"
          defaultChecked={les?.gepubliceerd ?? true}
          className="size-5 accent-[var(--color-green)]"
        />
        <span className="text-sm">
          Zichtbaar op de website
          <span className="block text-muted">
            Laat dit uit zolang je de les nog voorbereidt.
          </span>
        </span>
      </label>

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}

      <SubmitButton bezigLabel="Bezig met opslaan…">
        {les ? "Wijzigingen opslaan" : "Les toevoegen"}
      </SubmitButton>
    </form>
  );
}
