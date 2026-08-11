"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, TestTube2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

import {
  verstuurMailing,
  verstuurProef,
  verwijderMailing,
  type MailingResultaat,
} from "../server/acties";

/**
 * Knoppen bij één mailing (BOUWPROMPT §10.7).
 *
 * Versturen kan niet ongedaan worden gemaakt. Daarom noemt de bevestiging het
 * aantal ontvangers: dat is het getal waar je op let voordat je op verzenden
 * drukt.
 */
export function MailingActies({
  id,
  aantalOntvangers,
  alVerstuurd,
}: {
  id: string;
  aantalOntvangers: number;
  alVerstuurd: boolean;
}) {
  const router = useRouter();
  const [melding, setMelding] = useState<MailingResultaat>({ status: "idle" });
  const [bevestig, setBevestig] = useState<"verzenden" | "verwijderen" | null>(
    null,
  );
  const [bezig, startOvergang] = useTransition();

  function voerUit(handeling: () => Promise<MailingResultaat>) {
    startOvergang(async () => {
      setMelding(await handeling());
      setBevestig(null);
      router.refresh();
    });
  }

  if (alVerstuurd) {
    return null;
  }

  return (
    <div className="space-y-2">
      {bevestig === "verzenden" ? (
        <div className="rounded-lg border border-line bg-cream p-4">
          <p className="mb-3 text-sm">
            Deze mailing gaat naar <strong>{aantalOntvangers}</strong>{" "}
            {aantalOntvangers === 1 ? "ontvanger" : "ontvangers"}. Versturen kan
            niet ongedaan worden gemaakt.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={bezig}
              onClick={() => voerUit(() => verstuurMailing(id))}
            >
              {bezig ? "Bezig met versturen…" : "Ja, verstuur nu"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBevestig(null)}
            >
              Annuleren
            </Button>
          </div>
        </div>
      ) : bevestig === "verwijderen" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={bezig}
            onClick={() => voerUit(() => verwijderMailing(id))}
          >
            Ja, verwijderen
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBevestig(null)}
          >
            Annuleren
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={bezig}
            onClick={() => voerUit(() => verstuurProef(id))}
          >
            <TestTube2 className="size-4" aria-hidden />
            Proefmail naar mijzelf
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={bezig || aantalOntvangers === 0}
            onClick={() => setBevestig("verzenden")}
          >
            <Send className="size-4" aria-hidden />
            Versturen
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBevestig("verwijderen")}
          >
            <Trash2 className="size-4" aria-hidden />
            Verwijderen
          </Button>
        </div>
      )}

      {melding.status === "fout" ? (
        <FormMessage variant="fout">{melding.bericht}</FormMessage>
      ) : null}
      {melding.status === "gelukt" ? (
        <FormMessage variant="gelukt">{melding.bericht}</FormMessage>
      ) : null}
    </div>
  );
}
