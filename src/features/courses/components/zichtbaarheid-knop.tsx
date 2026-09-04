"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

import { zetCursusActief } from "../server/admin-acties";

/**
 * Aanbod aan- of uitzetten vanuit het overzicht.
 *
 * Het scherm toonde "Online" en "Verborgen" al, maar als een label waar je niet
 * op kon klikken: omzetten kon alleen door de cursus te openen, het vinkje te
 * zoeken en op te slaan. De actie erachter bestond al en werd nergens gebruikt.
 *
 * De knop zegt wat er gebeurt als je erop drukt, niet wat de huidige stand is.
 * Anders staat er "Online" op een knop die hem juist offline haalt.
 */
export function ZichtbaarheidKnop({
  cursusId,
  actief,
}: {
  cursusId: string;
  actief: boolean;
}) {
  const router = useRouter();
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startOvergang] = useTransition();

  function wissel() {
    startOvergang(async () => {
      const uitkomst = await zetCursusActief(cursusId, !actief);
      setFout(uitkomst.status === "fout" ? uitkomst.bericht : null);
      if (uitkomst.status === "gelukt") router.refresh();
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={wissel}
        disabled={bezig}
        aria-label={
          actief
            ? "Van de website halen; het aanbod blijft bestaan"
            : "Op de website zetten"
        }
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
          actief
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-sand-light text-muted hover:bg-hover",
        ].join(" ")}
      >
        {actief ? (
          <Eye className="size-3.5" aria-hidden />
        ) : (
          <EyeOff className="size-3.5" aria-hidden />
        )}
        {bezig ? "Bezig…" : actief ? "Online" : "Verborgen"}
      </button>
      {fout ? <p className="mt-1 text-xs text-error">{fout}</p> : null}
    </div>
  );
}
