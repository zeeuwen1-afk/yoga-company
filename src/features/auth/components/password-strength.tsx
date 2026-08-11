"use client";

import { useEffect, useMemo, useState } from "react";
import { ZxcvbnFactory, type ZxcvbnResult } from "@zxcvbn-ts/core";

import { MINIMALE_WACHTWOORDLENGTE } from "../schemas";

const NIVEAUS = [
  { label: "zeer zwak", kleur: "bg-error" },
  { label: "zwak", kleur: "bg-error" },
  { label: "redelijk", kleur: "bg-muted" },
  { label: "sterk", kleur: "bg-success" },
  { label: "zeer sterk", kleur: "bg-success" },
] as const;

/**
 * Sterkte-indicator op basis van zxcvbn (BOUWPROMPT §7). De woordenboeken
 * worden pas geladen zodra iemand begint te typen: ze zijn fors en mogen het
 * laden van de pagina niet vertragen.
 */
export function PasswordStrength({ value }: { value: string }) {
  const [zxcvbn, setZxcvbn] = useState<ZxcvbnFactory | null>(null);
  const [result, setResult] = useState<ZxcvbnResult | null>(null);

  useEffect(() => {
    if (!value || zxcvbn) return;

    let geannuleerd = false;
    void (async () => {
      const [common, nl] = await Promise.all([
        import("@zxcvbn-ts/language-common"),
        import("@zxcvbn-ts/language-nl-be"),
      ]);
      if (geannuleerd) return;

      setZxcvbn(
        new ZxcvbnFactory({
          dictionary: {
            ...common.default.dictionary,
            ...nl.default.dictionary,
          },
          graphs: common.default.adjacencyGraphs,
          translations: nl.default.translations,
        }),
      );
    })();

    return () => {
      geannuleerd = true;
    };
  }, [value, zxcvbn]);

  useEffect(() => {
    if (!zxcvbn || !value) {
      setResult(null);
      return;
    }
    setResult(zxcvbn.check(value));
  }, [value, zxcvbn]);

  const teKort = value.length > 0 && value.length < MINIMALE_WACHTWOORDLENGTE;
  const score = result?.score ?? 0;
  const niveau = useMemo(() => NIVEAUS[score] ?? NIVEAUS[0], [score]);

  if (!value) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${
              !teKort && index < score ? niveau.kleur : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-sm text-muted" aria-live="polite">
        {teKort
          ? `Nog minstens ${MINIMALE_WACHTWOORDLENGTE - value.length} tekens nodig`
          : `Sterkte: ${niveau.label}`}
        {!teKort && result?.feedback.warning
          ? ` — ${result.feedback.warning}`
          : ""}
      </p>
    </div>
  );
}
