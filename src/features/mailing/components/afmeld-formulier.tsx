"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

import { meldAf, type AfmeldResultaat } from "../server/afmeld-actie";

const LEEG: AfmeldResultaat = { status: "idle" };

/** Bevestigingsknop op de afmeldpagina (BOUWPROMPT §10.7). */
export function AfmeldFormulier({ token }: { token: string }) {
  const [uitkomst, actie] = useActionState(meldAf, LEEG);

  if (uitkomst.status === "gelukt") {
    return <FormMessage variant="gelukt">{uitkomst.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {uitkomst.status === "fout" ? (
        <FormMessage variant="fout">{uitkomst.bericht}</FormMessage>
      ) : null}

      <SubmitButton bezigLabel="Bezig met afmelden…">
        Ja, meld me af
      </SubmitButton>
    </form>
  );
}
