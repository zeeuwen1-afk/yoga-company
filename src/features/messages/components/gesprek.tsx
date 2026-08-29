"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { verstuurBericht, type BerichtResultaat } from "../server/acties";
import type { Bericht } from "../server/queries";

const BEGIN: BerichtResultaat = { status: "idle" };

function tijdstip(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Gesprek({ berichten }: { berichten: Bericht[] }) {
  const [resultaat, actie] = useActionState(verstuurBericht, BEGIN);
  const formRef = useRef<HTMLFormElement>(null);
  const onderkant = useRef<HTMLDivElement>(null);

  // Leegmaken en naar beneden scrollen zodra een bericht verstuurd is.
  useEffect(() => {
    if (resultaat.status === "gelukt") {
      formRef.current?.reset();
      onderkant.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [resultaat]);

  return (
    <div className="space-y-6">
      {berichten.length === 0 ? (
        <p className="text-muted">
          Nog geen berichten. Stel gerust je vraag — we lezen mee en reageren
          meestal binnen twee werkdagen.
        </p>
      ) : (
        <ol className="space-y-4">
          {berichten.map((bericht) => (
            <li
              key={bericht.id}
              className={cn(
                "flex",
                bericht.vanKlant ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 sm:max-w-[70%]",
                  bericht.vanKlant
                    ? "bg-primary text-primary-foreground"
                    : "border border-line bg-white",
                )}
              >
                <p className="whitespace-pre-wrap">{bericht.body}</p>
                <p
                  className={cn(
                    "mt-1.5 text-xs",
                    bericht.vanKlant ? "text-cream/70" : "text-muted",
                  )}
                >
                  {bericht.vanKlant ? "Jij" : "YogaCompany"} ·{" "}
                  {tijdstip(bericht.verstuurdOp)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div ref={onderkant} />

      <form ref={formRef} action={actie} className="space-y-3">
        <label htmlFor="body" className="sr-only">
          Je bericht
        </label>
        <Textarea
          id="body"
          name="body"
          rows={4}
          required
          placeholder="Schrijf je bericht…"
        />

        {resultaat.status === "fout" ? (
          <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
        ) : null}

        <SubmitButton bezigLabel="Versturen…">Verstuur bericht</SubmitButton>
      </form>
    </div>
  );
}
