"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  startInschrijving,
  type InschrijfResultaat,
} from "../server/inschrijven";

const BEGIN: InschrijfResultaat | { status: "idle" } = { status: "idle" };

export function InschrijfKnop({ slug }: { slug: string }) {
  const [resultaat, actie] = useActionState(startInschrijving, BEGIN);

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton
        size="lg"
        className="w-full"
        bezigLabel="Betaalpagina openen…"
      >
        Doorgaan naar betalen
      </SubmitButton>
    </form>
  );
}
