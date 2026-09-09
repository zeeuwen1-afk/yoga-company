"use client";

import { useActionState, useState } from "react";

import {
  FieldError,
  FormMessage,
  Honeypot,
} from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

import {
  verstuurAanmelding,
  type AanmeldingResultaat,
} from "../server/aanmelding";

const BEGIN: AanmeldingResultaat = { status: "idle" };

/**
 * Aanmelden voor een opleiding, module of blok.
 *
 * Geen account, geen betaling vooraf. Wie op een modulepagina besluit dat hij
 * mee wil doen, vult hier zijn gegevens in; de lesdata en de betaling volgen in
 * het antwoord. De route via het portaal begint met een inlogscherm, en dat is
 * precies het moment waarop mensen afhaken.
 *
 * De keuzelijst komt uit de prijstabel op de pagina, zodat er nooit een variant
 * te kiezen valt die niet bestaat en de beheerder hem op één plek bijwerkt.
 * Staat er een variant voorgeselecteerd — je komt van een modulepagina — dan
 * staat die alvast goed, maar je kunt hem nog wijzigen: iemand die de module
 * leest en toch de hele opleiding wil, hoeft niet terug.
 */
export function AanmeldFormulier({
  onderwerp,
  varianten,
  gekozen,
}: {
  /** Van welke pagina de aanmelding komt; staat bovenaan het bericht. */
  onderwerp: string;
  /** De varianten uit de prijstabel. */
  varianten: string[];
  /** Wat er voorgeselecteerd staat, als je van een modulepagina komt. */
  gekozen?: string;
}) {
  const [resultaat, actie] = useActionState(verstuurAanmelding, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  const opties = varianten.filter((variant) => variant.trim());
  const [variant, setVariant] = useState(
    gekozen && opties.includes(gekozen) ? gekozen : (opties[0] ?? ""),
  );

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form
      action={actie}
      className="space-y-5 rounded-[var(--radius-card)] border border-line bg-background p-6 sm:p-8"
      noValidate
    >
      <Honeypot />
      <input type="hidden" name="onderwerp" value={onderwerp} />

      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="variant">Waarvoor meld je je aan?</Label>
        {opties.length > 0 ? (
          <select
            id="variant"
            name="variant"
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
            className="h-11 w-full rounded-lg border border-line-strong bg-background px-3"
            aria-invalid={velden?.variant ? true : undefined}
          >
            {opties.map((optie) => (
              <option key={optie} value={optie}>
                {optie}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id="variant"
            name="variant"
            required
            defaultValue={gekozen ?? ""}
            placeholder="Bijvoorbeeld: module 1"
            aria-invalid={velden?.variant ? true : undefined}
          />
        )}
        <FieldError>{velden?.variant}</FieldError>
      </div>

      <div>
        <Label htmlFor="aanmeld-naam">Naam</Label>
        <Input
          id="aanmeld-naam"
          name="name"
          required
          autoComplete="name"
          aria-invalid={velden?.name ? true : undefined}
        />
        <FieldError>{velden?.name}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="aanmeld-email">E-mailadres</Label>
          <Input
            id="aanmeld-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={velden?.email ? true : undefined}
          />
          <FieldError>{velden?.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="aanmeld-telefoon">Telefoon (niet verplicht)</Label>
          <Input
            id="aanmeld-telefoon"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={velden?.phone ? true : undefined}
          />
          <FieldError>{velden?.phone}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="aanmeld-bericht">
          Vraag of opmerking (niet verplicht)
        </Label>
        <Textarea
          id="aanmeld-bericht"
          name="body"
          rows={4}
          placeholder="Bijvoorbeeld: ik twijfel of mijn instapniveau past."
          aria-invalid={velden?.body ? true : undefined}
        />
        <FieldError>{velden?.body}</FieldError>
      </div>

      <SubmitButton bezigLabel="Versturen…">Meld je aan</SubmitButton>

      <p className="text-sm text-muted">
        Je ontvangt een bevestiging met de lesdata, de locatie en praktische
        informatie. Je plek is definitief na betaling; daar sturen we je een
        bericht over.
      </p>
    </form>
  );
}
