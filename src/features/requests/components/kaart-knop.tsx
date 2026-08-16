"use client";

import { useActionState } from "react";
import Link from "next/link";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { vraagKaartAan, type KaartResultaat } from "../server/strippenkaart";

const BEGIN: KaartResultaat = { status: "idle" };

/**
 * Bevestigt de aanvraag van een strippenkaart.
 *
 * Alleen de plaats in de lijst gaat mee; de naam en de prijs leest de server
 * zelf op. Wat de bezoeker hier ook zou meesturen, het bedrag op de aanvraag
 * blijft wat er op de tarievenpagina staat.
 */
export function KaartKnop({ index }: { index: number }) {
  const [resultaat, actie] = useActionState(vraagKaartAan, BEGIN);

  if (resultaat.status === "aangevraagd") {
    return (
      <div className="space-y-5">
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/portaal/aanvragen"
            className="inline-flex h-11 items-center rounded-lg bg-green px-5 font-semibold text-cream transition-colors hover:bg-green-dark"
          >
            Naar mijn aanvragen
          </Link>
          <Link
            href="/lessen"
            className="inline-flex h-11 items-center rounded-lg border border-green px-5 font-semibold text-green transition-colors hover:bg-cream"
          >
            Terug naar het rooster
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="kaart" value={index} />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton
        size="lg"
        className="w-full"
        bezigLabel="Aanvraag versturen…"
      >
        Aanvraag versturen
      </SubmitButton>

      <p className="text-sm text-muted">
        Je vraagt de kaart hier aan; betalen doe je later. We nemen binnen twee
        werkdagen contact met je op om dat af te spreken. Je zit nergens aan
        vast.
      </p>
    </form>
  );
}
