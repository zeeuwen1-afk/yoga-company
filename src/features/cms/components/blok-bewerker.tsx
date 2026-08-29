"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { RichtextEditor } from "@/components/ui/richtext-editor";
import type { Json } from "@/lib/supabase/types";

import { BeeldKiezer } from "./beeld-kiezer";
import { bewaarConcept, zetZichtbaarheid } from "../server/editor-acties";

/**
 * Eén bewerkbaar blok in de site-editor (BOUWPROMPT §14).
 *
 * Welk invoerveld je krijgt, hangt af van het soort blok: een regel tekst, een
 * richtext-editor, een afbeelding met beschrijving, of een lijst met vaste
 * velden (testimonials, docenten, contactgegevens).
 */

type Waarde =
  | { text: string }
  | { html: string }
  | { url: string; alt: string }
  | { items: Record<string, string>[] };

function alsWaarde(json: Json | null): Waarde {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return json as unknown as Waarde;
  }
  return { text: "" };
}

/** Welke velden in een lijst een foto zijn, en dus een uploadknop krijgen. */
const IS_FOTOVELD = /^(foto|beeld|portret|afbeelding)$/;

function hoofdletter(woord: string) {
  return woord.charAt(0).toUpperCase() + woord.slice(1);
}

/** Labels voor de velden binnen een lijstblok. */
const VELD_LABEL: Record<string, string> = {
  titel: "Titel",
  tekst: "Tekst",
  citaat: "Citaat",
  naam: "Naam",
  rol: "Rol",
  bio: "Korte biografie",
  foto: "Foto",
  label: "Label",
  waarde: "Waarde",
  toelichting: "Toelichting",
  prijs: "Prijs",
  per_les: "Per les",
  geldig: "Geldigheid",
  uitgelicht: 'Uitgelicht als "meest gekozen"? (ja of leeg)',
  rail: "In het zijbalkje bij het rooster? (ja of leeg)",
  knop: "Tekst op de knop",
  href: "Waar de knop heen gaat, bijvoorbeeld /lessen",
};

