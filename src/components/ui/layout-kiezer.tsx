"use client";

import {
  LAYOUTS,
  LAYOUT_LABEL,
  WAASSTANDEN,
  WAAS_LABEL,
  isAchtergrond,
  leesLayout,
  leesWaas,
} from "@/lib/beeldlayout";

/**
 * Waar de foto komt te staan ten opzichte van de tekst.
 *
 * Vier schetsjes in plaats van een keuzelijst met woorden: je herkent een
 * indeling sneller dan je hem leest, en "foto rechts" betekent voor iedereen
 * net iets anders tot je het ziet.
 */
export function LayoutKiezer({
  waarde,
  waas,
  onWijzig,
  onWaas,
}: {
  waarde: string | undefined;
  waas: string | undefined;
  onWijzig: (layout: string) => void;
  onWaas: (waas: string) => void;
}) {
  const gekozen = leesLayout(waarde);
  const huidigeWaas = leesWaas(waas);

  return (
    <fieldset>
      <legend className="text-sm font-semibold">Waar staat de foto?</legend>
      <p className="mt-1 mb-2 text-sm text-muted">
        Op een telefoon staat de foto altijd boven de tekst; naast elkaar past
        daar niet.
      </p>

      <div className="flex flex-wrap gap-2">
        {LAYOUTS.map((layout) => (
          <label
            key={layout}
            className={[
              "w-28 cursor-pointer rounded-lg border p-2 transition-colors",
              gekozen === layout
                ? "bg-accent-wash border-accent"
                : "border-line hover:bg-hover",
            ].join(" ")}
          >
            <input
              type="radio"
              name="beeld-layout"
              value={layout}
              checked={gekozen === layout}
              onChange={() => onWijzig(layout)}
              className="sr-only"
            />
            <Schets layout={layout} />
            <span className="mt-1.5 block text-center text-xs">
              {LAYOUT_LABEL[layout]}
            </span>
          </label>
        ))}
      </div>

      {/* Alleen bij een achtergrond: bij de andere vier ligt de tekst niet op
          de foto, en dan gaat deze vraag nergens over. */}
      {isAchtergrond(gekozen) ? (
        <div className="mt-4 rounded-lg border border-line bg-cream p-3">
          <p className="text-sm font-semibold">Hoe donker over de foto?</p>
          <p className="mt-1 text-sm text-muted">
            Er ligt altijd een waas over de foto, anders is de tekst op een
            lichte plek niet te lezen. Staat er veel op de foto, kies dan
            donkerder.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WAASSTANDEN.map((stand) => (
              <label
                key={stand}
                className={[
                  "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  huidigeWaas === stand
                    ? "bg-accent-wash border-accent font-semibold"
                    : "border-line hover:bg-hover",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="beeld-waas"
                  value={stand}
                  checked={huidigeWaas === stand}
                  onChange={() => onWaas(stand)}
                  className="sr-only"
                />
                {WAAS_LABEL[stand]}
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}

/** Een miniatuur van de indeling: grijs vlak is de foto, streepjes de tekst. */
function Schets({ layout }: { layout: string }) {
  const beeld = <span className="block rounded-sm bg-muted/50" />;
  const regels = (
    <span className="flex flex-1 flex-col justify-center gap-1">
      <span className="block h-0.5 rounded-sm bg-line-strong" />
      <span className="block h-0.5 rounded-sm bg-line-strong" />
      <span className="block h-0.5 w-3/5 rounded-sm bg-line-strong" />
    </span>
  );

  if (layout === "links") {
    return (
      <span className="flex h-9 gap-1" aria-hidden>
        <span className="block w-2/5 rounded-sm bg-muted/50" />
        {regels}
      </span>
    );
  }
  if (layout === "rechts") {
    return (
      <span className="flex h-9 gap-1" aria-hidden>
        {regels}
        <span className="block w-2/5 rounded-sm bg-muted/50" />
      </span>
    );
  }
  if (layout === "achtergrond") {
    // De tekst ligt op de foto: één vlak met de regels erin.
    return (
      <span
        className="flex h-9 flex-col justify-center gap-1 rounded-sm bg-muted/70 px-1.5"
        aria-hidden
      >
        <span className="block h-0.5 rounded-sm bg-cream" />
        <span className="block h-0.5 w-3/5 rounded-sm bg-cream" />
      </span>
    );
  }
  if (layout === "onder") {
    return (
      <span className="flex h-9 flex-col gap-1" aria-hidden>
        {regels}
        <span className="block h-3 rounded-sm bg-muted/50" />
      </span>
    );
  }
  return (
    <span className="flex h-9 flex-col gap-1" aria-hidden>
      <span className="block h-3 rounded-sm bg-muted/50" />
      {regels}
      {beeld}
    </span>
  );
}
