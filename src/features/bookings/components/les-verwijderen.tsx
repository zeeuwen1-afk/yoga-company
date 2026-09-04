"use client";

import { VerwijderKnop } from "@/components/ui/verwijderknop";

import { verwijderLes } from "../server/admin-acties";

/**
 * Een les uit het rooster halen.
 *
 * Iets anders dan afgelasten: dat laat de les staan met een streep erdoor,
 * zodat deelnemers zien dat hij niet doorgaat. Verwijderen is voor een les die
 * er nooit had moeten staan.
 */
export function LesVerwijderen({
  lesId,
  titel,
}: {
  lesId: string;
  titel: string;
}) {
  return (
    <VerwijderKnop
      wat={titel}
      waarschuwing="Kan alleen zolang er niemand heeft geboekt. Heeft dat wel iemand gedaan, gelast de les dan af; dan zien zij wat er is gebeurd."
      onVerwijder={() => verwijderLes(lesId)}
      label="Deze les verwijderen"
    />
  );
}