export function BlokBewerker({
  pageKey,
  blockKey,
  kind,
  omschrijving,
  gepubliceerd,
  concept,
  verbergbaar = false,
  zichtbaarNaPubliceren = true,
  lijst = null,
}: {
  pageKey: string;
  blockKey: string;
  kind: "text" | "richtext" | "image" | "video";
  omschrijving: string;
  gepubliceerd: Json;
  concept: Json | null;
  /** Mag dit blok van de pagina worden weggenomen? */
  verbergbaar?: boolean;
  /** Staat het blok op de pagina zodra er gepubliceerd wordt? */
  zichtbaarNaPubliceren?: boolean;
  /** Alleen bij een lijstblok: de grens, de naam van één item en het sjabloon. */
  lijst?: {
    max: number;
    itemNaam: string;
    sjabloon: Record<string, string>;
  } | null;
}) {
  const beginwaarde = alsWaarde(concept ?? gepubliceerd);
  const [waarde, setWaarde] = useState<Waarde>(beginwaarde);
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  const gewijzigd = JSON.stringify(waarde) !== JSON.stringify(beginwaarde);

  function wisselZichtbaarheid() {
    setMelding(null);
    setFout(null);

    const formData = new FormData();
    formData.set("page_key", pageKey);
    formData.set("block_key", blockKey);
    formData.set("zichtbaar", zichtbaarNaPubliceren ? "nee" : "ja");

    startOvergang(async () => {
      const uitkomst = await zetZichtbaarheid({ status: "idle" }, formData);
      if (uitkomst.status === "fout") {
        setFout(uitkomst.bericht);
        return;
      }
      if (uitkomst.status === "gelukt") setMelding(uitkomst.bericht);
      router.refresh();
    });
  }

  function opslaan() {
    setMelding(null);
    setFout(null);

    // Alt-tekst is verplicht zodra er een afbeelding staat (§18).
    if ("url" in waarde && waarde.url && !waarde.alt.trim()) {
      setFout("Vul eerst een beschrijving van de afbeelding in.");
      return;
    }

    const formData = new FormData();
    formData.set("page_key", pageKey);
    formData.set("block_key", blockKey);
    formData.set("waarde", JSON.stringify(waarde));

    startOvergang(async () => {
      const uitkomst = await bewaarConcept({ status: "idle" }, formData);
      if (uitkomst.status === "fout") {
        setFout(uitkomst.bericht);
        return;
      }
      setMelding("Opgeslagen als concept.");
      router.refresh();
    });
  }

  return (
    <div className="border-b border-line p-5 last:border-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{omschrijving}</p>
        <div className="flex flex-wrap items-center gap-2">
          {!zichtbaarNaPubliceren ? (
            <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
              Verborgen
            </span>
          ) : null}
          {concept !== null ? (
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-green-dark">
              Concept
            </span>
          ) : null}
          {verbergbaar ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={wisselZichtbaarheid}
              disabled={bezig}
            >
              {zichtbaarNaPubliceren
                ? "Van de pagina halen"
                : "Terug op de pagina"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Losse regel tekst -------------------------------------------------- */}
      {kind === "text" && "text" in waarde ? (
        <div>
          <Label htmlFor={`blok-${blockKey}`} className="sr-only">
            {omschrijving}
          </Label>
          {waarde.text.length > 90 ? (
            <Textarea
              id={`blok-${blockKey}`}
              rows={3}
              value={waarde.text}
              onChange={(event) => setWaarde({ text: event.target.value })}
            />
          ) : (
            <Input
              id={`blok-${blockKey}`}
              value={waarde.text}
              onChange={(event) => setWaarde({ text: event.target.value })}
            />
          )}
        </div>
      ) : null}

      {/* Richtext ------------------------------------------------------------ */}
      {kind === "richtext" && "html" in waarde ? (
        <RichtextEditor
          waarde={waarde.html}
          onWijzig={(html) => setWaarde({ html })}
        />
      ) : null}

      {/* Lijst met vaste velden --------------------------------------------- */}
      {"items" in waarde ? (
        <div className="space-y-4">
          <ul className="space-y-4">
            {waarde.items.map((item, index) => (
              <li key={index} className="rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-muted">
                    {lijst ? hoofdletter(lijst.itemNaam) : "Item"} {index + 1}
                  </p>
                  {lijst && waarde.items.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setWaarde({
                          items: waarde.items.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Weghalen
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {/* De volgorde komt uit de code en niet uit het opgeslagen
                      object: Postgres bewaart de sleutels van een jsonb-waarde
                      gesorteerd op lengte, waardoor "naam" onder "bio" belandt
                      en het formulier bij de biografie begint. */}
                  {(lijst
                    ? Object.keys(lijst.sjabloon)
                    : Object.keys(item)
                  ).map((veld) => {
                    const inhoud = item[veld] ?? "";
                    const wijzig = (nieuweWaarde: string) =>
                      setWaarde({
                        items: waarde.items.map((rij, i) =>
                          i === index ? { ...rij, [veld]: nieuweWaarde } : rij,
                        ),
                      });

                    // Een fotoveld krijgt de kiezer met uploadknop. De
                    // beschrijving voor schermlezers komt uit de naam ernaast,
                    // dus die vraagt hij hier niet nog eens.
                    if (IS_FOTOVELD.test(veld)) {
                      return (
                        <div key={veld}>
                          <Label>{VELD_LABEL[veld] ?? veld}</Label>
                          <BeeldKiezer
                            id={`${blockKey}-${index}-${veld}`}
                            url={inhoud}
                            alt={item.naam ?? item.titel ?? ""}
                            toonAlt={false}
                            onWijzig={({ url }) => wijzig(url)}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={veld}>
                        <Label htmlFor={`${blockKey}-${index}-${veld}`}>
                          {VELD_LABEL[veld] ?? veld}
                        </Label>
                        {inhoud.length > 90 ? (
                          <Textarea
                            id={`${blockKey}-${index}-${veld}`}
                            rows={3}
                            value={inhoud}
                            onChange={(event) => wijzig(event.target.value)}
                          />
                        ) : (
                          <Input
                            id={`${blockKey}-${index}-${veld}`}
                            value={inhoud}
                            onChange={(event) => wijzig(event.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          {lijst ? (
            waarde.items.length < lijst.max ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setWaarde({ items: [...waarde.items, { ...lijst.sjabloon }] })
                }
              >
                {hoofdletter(lijst.itemNaam)} toevoegen
              </Button>
            ) : (
              <p className="text-sm text-muted">
                Meer dan {lijst.max} passen hier niet; daarboven valt de opmaak
                uit elkaar.
              </p>
            )
          ) : null}
        </div>
      ) : null}

      {/* Afbeelding ---------------------------------------------------------- */}
      {kind === "image" && "url" in waarde ? (
        <BeeldKiezer
          url={waarde.url}
          alt={waarde.alt}
          onWijzig={(nieuw) => setWaarde(nieuw)}
        />
      ) : null}

      {melding ? (
        <p className="mt-3 text-sm text-success" aria-live="polite">
          {melding}
        </p>
      ) : null}
      {fout ? (
        <div className="mt-3">
          <FormMessage variant="fout">{fout}</FormMessage>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={opslaan}
          disabled={bezig || !gewijzigd}
        >
          {bezig ? "Opslaan…" : "Opslaan als concept"}
        </Button>

        {gewijzigd ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setWaarde(beginwaarde);
              setMelding(null);
              setFout(null);
            }}
          >
            Wijziging terugnemen
          </Button>
        ) : null}
      </div>
    </div>
  );
}
