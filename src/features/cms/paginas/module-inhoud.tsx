import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { Richtext, Sectie } from "@/components/layout/sectie";
import { CmsKnop } from "@/components/ui/cms-knop";

import { OpleidingGedeeld } from "./opleiding-gedeeld";
import { VrijeZone } from "./vrije-zone";
import type { Pagina } from "../server/queries";

/**
 * Eén modulepagina van de 200-uurs Yogaopleiding.
 *
 * Vier pagina's, één component: de opbouw is per module identiek en alleen de
 * inhoud verschilt. Vier losse componenten zouden na de eerste wijziging uit
 * elkaar gaan lopen.
 *
 * Elke pagina is zelfstandig leesbaar voor wie alleen deze module boekt. Daarom
 * staan de prijstabel en de praktische informatie er ook op; die komen uit
 * `OpleidingGedeeld` en zijn dus op alle pagina's dezelfde.
 */
export function ModuleInhoud({
  pagina,
  gedeeld,
}: {
  pagina: Pagina;
  /** De gedeelde blokken; die staan op een eigen paginasleutel. */
  gedeeld: Pagina;
}) {
  const beeld = pagina.beeld("beeld");

  return (
    <>
      <Sectie sectie="opening" achtergrond="creme">
        <div className="max-w-3xl">
          <nav aria-label="Kruimelpad" className="text-sm">
            <Link
              href="/opleidingen/200-uurs-yogaopleiding"
              className="inline-flex items-center gap-1.5 text-muted underline underline-offset-4 hover:no-underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              200-uurs Yogaopleiding
            </Link>
          </nav>

          {pagina.tekst("label") ? (
            <p className="mt-6 font-serif text-2xl text-accent">
              {pagina.tekst("label")}
            </p>
          ) : null}
          <h1 className="mt-2 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          {pagina.tekst("inleiding") ? (
            <p className="mt-4 text-muted">{pagina.tekst("inleiding")}</p>
          ) : null}
        </div>
      </Sectie>
      <VrijeZone pageKey={pagina.pageKey} sectie="opening" />

      <BeeldMetTekst
        sectie="verhaal"
        beeld={beeld}
        html={pagina.html("verhaal")}
        achtergrond="wit"
        lijnBoven
      />
      <VrijeZone pageKey={pagina.pageKey} sectie="verhaal" />

      <Onderdeel
        pagina={pagina}
        sectie="leert"
        titel={pagina.tekst("leert_titel")}
        html={pagina.html("leert_tekst")}
        achtergrond="zand"
      />

      <Onderdeel
        pagina={pagina}
        sectie="programma"
        titel={pagina.tekst("programma_titel")}
        html={pagina.html("programma_tekst")}
      />

      <Onderdeel
        pagina={pagina}
        sectie="lesdagen"
        titel={pagina.tekst("lesdagen_titel")}
        html={pagina.html("lesdagen_tekst")}
        achtergrond="creme"
      />

      <Onderdeel
        pagina={pagina}
        sectie="afloop"
        titel={pagina.tekst("afloop_titel")}
        html={pagina.html("afloop_tekst")}
      />

      {pagina.tekst("toelating_tekst") ? (
        <>
          <Sectie sectie="toelating" achtergrond="creme" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("toelating_titel")}</h2>
              <p className="mt-6 text-lg">{pagina.tekst("toelating_tekst")}</p>
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="toelating" />
        </>
      ) : null}

      {pagina.tekst("prijs") ? (
        <>
          <Sectie sectie="prijs" lijnBoven>
            <div className="max-w-2xl">
              <p className="font-serif text-4xl">{pagina.tekst("prijs")}</p>
              <CmsKnop
                tekst={pagina.tekst("prijs_knop")}
                link={pagina.tekst("prijs_link")}
                terugval="/opleidingen/200-uurs-yogaopleiding"
                className="mt-6"
              />
              {pagina.tekst("prijs_voet") ? (
                <p className="mt-4 text-muted italic">
                  {pagina.tekst("prijs_voet")}
                </p>
              ) : null}
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="prijs" />
        </>
      ) : null}

      <OpleidingGedeeld
        pagina={gedeeld}
        onderwerp={pagina.tekst("titel")}
        // De variant uit de prijstabel die bij deze module hoort. Komt iemand
        // van de modulepagina, dan staat die alvast goed in het formulier.
        gekozenVariant={pagina.tekst("titel")}
      />
    </>
  );
}

/** Een kop met een stuk richtext eronder; vier keer dezelfde vorm. */
function Onderdeel({
  pagina,
  sectie,
  titel,
  html,
  achtergrond = "wit",
}: {
  pagina: Pagina;
  sectie: string;
  titel: string;
  html: string;
  achtergrond?: "wit" | "creme" | "zand";
}) {
  if (!html) return null;

  return (
    <>
      <Sectie sectie={sectie} achtergrond={achtergrond} lijnBoven>
        <div className="max-w-2xl">
          {titel ? <h2 className="text-3xl">{titel}</h2> : null}
          <Richtext html={html} className="mt-6 text-lg" />
        </div>
      </Sectie>
      <VrijeZone pageKey={pagina.pageKey} sectie={sectie} />
    </>
  );
}
