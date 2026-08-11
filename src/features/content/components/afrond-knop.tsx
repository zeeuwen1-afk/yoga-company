"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { markeerAfgerond } from "@/features/progress/acties";

/** Knop om een lesonderdeel af te vinken (BOUWPROMPT §11). */
export function AfrondKnop({
  itemId,
  isAfgerond,
}: {
  itemId: string;
  isAfgerond: boolean;
}) {
  const [afgerond, setAfgerond] = useState(isAfgerond);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  function wissel() {
    const nieuw = !afgerond;
    // Meteen omschakelen zodat het scherm direct reageert; blijkt het opslaan
    // te mislukken, dan zetten we het terug.
    setAfgerond(nieuw);

    startOvergang(async () => {
      const uitkomst = await markeerAfgerond({
        contentItemId: itemId,
        afgerond: nieuw,
      });

      if (!uitkomst.gelukt) {
        setAfgerond(!nieuw);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={afgerond ? "secondary" : "primary"}
      onClick={wissel}
      disabled={bezig}
      aria-pressed={afgerond}
    >
      {afgerond ? (
        <>
          <Check className="size-4" aria-hidden />
          Afgerond
        </>
      ) : (
        "Markeer als afgerond"
      )}
    </Button>
  );
}
