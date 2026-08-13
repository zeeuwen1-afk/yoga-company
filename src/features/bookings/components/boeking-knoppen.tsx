"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { BookingStatus } from "@/lib/supabase/types";
import {
  annuleerBoeking,
  boekLes,
  type BoekingResultaat,
} from "../server/acties";

const BEGIN: BoekingResultaat = { status: "idle" };

/**
 * Boeken of annuleren voor één les.
 *
 * De knop weet zelf niet of er nog plek is: dat bepaalt de database op het
 * moment van boeken. Zit de les inmiddels vol, dan komt de klant op de
 * wachtlijst en zegt de melding dat ook. Zou de knop het hier beslissen, dan
 * kan hij ernaast zitten zodra twee mensen tegelijk kijken.
 */
export function BoekingKnoppen({
  lesId,
  status,
  afgelast,
  teLaatOmTeAnnuleren,
}: {
  lesId: string;
  status: BookingStatus | null;
  afgelast: boolean;
  teLaatOmTeAnnuleren: boolean;
}) {
  const heeftBoeking = status === "geboekt" || status === "wachtlijst";
  const [resultaat, actie] = useActionState(
    heeftBoeking ? annuleerBoeking : boekLes,
    BEGIN,
  );

  return (
    <div className="w-full sm:w-auto">
      <form action={actie} className="flex justify-start sm:justify-end">
        <input type="hidden" name="lesId" value={lesId} />

        {heeftBoeking ? (
          <SubmitButton
            variant="secondary"
            bezigLabel="Bezig met annuleren…"
            disabled={teLaatOmTeAnnuleren && !afgelast}
          >
            {status === "wachtlijst"
              ? "Van de wachtlijst af"
              : "Boeking annuleren"}
          </SubmitButton>
        ) : (
          <SubmitButton bezigLabel="Bezig met boeken…" disabled={afgelast}>
            {afgelast ? "Gaat niet door" : "Boek deze les"}
          </SubmitButton>
        )}
      </form>

      {heeftBoeking && teLaatOmTeAnnuleren && !afgelast ? (
        <p className="mt-2 max-w-xs text-sm text-muted sm:text-right">
          Annuleren kan tot vier uur voor aanvang. Kun je er toch niet bij zijn,
          stuur ons dan even een bericht.
        </p>
      ) : null}

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
          className="mt-3 max-w-xs"
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}
    </div>
  );
}
