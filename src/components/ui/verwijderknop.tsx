"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

type Uitkomst = { status: "gelukt" | "fout" | "idle"; bericht?: string };

/**
 * Iets definitief weghalen, met een tussenstap.
 *
 * Twee dingen waar deze knop op let, en die allebei uit ervaring komen:
 *
 *  - **Nooit in één klik.** De eerste klik vraagt of je het zeker weet en zegt
 *    erbij wát er weggaat. Dat is de enige rem die er is; er komt geen mail
 *    achteraan waarmee je het terugdraait.
 *  - **Een weigering is geen fout van de gebruiker.** Kan het niet weg omdat er
 *    iemand op ingeschreven staat, dan komt die uitleg hier te staan met het
 *    alternatief erbij. Niet "er ging iets mis", maar wat er aan de hand is.
 */
export function VerwijderKnop({
  wat,
  waarschuwing,
  onVerwijder,
  label = "Verwijderen",
}: {
  /** Wat er weggaat, zoals het in de bevestiging komt te staan. */
  wat: string;
  /** Extra regel bij de bevestiging, als er iets is om op te letten. */
  waarschuwing?: string;
  onVerwijder: () => Promise<Uitkomst>;
  label?: string;
}) {
  const router = useRouter();
  const [bevestig, setBevestig] = useState(false);
  const [melding, setMelding] = useState<Uitkomst>({ status: "idle" });
  const [bezig, startOvergang] = useTransition();

  function verwijder() {
    startOvergang(async () => {
      const uitkomst = await onVerwijder();
      setMelding(uitkomst);
      setBevestig(false);
      if (uitkomst.status === "gelukt") router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {melding.status === "fout" && melding.bericht ? (
        <FormMessage variant="fout">{melding.bericht}</FormMessage>
      ) : null}
      {melding.status === "gelukt" && melding.bericht ? (
        <FormMessage variant="gelukt">{melding.bericht}</FormMessage>
      ) : null}

      {bevestig ? (
        <div className="rounded-lg border border-line bg-cream p-4">
          <p className="mb-1 text-sm">
            <strong>{wat}</strong> wordt verwijderd. Dit kan niet ongedaan
            worden gemaakt.
          </p>
          {waarschuwing ? (
            <p className="mb-3 text-sm text-muted">{waarschuwing}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={bezig}
              onClick={verwijder}
            >
              {bezig ? "Bezig…" : "Ja, verwijderen"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={bezig}
              onClick={() => setBevestig(false)}
            >
              Annuleren
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setBevestig(true)}
        >
          <Trash2 className="size-4" aria-hidden />
          {label}
        </Button>
      )}
    </div>
  );
}
