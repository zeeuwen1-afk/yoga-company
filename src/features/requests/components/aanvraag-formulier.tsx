"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { dienAanvraagIn, type AanvraagResultaat } from "../server/acties";

const BEGIN: AanvraagResultaat = { status: "idle" };

const SOORTEN = [
  {
    waarde: "vraag",
    label: "Een vraag stellen",
    uitleg: "Over een opleiding, de planning of iets anders.",
  },
  {
    waarde: "inschrijving",
    label: "Inschrijven op een opleiding",
    uitleg: "Bijvoorbeeld als je in termijnen wilt betalen.",
  },
  {
    waarde: "wijziging",
    label: "Mijn gegevens laten wijzigen",
    uitleg: "Iets dat je niet zelf in je profiel kunt aanpassen.",
  },
  {
    waarde: "avg_export",
    label: "Mijn gegevens opvragen",
    uitleg:
      "Je kunt ze ook meteen zelf downloaden onder Profiel — dat gaat sneller.",
  },
  {
    waarde: "avg_verwijdering",
    label: "Mijn account laten verwijderen",
    uitleg:
      "We anonimiseren je gegevens. Inschrijvingen blijven geanonimiseerd staan voor de boekhouding, zoals de wet vereist.",
  },
] as const;

export function AanvraagFormulier({
  standaardSoort,
}: {
  standaardSoort?: string;
}) {
  const [resultaat, actie] = useActionState(dienAanvraagIn, BEGIN);
  const [soort, setSoort] = useState(standaardSoort ?? "vraag");

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  const gekozen = SOORTEN.find((optie) => optie.waarde === soort);
  const isVerwijdering = soort === "avg_verwijdering";

  return (
    <form action={actie} className="space-y-5">
      <fieldset>
        <legend className="mb-3 block text-sm font-semibold text-ink">
          Waar gaat je aanvraag over?
        </legend>

        <div className="space-y-2">
          {SOORTEN.map((optie) => (
            <label
              key={optie.waarde}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-cream has-[:checked]:border-green has-[:checked]:bg-cream"
            >
              <input
                type="radio"
                name="kind"
                value={optie.waarde}
                checked={soort === optie.waarde}
                onChange={(event) => setSoort(event.target.value)}
                className="mt-1 size-4 shrink-0 accent-green"
              />
              <span>
                <span className="block font-semibold">{optie.label}</span>
                <span className="block text-sm text-muted">{optie.uitleg}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="body">
          Toelichting{" "}
          <span className="font-normal text-muted">
            {isVerwijdering ? "(niet verplicht)" : ""}
          </span>
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          placeholder={
            isVerwijdering
              ? "Wil je ons iets meegeven? Dat mag, maar het hoeft niet."
              : "Vertel kort waar we je mee kunnen helpen."
          }
        />
      </div>

      {isVerwijdering ? (
        <FormMessage variant="fout">
          Let op: verwijdering is definitief. Je verliest de toegang tot je
          lesmateriaal en je voortgang. {gekozen?.uitleg}
        </FormMessage>
      ) : null}

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton
        variant={isVerwijdering ? "danger" : "primary"}
        bezigLabel="Versturen…"
      >
        {isVerwijdering ? "Verwijdering aanvragen" : "Aanvraag versturen"}
      </SubmitButton>
    </form>
  );
}
