"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { sluitMaandAf, type DocentResultaat } from "../server/acties";

const BEGIN: DocentResultaat = { status: "idle" };

/**
 * Een maand vastzetten en de facturen klaarzetten.
 *
 * Het werk gebeurt in de database, niet hier: de factuurnummers moeten
 * doorlopen zonder gaten, ook wanneer twee docenten tegelijk op de knop
 * drukken. Deze knop stuurt alleen de maand mee.
 */
export function MaandAfsluiten({
  periode,
  maandnaam,
  teFactureren,
}: {
  periode: string;
  maandnaam: string;
  teFactureren: number;
}) {
  const [resultaat, actie] = useActionState(sluitMaandAf, BEGIN);

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="space-y-3">
      <input type="hidden" name="periode" value={periode} />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton bezigLabel="Afsluiten…" disabled={teFactureren === 0}>
          {maandnaam} afsluiten
        </SubmitButton>
        <p className="text-sm text-muted">
          {teFactureren === 0
            ? "Er valt niets te factureren over deze maand."
            : "Daarna liggen de bedragen vast en gaan de facturen eruit."}
        </p>
      </div>
    </form>
  );
}
