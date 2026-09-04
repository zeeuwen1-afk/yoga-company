"use client";

import { VerwijderKnop } from "@/components/ui/verwijderknop";

import { verwijderCursus } from "../server/admin-acties";

/** Het aanbod definitief weghalen. Lukt alleen als er niets aan hangt. */
export function AanbodVerwijderen({
  cursusId,
  titel,
}: {
  cursusId: string;
  titel: string;
}) {
  return (
    <VerwijderKnop
      wat={titel}
      waarschuwing="Kan alleen als er geen inschrijvingen en geen lesmateriaal aan hangen. Is dat wel zo, dan krijg je te horen wat er in de weg zit."
      onVerwijder={() => verwijderCursus(cursusId)}
      label="Dit aanbod verwijderen"
    />
  );
}
