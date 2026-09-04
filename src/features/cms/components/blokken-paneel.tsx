"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, EyeOff, Search, X } from "lucide-react";

import type { Json } from "@/lib/supabase/types";

import { groepeerInSecties } from "../secties";
import { BlokBewerker } from "./blok-bewerker";

/**
 * De blokken van een pagina, gegroepeerd in secties.
 *
 * De startpagina heeft negenendertig blokken. Die stonden onder elkaar in één
 * kolom: geen kopjes, geen zoekveld, geen manier om te zien waar je gebleven
 * was. Iets terugvinden was scrollen en lezen.
 *
 * Drie dingen lossen dat op, en ze werken alleen samen:
 *
 *  - **Secties, standaard dicht.** Je ziet twaalf regels in plaats van
 *    negenendertig kaarten, en je opent wat je nodig hebt.
 *  - **Zoeken op inhoud.** Niet alleen op de omschrijving van een blok, maar
 *    ook op wat erin staat. Je herinnert je meestal de zin, niet de veldnaam.
 *  - **Filteren op wat af moet.** "Alleen wijzigingen" is het antwoord op de
 *    vraag waarmee je terugkomt na een onderbreking.
 *
 * Zoeken en filteren klappen secties vanzelf open: een dichte sectie met een
 * treffer erin zou een zoekresultaat zijn dat je niet kunt zien.
 */

type Blok = {
  pageKey: string;
  blockKey: string;
  kind: "text" | "richtext" | "image" | "video";
  omschrijving: string;
  gepubliceerd: Json;
  concept: Json | null;
  heeftConcept: boolean;
  verbergbaar: boolean;
  zichtbaar: boolean;
  zichtbaarNaPubliceren: boolean;
  standaardLink: string | null;
  lijst: {
    max: number;
    itemNaam: string;
    sjabloon: Record<string, string>;
  } | null;
};

type Filter = "alles" | "wijzigingen" | "verborgen" | "beeld";

/** Alle tekst in een blok, zodat het zoekveld ook op inhoud kan zoeken. */
function doorzoekbaar(blok: Blok): string {
  const stukken = [blok.omschrijving, blok.blockKey];

  for (const waarde of [blok.concept, blok.gepubliceerd]) {
    if (waarde && typeof waarde === "object") {
      // Bewust plat: een blok kan tekst, html of een lijst met items bevatten,
      // en het maakt voor zoeken niet uit welke vorm dat is.
      stukken.push(JSON.stringify(waarde));
    }
  }

  return stukken.join(" ").toLowerCase();
}

