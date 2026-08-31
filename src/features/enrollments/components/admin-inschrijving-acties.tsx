"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  maakBetaallink,
  markeerHandmatigBetaald,
  type AdminResultaat,
} from "../server/admin-acties";

const BEGIN: AdminResultaat = { status: "idle" };

/**
 * Handmatig op betaald zetten (BOUWPROMPT §9).
 *
 * Kent toegang toe die niet uit een betaling volgt, dus altijd met een reden
 * die in het audit log terechtkomt.
 */
export function HandmatigBetaald({
  enrollmentId,
  standaardBedragCenten,
}: {
  enrollmentId: string;
  standaardBedragCenten: number;
}) {
  const [resultaat, actie] = useActionState(markeerHandmatigBetaald, BEGIN);
  const [open, setOpen] = useState(false);

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Handmatig op betaald zetten
      </Button>
    );
  }

  return (
    <form action={actie} className="space-y-3" noValidate>
      <input type="hidden" name="enrollment_id" value={enrollmentId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`bedrag-${enrollmentId}`}>Bedrag in centen</Label>
          <Input
            id={`bedrag-${enrollmentId}`}
            name="bedrag_centen"
            type="number"
            min={0}
            defaultValue={standaardBedragCenten}
            required
          />
        </div>
        <div>
          <Label htmlFor={`reden-${enrollmentId}`}>Reden</Label>
          <Input
            id={`reden-${enrollmentId}`}
            name="reden"
            placeholder="Bijvoorbeeld: per bank ontvangen"
            required
          />
        </div>
      </div>

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex gap-3">
        <SubmitButton size="sm" bezigLabel="Opslaan…">
          Op betaald zetten
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Annuleren
        </Button>
      </div>
    </form>
  );
}

/** Losse betaallink, bijvoorbeeld voor een termijnbedrag (§9). */
export function BetaallinkMaken({
  enrollmentId,
  cursusTitel,
}: {
  enrollmentId: string;
  cursusTitel: string;
}) {
  const [resultaat, actie] = useActionState(maakBetaallink, BEGIN);
  const [open, setOpen] = useState(false);

  if (resultaat.status === "gelukt" && resultaat.betaalUrl) {
    return (
      <div className="space-y-2">
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
        <Input
          readOnly
          value={resultaat.betaalUrl}
          className="font-mono text-sm"
        />
        <p className="text-sm text-muted">
          Kopieer deze link en stuur hem naar de klant. Hij is eenmalig te
          gebruiken.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Betaallink maken
      </Button>
    );
  }

  return (
    <form action={actie} className="space-y-3" noValidate>
      <input type="hidden" name="enrollment_id" value={enrollmentId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`link-bedrag-${enrollmentId}`}>
            Bedrag in centen
          </Label>
          <Input
            id={`link-bedrag-${enrollmentId}`}
            name="bedrag_centen"
            type="number"
            min={100}
            required
          />
        </div>
        <div>
          <Label htmlFor={`link-omschrijving-${enrollmentId}`}>
            Omschrijving
          </Label>
          <Input
            id={`link-omschrijving-${enrollmentId}`}
            name="omschrijving"
            defaultValue={`${cursusTitel} · termijn`}
            required
          />
        </div>
      </div>

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex gap-3">
        <SubmitButton size="sm" bezigLabel="Aanmaken…">
          Link aanmaken
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Annuleren
        </Button>
      </div>
    </form>
  );
}
