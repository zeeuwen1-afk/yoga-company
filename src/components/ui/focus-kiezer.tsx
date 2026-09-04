"use client";

import Image from "next/image";
import { Crosshair } from "lucide-react";

import { MIDDEN, leesFocus } from "@/lib/beeldfocus";

/**
 * Aanwijzen welk deel van een foto altijd in beeld moet blijven.
 *
 * Een foto komt op de site in een vast kader terecht: breed en laag boven aan
 * een pagina, staand bij een portret. Past de verhouding niet, dan snijdt de
 * browser bij vanuit het midden. Bij een staande telefoonfoto in een breed
 * kader levert dat een romp zonder hoofd op, en daar was tot nu toe niets aan
 * te doen.
 *
 * Hier klik je het punt aan dat hoe dan ook zichtbaar moet blijven. Het kader
 * schuift daar naartoe in plaats van bot uit het midden te snijden.
 *
 * Bewust geen bijsnijder met slepen en zoomen: dat is veel meer machinerie voor
 * hetzelfde resultaat, en op een telefoon nauwelijks te bedienen.
 *
 * De hele afbeelding is één knop, zodat dit ook met het toetsenbord werkt: de
 * pijltjestoetsen verplaatsen het punt met stapjes van vijf procent.
 */
export function FocusKiezer({
  url,
  alt,
  focus,
  onWijzig,
}: {
  url: string;
  alt: string;
  focus: string | undefined;
  onWijzig: (focus: string) => void;
}) {
  const { x, y } = leesFocus(focus);

  function zet(nieuwX: number, nieuwY: number) {
    const begrens = (getal: number) => Math.min(100, Math.max(0, getal));
    onWijzig(`${Math.round(begrens(nieuwX))}% ${Math.round(begrens(nieuwY))}%`);
  }

  function klik(event: React.MouseEvent<HTMLButtonElement>) {
    const vlak = event.currentTarget.getBoundingClientRect();
    zet(
      ((event.clientX - vlak.left) / vlak.width) * 100,
      ((event.clientY - vlak.top) / vlak.height) * 100,
    );
  }

  function toets(event: React.KeyboardEvent<HTMLButtonElement>) {
    const stap = event.shiftKey ? 1 : 5;
    const richting: Record<string, [number, number]> = {
      ArrowLeft: [-stap, 0],
      ArrowRight: [stap, 0],
      ArrowUp: [0, -stap],
      ArrowDown: [0, stap],
    };
    const verplaatsing = richting[event.key];
    if (!verplaatsing) return;

    event.preventDefault();
    zet(x + verplaatsing[0], y + verplaatsing[1]);
  }

  const inHetMidden = focus === undefined || focus === MIDDEN;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">Wat er in beeld moet blijven</p>
        {!inHetMidden ? (
          <button
            type="button"
            onClick={() => onWijzig(MIDDEN)}
            className="text-sm underline underline-offset-2 hover:no-underline"
          >
            Terug naar het midden
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={klik}
        onKeyDown={toets}
        aria-label={`Kies wat er in beeld blijft. Nu op ${Math.round(x)} procent van links en ${Math.round(y)} procent van boven. Gebruik de pijltjestoetsen om te verplaatsen.`}
        className="relative block h-56 w-full max-w-md cursor-crosshair overflow-hidden rounded-lg border border-line bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Image
          src={url}
          alt={alt || "De gekozen afbeelding"}
          fill
          sizes="448px"
          className="object-contain"
        />
        <span
          aria-hidden
          style={{ left: `${x}%`, top: `${y}%` }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-petrol-deep/80 text-cream ring-2 ring-cream">
            <Crosshair className="size-4" />
          </span>
        </span>
      </button>

      <p className="text-sm text-muted">
        Klik op het gezicht of op wat er niet weg mag vallen. Daar blijft de
        foto omheen staan, ook als het kader smaller of lager is dan de foto
        zelf.
      </p>
    </div>
  );
}
