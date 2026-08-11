"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { RichtextEditor } from "@/components/ui/richtext-editor";
import { SubmitButton } from "@/components/ui/submit-button";

import { bewaarMailing, type MailingResultaat } from "../server/acties";

const LEEG: MailingResultaat = { status: "idle" };

/**
 * Een mailing opstellen (BOUWPROMPT §10.7).
 *
 * Bewaren en versturen zijn twee handelingen. Versturen kan niet ongedaan
 * worden gemaakt, dus dat gebeurt vanuit het overzicht, met een bevestiging en
 * pas nadat je een proefmail hebt kunnen bekijken.
 */
export function MailingWerkblad({
  aantalOntvangers,
}: {
  aantalOntvangers: number;
}) {
  const [uitkomst, actie] = useActionState(bewaarMailing, LEEG);
  const [inhoud, setInhoud] = useState("");

  return (
    <form action={actie} className="space-y-5">
      <p className="text-sm text-muted">
        Deze mailing gaat naar de{" "}
        <strong>
          {aantalOntvangers} {aantalOntvangers === 1 ? "klant" : "klanten"}
        </strong>{" "}
        die toestemming heeft gegeven. Wie geen toestemming gaf, krijgt hem niet
        — daar is geen instelling voor.
      </p>

      <div>
        <Label htmlFor="onderwerp">Onderwerp</Label>
        <Input
          id="onderwerp"
          name="onderwerp"
          required
          maxLength={200}
          placeholder="Bijvoorbeeld: de opleidingen van komend najaar"
        />
      </div>

      <div>
        <Label htmlFor="inhoud">Bericht</Label>
        <input type="hidden" name="inhoud" value={inhoud} />
        <RichtextEditor waarde={inhoud} onWijzig={setInhoud} />
        <p className="mt-1.5 text-sm text-muted">
          De afmeldlink wordt automatisch onderaan toegevoegd; die hoef je er
          niet zelf bij te zetten.
        </p>
      </div>

      {uitkomst.status === "fout" ? (
        <FormMessage variant="fout">{uitkomst.bericht}</FormMessage>
      ) : null}
      {uitkomst.status === "gelukt" ? (
        <FormMessage variant="gelukt">{uitkomst.bericht}</FormMessage>
      ) : null}

      <SubmitButton bezigLabel="Bezig…">Bewaar als concept</SubmitButton>
    </form>
  );
}
