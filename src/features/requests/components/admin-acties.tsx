"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  zetAanvraagStatus,
  verwijderContactbericht,
} from "../server/admin-acties";
import type { RequestStatus } from "@/lib/supabase/types";

/** Statuskeuze bij een aanvraag (BOUWPROMPT §13). */
export function StatusKeuze({
  aanvraagId,
  huidig,
}: {
  aanvraagId: string;
  huidig: RequestStatus;
}) {
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Status van deze aanvraag</span>
      <select
        value={huidig}
        disabled={bezig}
        onChange={(event) => {
          const nieuw = event.target.value as RequestStatus;
          startOvergang(async () => {
            await zetAanvraagStatus(aanvraagId, nieuw);
            router.refresh();
          });
        }}
        className="h-10 rounded-lg border border-line bg-white px-3"
      >
        <option value="open">Open</option>
        <option value="in_behandeling">In behandeling</option>
        <option value="afgerond">Afgerond</option>
      </select>
    </label>
  );
}

export function ContactberichtVerwijderen({
  berichtId,
}: {
  berichtId: string;
}) {
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={bezig}
      onClick={() =>
        startOvergang(async () => {
          await verwijderContactbericht(berichtId);
          router.refresh();
        })
      }
      className="inline-flex h-11 items-center text-sm text-muted underline hover:text-error"
    >
      Verwijderen
    </button>
  );
}
