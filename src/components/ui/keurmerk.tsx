import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * De keurmerken van Yoga Alliance.
 *
 * Twee registraties op naam van Wietske Visser, en dus iets anders dan de
 * badges van de Yoga Company Academy. Die laatste zijn het eigen keurmerk van
 * de Academy en worden in code getekend; deze twee zijn aangeleverd beeldmerk
 * van een organisatie buiten YogaCompany en horen dus niet nagetekend te
 * worden.
 *
 * Het beeldmerk is donkergroene inkt op een doorzichtige achtergrond. Op een
 * petrol vlak — de paginavoet — zou de letter dan op donker staan en wegvallen.
 * Vandaar de witte schijf eronder: het beeldmerk is rond, dus dat leest als een
 * munt en niet als een vlek. Op een licht vlak valt die schijf weg tegen de
 * achtergrond en zie je alleen het beeldmerk.
 */
const MERKEN = {
  "e-ryt-200": {
    bestand: "/keurmerk/e-ryt-200.png",
    alt: "Yoga Alliance E-RYT 200 — Registered Experienced Yoga Teacher",
  },
  yacep: {
    bestand: "/keurmerk/yacep.png",
    alt: "Yoga Alliance YACEP — Continuing Education Provider",
  },
} as const;

export type KeurmerkNaam = keyof typeof MERKEN;

export function Keurmerk({
  merk,
  className,
}: {
  merk: KeurmerkNaam;
  /** Bepaalt de grootte, bijvoorbeeld `w-20`. */
  className?: string;
}) {
  const info = MERKEN[merk];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-paper-warm",
        className,
      )}
    >
      <Image
        src={info.bestand}
        alt={info.alt}
        width={720}
        height={720}
        className="h-auto w-full"
      />
    </span>
  );
}
