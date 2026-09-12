import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Richtext } from "@/components/layout/sectie";
import { SectieBeeld } from "@/components/layout/sectie-beeld";
import { Alineas } from "@/components/ui/alineas";
import type { Aanbod, Lesplek } from "@/content/tarieven";
import type { Pagina } from "../server/queries";
import { VrijeZone } from "./vrije-zone";

/**
 * De pagina Lessen, workshops en privéyoga (§8.2).
 *
 * Geen prijslijst maar een wegwijzer. Waar Wietske bij een yogaschool lesgeeft,
 * bepaalt die school de prijs en loopt de betaling daar; daar staat dus een link
 * en geen bedrag. Wat ze zelf verkoopt — workshops en privéyoga — heeft wél een
 * bedrag, want dat is van haar.
 *
 * Elke sectie verdwijnt als hij leeg is. Zo kan de beheerder de pagina stap voor
 * stap vullen zonder dat er tussentijds lege kaders op de site staan.
 */

const ORGANISATIEPAGINAS = [
  { href: "/bedrijfsyoga", label: "Bedrijven" },
  { href: "/sportclubs", label: "Sportclubs" },
  { href: "/onderwijs", label: "Onderwijs" },
];

/** Een regel is pas een regel als er iets in staat dat de bezoeker kan lezen. */
function gevuld(waarden: (string | undefined)[]) {
  return waarden.some((waarde) => waarde?.trim());
}

export function TarievenInhoud({ pagina }: { pagina: Pagina }) {
  const lesplekken = pagina
    .lijst<Lesplek>("lesplekken")
    .filter((plek) => gevuld([plek.les, plek.school]));
  const workshops = pagina
    .lijst<Aanbod>("workshops")
    .filter((regel) => gevuld([regel.naam]));
  const prive = pagina
    .lijst<Aanbod>("prive")
    .filter((regel) => gevuld([regel.naam]));

  return (
    <>
      <>
        <SectieBeeld beeld={pagina.beeld("opening_beeld")} sectie="opening">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
            <div className="mt-5">
              <Alineas
                tekst={pagina.tekst("inleiding")}
                className="text-lg text-muted"
              />
            </div>
          </div>
        </SectieBeeld>
        <VrijeZone pageKey={"tarieven"} sectie="opening" />
      </>

      {lesplekken.length > 0 ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("lesplekken_beeld")}
            sectie="lesplekken"
            achtergrond="zand"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("lesplekken_titel")}</h2>
              <div className="mt-4">
                <Alineas
                  tekst={pagina.tekst("lesplekken_inleiding")}
                  className="text-muted"
                />
              </div>
            </div>

            <ul className="mt-8 grid max-w-4xl gap-3">
              {lesplekken.map((plek, index) => (
                <li
                  key={`${plek.school}-${index}`}
                  className="rounded-[var(--radius-card)] border border-line bg-background p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">{plek.les}</h3>
                      {plek.school ? (
                        <p className="text-muted">{plek.school}</p>
                      ) : null}
                    </div>

                    {/* Geen bedrag maar een verwijzing. De school bepaalt de
                      prijs en verandert hem zonder dat wij het weten; een link
                      naar hun eigen pagina blijft wel altijd kloppen. */}
                    {plek.website?.trim() ? (
                      <a
                        href={plek.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:no-underline"
                      >
                        {pagina.tekst("lesplekken_knop") ||
                          "Aanmelden en tarieven"}
                        <ArrowUpRight className="size-4" aria-hidden />
                        <span className="sr-only">{` bij ${plek.school || "deze school"}, opent in een nieuw tabblad`}</span>
                      </a>
                    ) : pagina.tekst("lesplekken_tarief") ? (
                      <span className="text-sm text-muted">
                        {pagina.tekst("lesplekken_tarief")}
                      </span>
                    ) : null}
                  </div>

                  {plek.wanneer?.trim() ? (
                    <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
                      {plek.wanneer}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectieBeeld>
          <VrijeZone pageKey={"tarieven"} sectie="lesplekken" />
        </>
      ) : null}

      {workshops.length > 0 ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("workshops_beeld")}
            id="workshops"
            sectie="workshops"
            lijnBoven
          >
            <h2 className="text-3xl">{pagina.tekst("workshops_titel")}</h2>
            <AanbodLijst regels={workshops} />
          </SectieBeeld>
          <VrijeZone pageKey={"tarieven"} sectie="workshops" />
        </>
      ) : null}

      {prive.length > 0 ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("prive_beeld")}
            id="prive"
            sectie="prive"
            achtergrond="zand"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("prive_titel")}</h2>
              <div className="mt-4">
                <Alineas
                  tekst={pagina.tekst("prive_inleiding")}
                  className="text-muted"
                />
              </div>
            </div>

            <AanbodLijst regels={prive} />

            {pagina.tekst("prive_voetnoot") ? (
              <p className="mt-5 max-w-2xl text-sm text-muted">
                {pagina.tekst("prive_voetnoot")}
              </p>
            ) : null}
          </SectieBeeld>
          <VrijeZone pageKey={"tarieven"} sectie="prive" />
        </>
      ) : null}

      {pagina.tekst("organisaties_titel") ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("organisaties_beeld")}
            sectie="organisaties"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("organisaties_titel")}</h2>
              <div className="mt-4">
                <Alineas
                  tekst={pagina.tekst("organisaties_tekst")}
                  className="text-muted"
                />
              </div>
              <ul className="mt-6 flex flex-wrap gap-3">
                {ORGANISATIEPAGINAS.map((pagina) => (
                  <li key={pagina.href}>
                    <Link
                      href={pagina.href}
                      className="inline-flex h-11 items-center rounded-lg border border-line px-5 font-semibold transition-colors hover:bg-hover"
                    >
                      {pagina.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </SectieBeeld>
          <VrijeZone pageKey={"tarieven"} sectie="organisaties" />
        </>
      ) : null}

      {pagina.html("voorwaarden") ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("voorwaarden_beeld")}
            sectie="voorwaarden"
            lijnBoven
          >
            <div className="max-w-2xl rounded-[var(--radius-card)] border border-sand bg-sand-light p-5">
              <Richtext
                html={pagina.html("voorwaarden")}
                className="text-[0.975rem]"
              />
            </div>
          </SectieBeeld>
          <VrijeZone pageKey={"tarieven"} sectie="voorwaarden" />
        </>
      ) : null}
    </>
  );
}

/**
 * Workshops en privétarieven zien er hetzelfde uit: een naam, wat het inhoudt,
 * en een bedrag rechts. Eén component, zodat ze niet uit elkaar gaan lopen.
 */
function AanbodLijst({ regels }: { regels: Aanbod[] }) {
  return (
    <ul className="mt-6 grid max-w-4xl gap-3">
      {regels.map((regel, index) => (
        <li
          key={`${regel.naam}-${index}`}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-line bg-background p-5"
        >
          <div>
            <h3 className="text-lg font-semibold">{regel.naam}</h3>
            <p className="text-sm text-muted">
              {[regel.duur, regel.toelichting]
                .map((deel) => deel?.trim())
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {regel.prijs?.trim() ? (
            <p className="font-serif text-2xl font-semibold tabular-nums">
              {regel.prijs}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
