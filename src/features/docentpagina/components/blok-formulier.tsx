"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { RichtextEditor } from "@/components/ui/richtext-editor";
import { SubmitButton } from "@/components/ui/submit-button";
import { MAX_FOTOS_IN_REEKS, type Bloktype } from "@/content/docent-blokken";
import { FocusKiezer } from "@/components/ui/focus-kiezer";
import { MIDDEN } from "@/lib/beeldfocus";
import { bewaarBlok, type PaginaResultaat } from "../server/acties";

const BEGIN: PaginaResultaat = { status: "idle" };

type Waarde = Record<string, unknown>;

/**
 * De velden van één blok.
 *
 * Welke velden er zijn komt uit de catalogus in code; de waarden komen uit de
 * database. Bij een blok dat zijn inhoud uit de database haalt zijn alleen de
 * kop en de instellingen te typen — dat staat er ook bij, want anders zoekt
 * iemand tien minuten naar het invoerveld voor zijn prijzen.
 */
export function BlokFormulier({
  blokId,
  definitie,
  waarde,
  fotos,
}: {
  blokId: string;
  definitie: Bloktype;
  waarde: Waarde;
  fotos: { url: string; bestandsnaam: string }[];
}) {
  const [resultaat, actie] = useActionState(bewaarBlok, BEGIN);
  const [inhoud, setInhoud] = useState<Waarde>(waarde);

  const zet = (naam: string, nieuw: unknown) =>
    setInhoud((vorig) => ({ ...vorig, [naam]: nieuw }));

  const tekst = (naam: string) =>
    typeof inhoud[naam] === "string" ? (inhoud[naam] as string) : "";

  const beeld = (naam: string) =>
    (inhoud[naam] as
      { url?: string; alt?: string; focus?: string } | undefined) ?? {
      url: "",
      alt: "",
    };

  const rijen = (naam: string) =>
    Array.isArray(inhoud[naam])
      ? (inhoud[naam] as Record<string, string>[])
      : [];

  const reeks = (naam: string) =>
    Array.isArray(inhoud[naam])
      ? (inhoud[naam] as { url?: string; alt?: string }[])
      : [];

  const zetInReeks = (
    naam: string,
    index: number,
    nieuw: { url: string; alt: string },
  ) =>
    zet(
      naam,
      reeks(naam).map((foto, i) => (i === index ? nieuw : foto)),
    );

  return (
    <form action={actie} className="space-y-4 border-t border-line px-4 py-5">
      <input type="hidden" name="blok_id" value={blokId} />
      <input type="hidden" name="inhoud" value={JSON.stringify(inhoud)} />

      {definitie.vast ? (
        <p className="rounded-lg border border-sand bg-cream px-4 py-3 text-sm">
          <strong>Deze inhoud komt uit de database.</strong> Je kunt hem
          verplaatsen en verbergen, en de kop erboven aanpassen, maar niet typen
          wat erin staat.{" "}
          {definitie.type === "wat_het_kost"
            ? "De prijzen zijn die van de studio."
            : "Je lessen verschijnen vanzelf, met het aantal vrije plekken erbij."}
        </p>
      ) : null}

      {definitie.velden.map((veld) => (
        <div key={veld.naam}>
          <Label htmlFor={`${blokId}-${veld.naam}`}>{veld.label}</Label>

          {veld.soort === "regel" ? (
            <Input
              id={`${blokId}-${veld.naam}`}
              value={tekst(veld.naam)}
              onChange={(e) => zet(veld.naam, e.target.value)}
            />
          ) : null}

          {veld.soort === "tekst" ? (
            <Textarea
              id={`${blokId}-${veld.naam}`}
              rows={3}
              value={tekst(veld.naam)}
              onChange={(e) => zet(veld.naam, e.target.value)}
            />
          ) : null}

          {veld.soort === "richtext" ? (
            <RichtextEditor
              waarde={tekst(veld.naam)}
              onWijzig={(html) => zet(veld.naam, html)}
            />
          ) : null}

          {veld.soort === "beeld" ? (
            <div className="space-y-2">
              <select
                id={`${blokId}-${veld.naam}`}
                value={beeld(veld.naam).url ?? ""}
                onChange={(e) =>
                  // Een andere foto begint weer in het midden: de uitsnede van
                  // de vorige zegt niets over deze.
                  zet(veld.naam, {
                    url: e.target.value,
                    alt: beeld(veld.naam).alt ?? "",
                    focus: MIDDEN,
                  })
                }
                className="h-11 w-full rounded-lg border border-line-strong bg-background px-3"
              >
                <option value="">Geen foto</option>
                {fotos.map((foto) => (
                  <option key={foto.url} value={foto.url}>
                    {foto.bestandsnaam}
                  </option>
                ))}
              </select>
              <Input
                aria-label="Wat er op de foto te zien is"
                placeholder="Wat er op de foto te zien is"
                value={beeld(veld.naam).alt ?? ""}
                onChange={(e) =>
                  zet(veld.naam, {
                    url: beeld(veld.naam).url ?? "",
                    alt: e.target.value,
                    focus: beeld(veld.naam).focus,
                  })
                }
              />
              <p className="text-xs text-muted">
                De omschrijving wordt voorgelezen aan wie de foto niet ziet, en
                verschijnt als de foto niet laadt.
              </p>
              {beeld(veld.naam).url ? (
                <FocusKiezer
                  url={beeld(veld.naam).url ?? ""}
                  alt={beeld(veld.naam).alt ?? ""}
                  focus={beeld(veld.naam).focus}
                  onWijzig={(nieuw) =>
                    zet(veld.naam, {
                      url: beeld(veld.naam).url ?? "",
                      alt: beeld(veld.naam).alt ?? "",
                      focus: nieuw,
                    })
                  }
                />
              ) : null}
            </div>
          ) : null}

          {veld.soort === "beeldreeks" ? (
            <div className="space-y-3">
              {reeks(veld.naam).map((foto, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-line p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Foto {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        zet(
                          veld.naam,
                          reeks(veld.naam).filter((_, i) => i !== index),
                        )
                      }
                    >
                      Weghalen
                    </Button>
                  </div>
                  <select
                    aria-label={`Foto ${index + 1}`}
                    value={foto.url ?? ""}
                    onChange={(e) =>
                      zetInReeks(veld.naam, index, {
                        url: e.target.value,
                        alt: foto.alt ?? "",
                      })
                    }
                    className="h-11 w-full rounded-lg border border-line-strong bg-background px-3"
                  >
                    <option value="">Kies een foto</option>
                    {fotos.map((keuze) => (
                      <option key={keuze.url} value={keuze.url}>
                        {keuze.bestandsnaam}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label={`Wat er op foto ${index + 1} te zien is`}
                    placeholder="Wat er op deze foto te zien is"
                    value={foto.alt ?? ""}
                    onChange={(e) =>
                      zetInReeks(veld.naam, index, {
                        url: foto.url ?? "",
                        alt: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              {reeks(veld.naam).length < MAX_FOTOS_IN_REEKS ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    zet(veld.naam, [...reeks(veld.naam), { url: "", alt: "" }])
                  }
                >
                  Foto toevoegen
                </Button>
              ) : (
                <p className="text-xs text-muted">
                  Zes is het maximum. Meer naast elkaar wordt te klein om iets
                  op te zien, en de pagina laadt er traag van.
                </p>
              )}

              <p className="text-xs text-muted">
                Staan hier geen foto&apos;s in de keuzelijst? Voeg ze eerst toe
                aan je beeldbank, onderaan deze pagina.
              </p>
            </div>
          ) : null}

          {veld.soort === "lijst" && veld.velden ? (
            <div className="space-y-3">
              <ul className="space-y-3">
                {(Array.isArray(inhoud[veld.naam])
                  ? (inhoud[veld.naam] as Record<string, string>[])
                  : []
                ).map((item, index) => (
                  <li key={index} className="rounded-lg border border-line p-3">
                    {veld.velden!.map((sub) => (
                      <div key={sub.naam} className="mt-2 first:mt-0">
                        <Label
                          htmlFor={`${blokId}-${veld.naam}-${index}-${sub.naam}`}
                        >
                          {sub.label}
                        </Label>
                        {sub.soort === "tekst" ? (
                          <Textarea
                            id={`${blokId}-${veld.naam}-${index}-${sub.naam}`}
                            rows={2}
                            value={item[sub.naam] ?? ""}
                            onChange={(e) => {
                              const lijst = [
                                ...(inhoud[veld.naam] as Record<
                                  string,
                                  string
                                >[]),
                              ];
                              lijst[index] = {
                                ...item,
                                [sub.naam]: e.target.value,
                              };
                              zet(veld.naam, lijst);
                            }}
                          />
                        ) : (
                          <Input
                            id={`${blokId}-${veld.naam}-${index}-${sub.naam}`}
                            value={item[sub.naam] ?? ""}
                            onChange={(e) => {
                              const lijst = [
                                ...(inhoud[veld.naam] as Record<
                                  string,
                                  string
                                >[]),
                              ];
                              lijst[index] = {
                                ...item,
                                [sub.naam]: e.target.value,
                              };
                              zet(veld.naam, lijst);
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {veld.lijst && rijen(veld.naam).length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          zet(
                            veld.naam,
                            rijen(veld.naam).filter((_, i) => i !== index),
                          )
                        }
                      >
                        Weghalen
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>

              {veld.lijst && rijen(veld.naam).length < veld.lijst.max ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    zet(veld.naam, [
                      ...rijen(veld.naam),
                      Object.fromEntries(
                        veld.velden!.map((sub) => [sub.naam, ""]),
                      ),
                    ])
                  }
                >
                  {veld.lijst.itemNaam.charAt(0).toUpperCase() +
                    veld.lijst.itemNaam.slice(1)}{" "}
                  toevoegen
                </Button>
              ) : null}
            </div>
          ) : null}

          {veld.hulp ? (
            <p className="mt-1 text-xs text-muted">{veld.hulp}</p>
          ) : null}
        </div>
      ))}

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton size="sm" bezigLabel="Opslaan…">
          Opslaan als concept
        </SubmitButton>
        <span className="text-sm text-muted">
          Je bezoekers zien dit pas als je publiceert.
        </span>
      </div>
    </form>
  );
}