export function BlokkenPaneel({ blokken }: { blokken: Blok[] }) {
  const [zoek, setZoek] = useState("");
  const [filter, setFilter] = useState<Filter>("alles");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [gemarkeerd, setGemarkeerd] = useState<string | null>(null);
  const verwijzingen = useRef(new Map<string, HTMLDivElement | null>());

  const secties = useMemo(() => groepeerInSecties(blokken), [blokken]);

  const term = zoek.trim().toLowerCase();
  const zoekt = term.length > 0;
  const filtert = filter !== "alles";

  const past = useCallback(
    (blok: Blok) => {
      if (zoekt && !doorzoekbaar(blok).includes(term)) return false;
      if (filter === "wijzigingen") return blok.heeftConcept;
      if (filter === "verborgen") return !blok.zichtbaar;
      if (filter === "beeld") return blok.kind === "image";
      return true;
    },
    [filter, term, zoekt],
  );

  const zichtbareSecties = useMemo(
    () =>
      secties
        .map((sectie) => ({ ...sectie, treffers: sectie.blokken.filter(past) }))
        .filter((sectie) => sectie.treffers.length > 0),
    [secties, past],
  );

  /**
   * Een blok aanwijzen: de sectie eromheen openen, ernaartoe scrollen en hem
   * even laten oplichten. Wordt aangeroepen vanuit de voorvertoning hiernaast.
   */
  const wijsAan = useCallback((sectieSleutel: string) => {
    setZoek("");
    setFilter("alles");
    setOpen((vorig) => new Set(vorig).add(sectieSleutel));
    setGemarkeerd(sectieSleutel);

    // Wachten tot de sectie is opengeklapt, anders scrollen we naar een
    // element dat nog geen hoogte heeft.
    requestAnimationFrame(() => {
      verwijzingen.current
        .get(sectieSleutel)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    function ontvang(bericht: MessageEvent) {
      // Alleen berichten van de voorvertoning op deze site; alles van elders
      // negeren we, ook al staat de header dat toch al niet toe.
      if (bericht.origin !== window.location.origin) return;
      const data = bericht.data as { type?: string; sectie?: string };
      if (data?.type !== "yc-blok-aangewezen" || !data.sectie) return;
      wijsAan(data.sectie);
    }

    window.addEventListener("message", ontvang);
    return () => window.removeEventListener("message", ontvang);
  }, [wijsAan]);

  useEffect(() => {
    if (!gemarkeerd) return;
    const tijd = setTimeout(() => setGemarkeerd(null), 2000);
    return () => clearTimeout(tijd);
  }, [gemarkeerd]);

  const aantalWijzigingen = blokken.filter((b) => b.heeftConcept).length;
  const aantalVerborgen = blokken.filter((b) => !b.zichtbaar).length;
  const aantalBeeld = blokken.filter((b) => b.kind === "image").length;

  const filters: { sleutel: Filter; label: string; aantal: number }[] = [
    { sleutel: "alles", label: "Alles", aantal: blokken.length },
    {
      sleutel: "wijzigingen",
      label: "Alleen wijzigingen",
      aantal: aantalWijzigingen,
    },
    { sleutel: "verborgen", label: "Verborgen", aantal: aantalVerborgen },
    { sleutel: "beeld", label: "Beeld", aantal: aantalBeeld },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <label htmlFor="blok-zoek" className="sr-only">
          Zoek in de blokken van deze pagina
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            id="blok-zoek"
            type="search"
            value={zoek}
            onChange={(event) => setZoek(event.target.value)}
            placeholder="Zoek op een woord of een zin die je zag staan…"
            className="h-11 w-full rounded-lg border border-line-strong bg-background pr-3 pl-9 text-[0.975rem]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((knop) => (
          <button
            key={knop.sleutel}
            type="button"
            onClick={() => setFilter(knop.sleutel)}
            aria-pressed={filter === knop.sleutel}
            disabled={knop.aantal === 0 && knop.sleutel !== "alles"}
            className={[
              "rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-40",
              filter === knop.sleutel
                ? "bg-accent-wash border-accent font-semibold"
                : "border-line hover:bg-hover",
            ].join(" ")}
          >
            {knop.label} ({knop.aantal})
          </button>
        ))}
      </div>

      {zichtbareSecties.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
          Niets gevonden. Probeer een ander woord, of zet het filter op Alles.
        </p>
      ) : null}

      {zoekt || filtert ? (
        <p className="text-sm text-muted" aria-live="polite">
          {zichtbareSecties.reduce((som, s) => som + s.treffers.length, 0)} van{" "}
          {blokken.length} blokken
          {zoekt ? ` met “${zoek.trim()}”` : ""}
          {" · "}
          <button
            type="button"
            onClick={() => {
              setZoek("");
              setFilter("alles");
            }}
            className="underline underline-offset-2 hover:no-underline"
          >
            <X
              className="mr-0.5 inline size-3.5 align-text-bottom"
              aria-hidden
            />
            wissen
          </button>
        </p>
      ) : null}

      <div className="space-y-2">
        {zichtbareSecties.map((sectie) => {
          // Tijdens zoeken of filteren staat alles open: een dichte sectie met
          // een treffer erin is een resultaat dat je niet kunt zien.
          const isOpen = zoekt || filtert || open.has(sectie.sleutel);
          const wijzigingen = sectie.treffers.filter(
            (b) => b.heeftConcept,
          ).length;
          const verborgen = sectie.treffers.filter((b) => !b.zichtbaar).length;

          return (
            <div
              key={sectie.sleutel}
              ref={(element) => {
                verwijzingen.current.set(sectie.sleutel, element);
              }}
              className={[
                "scroll-mt-24 rounded-[var(--radius-card)] border transition-colors",
                gemarkeerd === sectie.sleutel
                  ? "bg-accent-wash border-accent"
                  : "border-line",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() =>
                  setOpen((vorig) => {
                    const nieuw = new Set(vorig);
                    if (nieuw.has(sectie.sleutel)) nieuw.delete(sectie.sleutel);
                    else nieuw.add(sectie.sleutel);
                    return nieuw;
                  })
                }
                aria-expanded={isOpen}
                disabled={zoekt || filtert}
                className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold disabled:cursor-default"
              >
                {isOpen ? (
                  <ChevronDown
                    className="size-4 shrink-0 text-muted"
                    aria-hidden
                  />
                ) : (
                  <ChevronRight
                    className="size-4 shrink-0 text-muted"
                    aria-hidden
                  />
                )}
                <span className="flex-1">{sectie.naam}</span>

                {wijzigingen > 0 ? (
                  <span
                    className="size-2 shrink-0 rounded-full bg-accent"
                    title={`${wijzigingen} onpubliceerde ${wijzigingen === 1 ? "wijziging" : "wijzigingen"}`}
                  />
                ) : null}
                {verborgen > 0 ? (
                  <EyeOff className="size-4 shrink-0 text-muted" aria-hidden />
                ) : null}
                <span className="shrink-0 text-sm font-normal text-muted tabular-nums">
                  {sectie.treffers.length}
                  {sectie.treffers.length !== sectie.blokken.length
                    ? ` van ${sectie.blokken.length}`
                    : ""}
                </span>
              </button>

              {isOpen ? (
                <div className="space-y-3 border-t border-line px-4 py-4">
                  {sectie.treffers.map((blok) => (
                    <BlokBewerker
                      key={blok.blockKey}
                      pageKey={blok.pageKey}
                      blockKey={blok.blockKey}
                      kind={blok.kind}
                      omschrijving={blok.omschrijving}
                      gepubliceerd={blok.gepubliceerd}
                      concept={blok.concept}
                      verbergbaar={blok.verbergbaar}
                      zichtbaarNaPubliceren={blok.zichtbaarNaPubliceren}
                      lijst={blok.lijst}
                      standaardLink={blok.standaardLink}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
