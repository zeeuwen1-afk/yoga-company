"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  beantwoordKlant,
  type AntwoordResultaat,
} from "../server/admin-acties";

const BEGIN: AntwoordResultaat = { status: "idle" };

export function AdminAntwoordFormulier({
  conversationId,
  profileId,
}: {
  conversationId: string;
  profileId: string;
}) {
  const [resultaat, actie] = useActionState(beantwoordKlant, BEGIN);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resultaat.status === "gelukt") formRef.current?.reset();
  }, [resultaat]);

  return (
    <form ref={formRef} action={actie} className="space-y-3">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <input type="hidden" name="profile_id" value={profileId} />

      <label htmlFor="antwoord" className="sr-only">
        Je antwoord
      </label>
      <Textarea
        id="antwoord"
        name="body"
        rows={3}
        required
        placeholder="Schrijf je antwoord…"
      />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton size="sm" bezigLabel="Versturen…">
          Antwoord versturen
        </SubmitButton>
        <span className="text-sm text-muted">
          De klant krijgt een seintje per e-mail, zonder de inhoud.
        </span>
      </div>
    </form>
  );
}
