"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  gelastLesAf,
  zetAanwezigheid,
  type BeheerResultaat,
} from "../server/admin-acties";

const BEGIN: BeheerResultaat = { status: "idle" };

/** Iemand als niet-verschenen noteren, of dat weer terugdraaien (§7.4). */
export function AanwezigheidKnop({
  boekingId,
  lesId,
  afwezig,
}: {
  boekingId: string;
  lesId: string;
  afwezig: boolean;
}) {
  const [resultaat, actie] = useActionState(zetAanwezigheid, BEGIN);

  return (
    <form action={actie} className="flex items-center gap-2">
      <input type="hidden" name="boekingId" value={boekingId} />
      <input type="hidden" name="lesId" value={lesId} />
      <input
        type="hidden"
        name="status"
        value={afwezig ? "geboekt" : "niet_verschenen"}
      />
      <SubmitButton variant="ghost" size="sm" bezigLabel="Bezig…">
        {afwezig ? "Toch aanwezig" : "Niet verschenen"}
      </SubmitButton>
      {resultaat.status === "fout" ? (
        <span className="text-sm text-error">{resultaat.bericht}</span>
      ) : null}
    </form>
  );
}

/** Een les afgelasten, met een reden voor in het logboek. */
export function LesAfgelastenFormulier({ lesId }: { lesId: string }) {
  const [resultaat, actie] = useActionState(gelastLesAf, BEGIN);

  return (
    <form action={actie} className="space-y-3">
      <input type="hidden" name="lesId" value={lesId} />
      <div>
        <label
          htmlFor="reden"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          Reden (optioneel)
        </label>
        <input
          id="reden"
          name="reden"
          maxLength={300}
          placeholder="Bijvoorbeeld: ziekte"
          className="h-11 w-full rounded-lg border border-line-strong bg-background px-3 text-base placeholder:text-muted/70"
        />
      </div>

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}

      <SubmitButton variant="danger" bezigLabel="Bezig…">
        Deze les afgelasten
      </SubmitButton>
    </form>
  );
}
