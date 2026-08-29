"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { bloktype, TOE_TE_VOEGEN } from "@/content/docent-blokken";
import {
  publiceerPagina,
  verplaatsBlok,
  verwijderBlok,
  voegBlokToe,
  zetZichtbaar,
  type PaginaResultaat,
} from "../server/acties";
import type { Blok } from "../server/queries";
import { BlokFormulier } from "./blok-formulier";

const BEGIN: PaginaResultaat = { status: "idle" };

/**
 * De blokken van de eigen pagina, op volgorde.
 *
 * Verplaatsen gaat met pijltjes en een zichtbaar volgnummer, en niet met
 * slepen. Slepen is aardig op een muis en onbruikbaar met een toetsenbord of
 * op een telefoon; deze knoppen werken overal. Wil je slepen erbij, dan komt
 * het bovenop deze knoppen en niet ervoor in de plaats.
 */
function KleineKnop({
  actie,
  blokId,
  extra,
  titel,
  children,
}: {
  actie: (
    vorige: PaginaResultaat,
    formData: FormData,
  ) => Promise<PaginaResultaat>;
  blokId: string;
  extra?: Record<string, string>;
  titel: string;
  children: React.ReactNode;
}) {
  const [, verzend] = useActionState(actie, BEGIN);

  return (
    <form action={verzend} className="contents">
      <input type="hidden" name="blok_id" value={blokId} />
      {Object.entries(extra ?? {}).map(([naam, waarde]) => (
        <input key={naam} type="hidden" name={naam} value={waarde} />
      ))}
      <button
        type="submit"
        title={titel}
        aria-label={titel}
        className="inline-flex size-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-green hover:text-green"
      >
        {children}
      </button>
    </form>
  );
}

export function PaginaEditor({
  blokken,
  fotos,
  magBewerken,
}: {
  blokken: Blok[];
  fotos: { url: string; bestandsnaam: string }[];
  magBewerken: boolean;
}) {
  const [publicatie, publiceer] = useActionState(publiceerPagina, BEGIN);
  const [toevoeging, voegToe] = useActionState(voegBlokToe, BEGIN);

  const openstaand = blokken.filter((b) => b.heeftConcept).length;
  const zichtbaar = blokken.filter((b) => !b.verwijderdInConcept);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-background px-5 py-4">
        <p className="text-sm">
          {openstaand === 0 ? (
            <span className="text-muted">Alles is gepubliceerd.</span>
          ) : (
            <span className="font-semibold text-error">
              {openstaand} {openstaand === 1 ? "wijziging" : "wijzigingen"} nog
              niet gepubliceerd
            </span>
          )}
        </p>

        {magBewerken ? (
          <form action={publiceer}>
            <SubmitButton bezigLabel="Publiceren…" disabled={openstaand === 0}>
              Publiceren
            </SubmitButton>
          </form>
        ) : null}
      </div>

      {publicatie.status === "gelukt" ? (
        <FormMessage variant="gelukt">{publicatie.bericht}</FormMessage>
      ) : null}
      {publicatie.status === "fout" ? (
        <FormMessage variant="fout">{publicatie.bericht}</FormMessage>
      ) : null}

      <ul className="space-y-3">
        {zichtbaar.map((blok, index) => {
          const definitie = bloktype(blok.type);
          if (!definitie) return null;

          const verankerd = definitie.verankerd === true;

          return (
            <li
              key={blok.id}
              className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-background"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  {magBewerken && !verankerd ? (
                    <KleineKnop
                      actie={verplaatsBlok}
                      blokId={blok.id}
                      extra={{ richting: "omhoog" }}
                      titel="Een plaats omhoog"
                    >
                      <ArrowUp className="size-4" />
                    </KleineKnop>
                  ) : null}

                  <span className="text-xs text-muted tabular-nums">
                    {index + 1}
                  </span>

                  {magBewerken && !verankerd ? (
                    <KleineKnop
                      actie={verplaatsBlok}
                      blokId={blok.id}
                      extra={{ richting: "omlaag" }}
                      titel="Een plaats omlaag"
                    >
                      <ArrowDown className="size-4" />
                    </KleineKnop>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{definitie.naam}</h2>

                    {definitie.vast ? (
                      <span className="rounded-full bg-sand-light px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#7a5220]">
                        vaste inhoud
                      </span>
                    ) : null}
                    {verankerd ? (
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.7rem] font-semibold text-green-dark">
                        staat vast bovenaan
                      </span>
                    ) : null}
                    {!blok.zichtbaar ? (
                      <span className="rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] font-semibold text-muted">
                        verborgen
                      </span>
                    ) : null}
                    {blok.volgorde === null ? (
                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.7rem] font-semibold text-green-dark">
                        nog niet online
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {definitie.omschrijving}
                  </p>
                </div>

                {magBewerken && !verankerd ? (
                  <div className="flex items-center gap-1.5">
                    <KleineKnop
                      actie={zetZichtbaar}
                      blokId={blok.id}
                      extra={{ zichtbaar: blok.zichtbaar ? "nee" : "ja" }}
                      titel={blok.zichtbaar ? "Verbergen" : "Weer tonen"}
                    >
                      {blok.zichtbaar ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </KleineKnop>
                    <KleineKnop
                      actie={verwijderBlok}
                      blokId={blok.id}
                      titel="Weghalen"
                    >
                      <Trash2 className="size-4" />
                    </KleineKnop>
                  </div>
                ) : null}
              </div>

              {magBewerken ? (
                <details className="group">
                  <summary className="cursor-pointer list-none border-t border-line px-4 py-2.5 text-sm font-semibold text-green marker:content-none hover:bg-hover [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Bewerken</span>
                    <span className="hidden group-open:inline">Sluiten</span>
                  </summary>
                  <BlokFormulier
                    blokId={blok.id}
                    definitie={definitie}
                    waarde={blok.inhoud}
                    fotos={fotos}
                  />
                </details>
              ) : null}
            </li>
          );
        })}
      </ul>

      {magBewerken ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-background p-5">
          <h2 className="text-lg">Blok toevoegen</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Nieuwe blokken komen onderaan. Verplaats ze daarna waar je ze hebben
            wilt.
          </p>

          {toevoeging.status === "gelukt" ? (
            <FormMessage variant="gelukt">{toevoeging.bericht}</FormMessage>
          ) : null}
          {toevoeging.status === "fout" ? (
            <FormMessage variant="fout">{toevoeging.bericht}</FormMessage>
          ) : null}

          <form action={voegToe} className="mt-3 flex flex-wrap gap-3">
            <label htmlFor="nieuw-blok" className="sr-only">
              Soort blok
            </label>
            <select
              id="nieuw-blok"
              name="type"
              className="h-11 min-w-56 rounded-lg border border-line-strong bg-background px-3"
            >
              {TOE_TE_VOEGEN.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.naam}
                </option>
              ))}
            </select>
            <SubmitButton variant="ghost" bezigLabel="Toevoegen…">
              Toevoegen
            </SubmitButton>
          </form>
        </div>
      ) : null}
    </div>
  );
}
