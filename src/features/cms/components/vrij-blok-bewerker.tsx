"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { RichtextEditor } from "@/components/ui/richtext-editor";
import { bloktype } from "@/content/vrije-blokken";

import {
  bewaarVrijBlok,
  verplaatsVrijBlok,
  verwijderVrijBlok,
  zetVrijBlokZichtbaar,
  type VrijBlokResultaat,
} from "../server/vrije-blokken-acties";
import { BeeldKiezer } from "./beeld-kiezer";
import { LinkVeld } from "./link-veld";

/**
 * Eén vrij blok bewerken.
 *
 * De knoppen om te verplaatsen, te verbergen en weg te halen staan in de kop,
 * niet onderaan bij Opslaan: je gebruikt ze zonder het blok open te klappen, en
 * ze hebben ook niets met opslaan te maken. Wat je in de velden typt gaat pas
 * weg als je op Opslaan drukt, en dan nog alleen als concept.
 */
export function VrijBlokBewerker({
  pageKey,
  blok,
  eerste,
  laatste,
}: {
  pageKey: string;
  blok: {
    id: string;
    type: string;
    inhoud: Record<string, unknown>;
    conceptInhoud: Record<string, unknown> | null;
    zichtbaar: boolean;
    conceptVerwijderd: boolean;
    heeftConcept: boolean;
  };
  eerste: boolean;
  laatste: boolean;
}) {
  const definitie = bloktype(blok.type);
  const [inhoud, setInhoud] = useState<Record<string, unknown>>(
    blok.conceptInhoud ?? blok.inhoud,
  );
  const [open, setOpen] = useState(false);
  const [melding, setMelding] = useState<VrijBlokResultaat>({ status: "idle" });
  const [bezig, startOvergang] = useTransition();

  if (!definitie) return null;

  function voerUit(handeling: () => Promise<VrijBlokResultaat>) {
    startOvergang(async () => setMelding(await handeling()));
  }

  function bewaar() {
    const formData = new FormData();
    formData.set("id", blok.id);
    formData.set("pageKey", pageKey);
    formData.set("inhoud", JSON.stringify(inhoud));
    voerUit(() => bewaarVrijBlok({ status: "idle" }, formData));
  }

  const zet = (veld: string, waarde: unknown) =>
    setInhoud((vorig) => ({ ...vorig, [veld]: waarde }));

  const alsTekst = (veld: string) =>
    typeof inhoud[veld] === "string" ? (inhoud[veld] as string) : "";

  const alsBeeld = (veld: string) =>
    (inhoud[veld] as
      | { url?: string; alt?: string; focus?: string; layout?: string }
      | undefined) ?? {};

  return (
    <div
      className={[
        "rounded-[var(--radius-card)] border",
        blok.conceptVerwijderd ? "border-error/50 opacity-60" : "border-line",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((vorig) => !vorig)}
          aria-expanded={open}
          className="flex-1 text-left font-semibold"
        >
          {definitie.naam}
          {blok.conceptVerwijderd ? (
            <span className="ml-2 text-sm font-normal text-error">
              verdwijnt bij publiceren
            </span>
          ) : blok.heeftConcept ? (
            <span className="ml-2 text-sm font-normal text-accent">
              gewijzigd
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-1">
          <IconKnop
            titel="Een plaats omhoog"
            uit={eerste || bezig}
            onKlik={() =>
              voerUit(() => verplaatsVrijBlok(pageKey, blok.id, "omhoog"))
            }
          >
            <ChevronUp className="size-4" aria-hidden />
          </IconKnop>
          <IconKnop
            titel="Een plaats omlaag"
            uit={laatste || bezig}
            onKlik={() =>
              voerUit(() => verplaatsVrijBlok(pageKey, blok.id, "omlaag"))
            }
          >
            <ChevronDown className="size-4" aria-hidden />
          </IconKnop>
          <IconKnop
            titel={blok.zichtbaar ? "Verbergen op de site" : "Weer tonen"}
            uit={bezig}
            onKlik={() =>
              voerUit(() =>
                zetVrijBlokZichtbaar(pageKey, blok.id, !blok.zichtbaar),
              )
            }
          >
            {blok.zichtbaar ? (
              <Eye className="size-4" aria-hidden />
            ) : (
              <EyeOff className="size-4" aria-hidden />
            )}
          </IconKnop>
          <IconKnop
            titel="Dit blok weghalen"
            uit={bezig || blok.conceptVerwijderd}
            onKlik={() => voerUit(() => verwijderVrijBlok(pageKey, blok.id))}
          >
            <Trash2 className="size-4" aria-hidden />
          </IconKnop>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-line px-4 py-4">
          {definitie.velden.map((veld) => {
            const id = `${blok.id}-${veld.naam}`;

            if (veld.soort === "beeld") {
              const huidig = alsBeeld(veld.naam);
              return (
                <div key={veld.naam}>
                  <Label>{veld.label}</Label>
                  <BeeldKiezer
                    id={id}
                    url={huidig.url ?? ""}
                    alt={huidig.alt ?? ""}
                    focus={huidig.focus}
                    layout={huidig.layout}
                    toonFocus
                    toonLayout={blok.type === "tekst_beeld"}
                    onWijzig={(nieuw) => zet(veld.naam, nieuw)}
                  />
                </div>
              );
            }

            if (veld.soort === "richtext") {
              return (
                <div key={veld.naam}>
                  <Label>{veld.label}</Label>
                  <RichtextEditor
                    waarde={alsTekst(veld.naam)}
                    onWijzig={(html) => zet(veld.naam, html)}
                  />
                </div>
              );
            }

            if (veld.soort === "link") {
              return (
                <div key={veld.naam}>
                  <Label htmlFor={id}>{veld.label}</Label>
                  <LinkVeld
                    id={id}
                    waarde={alsTekst(veld.naam)}
                    terugval="/contact"
                    onWijzig={(nieuw) => zet(veld.naam, nieuw)}
                  />
                </div>
              );
            }

            return (
              <div key={veld.naam}>
                <Label htmlFor={id}>{veld.label}</Label>
                {veld.soort === "tekst" ? (
                  <Textarea
                    id={id}
                    rows={4}
                    value={alsTekst(veld.naam)}
                    onChange={(event) => zet(veld.naam, event.target.value)}
                  />
                ) : (
                  <Input
                    id={id}
                    value={alsTekst(veld.naam)}
                    onChange={(event) => zet(veld.naam, event.target.value)}
                  />
                )}
                {veld.hulp ? (
                  <p className="mt-1 text-sm text-muted">{veld.hulp}</p>
                ) : null}
              </div>
            );
          })}

          <Button type="button" onClick={bewaar} disabled={bezig} size="sm">
            {bezig ? "Bezig…" : "Opslaan"}
          </Button>
        </div>
      ) : null}

      {melding.status === "fout" ? (
        <div className="px-4 pb-4">
          <FormMessage variant="fout">{melding.bericht}</FormMessage>
        </div>
      ) : null}
      {melding.status === "gelukt" ? (
        <p className="px-4 pb-3 text-sm text-success" aria-live="polite">
          {melding.bericht}
        </p>
      ) : null}
    </div>
  );
}

function IconKnop({
  titel,
  uit,
  onKlik,
  children,
}: {
  titel: string;
  uit: boolean;
  onKlik: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      disabled={uit}
      title={titel}
      aria-label={titel}
      className="rounded-lg border border-line p-2 transition-colors hover:bg-hover disabled:opacity-40"
    >
      {children}
    </button>
  );
}
