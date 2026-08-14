"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  startInschrijving,
  type InschrijfResultaat,
} from "../server/inschrijven";

const BEGIN: InschrijfResultaat | { status: "idle" } = { status: "idle" };

/**
 * De knop past zich aan aan de betaalkoppeling (bouwprompt §7.1).
 *
 * Staat Mollie aan, dan gaat de klant door naar de betaalpagina. Staat hij
 * uit, dan wordt dit een aanmelding en neemt de eigenaar persoonlijk contact
 * op. `betalenAan` komt van de server: de sleutel zelf mag de browser nooit
 * bereiken, alleen het feit dát er een koppeling is.
 */
export function InschrijfKnop({
  slug,
  betalenAan,
}: {
  slug: string;
  betalenAan: boolean;
}) {
  const [resultaat, actie] = useActionState(startInschrijving, BEGIN);

  if (resultaat.status === "aangevraagd") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton
        size="lg"
        className="w-full"
        bezigLabel={
          betalenAan ? "Betaalpagina openen…" : "Aanmelding versturen…"
        }
      >
        {betalenAan ? "Doorgaan naar betalen" : "Aanmelden"}
      </SubmitButton>

      {!betalenAan ? (
        <p className="text-sm text-muted">
          Je meldt je hier aan; betalen doe je later. We nemen binnen twee
          werkdagen contact met je op om de inschrijving af te ronden.
        </p>
      ) : null}
    </form>
  );
}
