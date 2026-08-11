"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

import {
  publiceerBericht,
  verwijderBericht,
  type SocialResultaat,
} from "../server/acties";

/**
 * Knoppen bij een bewaard bericht (BOUWPROMPT §15).
 *
 * Verwijderen vraagt om bevestiging: een bericht is snel weg en niet terug te
 * halen. Publiceren verschijnt alleen als de Meta-koppeling aanstaat en het
 * bericht nog niet online is.
 */
export function BerichtActies({
  id,
  metaAan,
  alGepubliceerd,
}: {
  id: string;
  metaAan: boolean;
  alGepubliceerd: boolean;
}) {
  const router = useRouter();
  const [melding, setMelding] = useState<SocialResultaat>({ status: "idle" });
  const [bevestig, setBevestig] = useState(false);
  const [bezig, startOvergang] = useTransition();

  function voerUit(handeling: () => Promise<SocialResultaat>) {
    startOvergang(async () => {
      setMelding(await handeling());
      setBevestig(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {metaAan && !alGepubliceerd ? (
          <Button
            type="button"
            size="sm"
            disabled={bezig}
            onClick={() => voerUit(() => publiceerBericht(id))}
          >
            <Send className="size-4" aria-hidden />
            {bezig ? "Bezig…" : "Publiceren"}
          </Button>
        ) : null}

        {bevestig ? (
          <>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={bezig}
              onClick={() => voerUit(() => verwijderBericht(id))}
            >
              Ja, verwijderen
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBevestig(false)}
            >
              Annuleren
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBevestig(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Verwijderen
          </Button>
        )}
      </div>

      {melding.status === "fout" ? (
        <FormMessage variant="fout">{melding.bericht}</FormMessage>
      ) : null}
      {melding.status === "gelukt" ? (
        <FormMessage variant="gelukt">{melding.bericht}</FormMessage>
      ) : null}
    </div>
  );
}
