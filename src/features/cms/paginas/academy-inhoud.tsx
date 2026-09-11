import Link from "next/link";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { Richtext, Sectie } from "@/components/layout/sectie";
import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";
import { NIVEAUS } from "@/content/niveaus";
import { AcademyBadge } from "@/features/courses";

import { RegistratieFormulier } from "../components/registratie-formulier";
import type { Pagina } from "../server/queries";
import { VrijeZone } from "./vrije-zone";

/**
 * Waar de Yoga Company Academy voor staat: het keurmerk, wat het certificaat
 * inhoudt, de voorwaarden voor certificering en de ingang voor opleiders die
 * hun eigen opleiding willen laten registreren.
 *
 * Eén pagina, want elke badge op de site wijst hiernaartoe en een deelnemer
 * en een opleider stellen dezelfde vraag: wie geeft dit certificaat en wat is
 * het waard. Omdat de pagina lang is, staat onder de kop een sprongmenu naar
 * de drie delen. De ankers liggen vast; knoppen elders op de site wijzen
 * ernaar.
 *
 * De teksten komen uit de site-editor. De badges, de volgorde van de niveaus
 * en het formulier liggen vast: een certificaatmerk hoort niet per pagina
 * anders te heten, en een formulier zonder de velden die een aanvraag
 * bruikbaar maken is geen formulier.
 */

const PDF_TERUGVAL =
  "/documenten/voorwaarden-registratie-yogaopleidingen-v1-0.pdf";

type Leergebied = { gebied: string; yaf: string; yaa: string; yap: string };
type Stap = { titel: string; tekst: string };
type Kostenregel = {
  registratie: string;
  kosten: string;
  beoordeling: string;
  inbegrepen: string;
};

export function AcademyInhoud({ pagina }: { pagina: Pagina }) {
  const beeld = pagina.beeld("beeld");

  const heeftNiveaus = Boolean(pagina.tekst("niveaus_titel"));
  const heeftCertificering = Boolean(pagina.tekst("certificering_titel"));
  const heeftRegistreren = Boolean(pagina.tekst("registreren_titel"));

  // Het sprongmenu toont alleen de delen die er zijn; een link naar een
  // weggehaalde sectie springt nergens heen.
  const sprongen = [
    heeftNiveaus ? { href: "#niveaus", label: "Voor deelnemers" } : null,
    heeftCertificering ? { href: "#voorwaarden", label: "Voorwaarden" } : null,
    heeftRegistreren ? { href: "#registreren", label: "Voor opleiders" } : null,
  ].filter((sprong) => sprong !== null);

  const leergebieden = pagina
    .lijst<Leergebied>("certificering_leergebieden")
    .filter((regel) => regel.gebied?.trim());
  const stappen = pagina
    .lijst<Stap>("registreren_stappen")
    .filter((stap) => stap.titel?.trim());
  const kosten = pagina
    .lijst<Kostenregel>("registreren_kosten")
    .filter((regel) => regel.registratie?.trim());

  const pdfKnop = (
    <CmsKnop
      tekst={pagina.tekst("certificering_knop")}
      link={pagina.tekst("certificering_link")}
      terugval={PDF_TERUGVAL}
      variant="omlijnd"
      className="mt-8"
    />
  );

  return (
    <>
      <Sectie sectie="opening" achtergrond="creme">
        <div className="max-w-3xl">
          <nav aria-label="Kruimelpad" className="text-sm text-muted">
            <Link href="/opleidingen" className="underline hover:text-green">
              Yoga Company Academy
            </Link>
          </nav>
          <h1 className="mt-4 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          {pagina.tekst("inleiding") ? (
            <div className="mt-5">
              <Alineas
                tekst={pagina.tekst("inleiding")}
                className="text-lg text-muted"
              />
            </div>
          ) : null}
          {sprongen.length > 1 ? (
            <nav aria-label="Op deze pagina" className="mt-8">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                {sprongen.map((sprong) => (
                  <li key={sprong.href}>
                    <a
                      href={sprong.href}
                      className="underline underline-offset-4 hover:no-underline"
                    >
                      {sprong.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
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

      {heeftNiveaus ? (
        <>
          <Sectie id="niveaus" sectie="niveaus" achtergrond="creme" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("niveaus_titel")}</h2>
              {pagina.tekst("niveaus_inleiding") ? (
                <div className="mt-4">
                  <Alineas
                    tekst={pagina.tekst("niveaus_inleiding")}
                    className="text-lg text-muted"
                  />
                </div>
              ) : null}
            </div>

            <ul className="mt-10 grid gap-10 lg:grid-cols-3">
              {NIVEAUS.map((niveau) => (
                <li key={niveau} className="flex gap-6 lg:block">
                  <AcademyBadge
                    niveau={niveau}
                    className="w-28 shrink-0 sm:w-36"
                  />
                  <div className="lg:mt-5">
                    <h3 className="text-2xl">
                      {pagina.tekst(`${niveau}_titel`)}
                    </h3>
                    <div className="mt-2">
                      <Alineas
                        tekst={pagina.tekst(`${niveau}_tekst`)}
                        className="text-[0.975rem] text-muted"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="niveaus" />
        </>
      ) : null}

      {pagina.html("certificaat_tekst") ? (
        <>
          <Sectie
            id="certificaat"
            sectie="certificaat"
            achtergrond="zand"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("certificaat_titel")}</h2>
              <Richtext
                html={pagina.html("certificaat_tekst")}
                className="mt-6 text-lg"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="certificaat" />
        </>
      ) : null}

      {heeftCertificering ? (
        <>
          <Sectie id="voorwaarden" sectie="certificering" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">
                {pagina.tekst("certificering_titel")}
              </h2>
              {pagina.tekst("certificering_inleiding") ? (
                <div className="mt-4">
                  <Alineas
                    tekst={pagina.tekst("certificering_inleiding")}
                    className="text-lg text-muted"
                  />
                </div>
              ) : null}

              <Onderdeel titel={pagina.tekst("certificering_opleiding_titel")}>
                <Richtext html={pagina.html("certificering_opleiding")} />
              </Onderdeel>

              {leergebieden.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[0.975rem]">
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Leergebied
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          YAF 50
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          YAA 100
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          YAP 200
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leergebieden.map((regel, index) => (
                        <tr key={index} className="border-b border-line">
                          <td className="py-2 pr-4">{regel.gebied}</td>
                          <td className="py-2 pr-4 tabular-nums">
                            {regel.yaf}
                          </td>
                          <td className="py-2 pr-4 tabular-nums">
                            {regel.yaa}
                          </td>
                          <td className="py-2 tabular-nums">{regel.yap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <Richtext
                html={pagina.html("certificering_opleiding_vervolg")}
                className="mt-6"
              />

              <Onderdeel titel={pagina.tekst("certificering_opleider_titel")}>
                <Richtext html={pagina.html("certificering_opleider")} />
              </Onderdeel>

              <Onderdeel
                titel={pagina.tekst("certificering_gedragscode_titel")}
              >
                <Richtext html={pagina.html("certificering_gedragscode")} />
              </Onderdeel>

              {pagina.tekst("certificering_slot") ? (
                <p className="mt-8 text-[0.975rem] text-muted">
                  {pagina.tekst("certificering_slot")}
                </p>
              ) : null}
              {pdfKnop}
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="certificering" />
        </>
      ) : null}

      {heeftRegistreren ? (
        <>
          <Sectie
            id="registreren"
            sectie="registreren"
            achtergrond="creme"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("registreren_titel")}</h2>
              {pagina.tekst("registreren_inleiding") ? (
                <div className="mt-4">
                  <Alineas
                    tekst={pagina.tekst("registreren_inleiding")}
                    className="text-lg text-muted"
                  />
                </div>
              ) : null}

              <Onderdeel titel={pagina.tekst("registreren_krijgt_titel")}>
                <Richtext html={pagina.html("registreren_krijgt")} />
              </Onderdeel>

              {stappen.length > 0 ? (
                <Onderdeel titel={pagina.tekst("registreren_stappen_titel")}>
                  <ol className="space-y-4">
                    {stappen.map((stap, index) => (
                      <li key={index} className="flex gap-4">
                        <span
                          aria-hidden
                          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line font-serif text-lg font-semibold"
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{stap.titel}</p>
                          {stap.tekst ? (
                            <p className="mt-1 text-[0.975rem] text-muted">
                              {stap.tekst}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Onderdeel>
              ) : null}

              {kosten.length > 0 ? (
                <Onderdeel titel={pagina.tekst("registreren_kosten_titel")}>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[0.975rem]">
                      <thead>
                        <tr className="border-b border-line">
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Registratie
                          </th>
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Kosten
                          </th>
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Waarvan beoordeling
                          </th>
                          <th scope="col" className="py-2 font-semibold">
                            Inbegrepen
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kosten.map((regel, index) => (
                          <tr
                            key={index}
                            className="border-b border-line align-top"
                          >
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {regel.registratie}
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                              {regel.kosten}
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                              {regel.beoordeling}
                            </td>
                            <td className="py-2">{regel.inbegrepen}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pagina.tekst("registreren_kosten_voet") ? (
                    <p className="mt-4 text-[0.975rem] text-muted">
                      {pagina.tekst("registreren_kosten_voet")}
                    </p>
                  ) : null}
                </Onderdeel>
              ) : null}

              {pagina.tekst("registreren_keurmerk") ? (
                <Onderdeel titel={pagina.tekst("registreren_keurmerk_titel")}>
                  <Alineas
                    tekst={pagina.tekst("registreren_keurmerk")}
                    className="text-[0.975rem]"
                  />
                </Onderdeel>
              ) : null}

              <Onderdeel titel={pagina.tekst("registreren_formulier_titel")}>
                {pagina.tekst("registreren_formulier_tekst") ? (
                  <div className="mb-6">
                    <Alineas
                      tekst={pagina.tekst("registreren_formulier_tekst")}
                      className="text-[0.975rem] text-muted"
                    />
                  </div>
                ) : null}
                <RegistratieFormulier />
              </Onderdeel>

              {pdfKnop}
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="registreren" />
        </>
      ) : null}

      {pagina.tekst("cta_titel") ? (
        <>
          <Sectie sectie="cta" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
              {pagina.tekst("cta_tekst") ? (
                <div className="mt-4">
                  <Alineas
                    tekst={pagina.tekst("cta_tekst")}
                    className="text-lg text-muted"
                  />
                </div>
              ) : null}
              <CmsKnop
                tekst={pagina.tekst("cta_knop")}
                link={pagina.tekst("cta_link")}
                terugval="/contact"
                className="mt-8"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey={pagina.pageKey} sectie="cta" />
        </>
      ) : null}
    </>
  );
}

/** Een kopje met inhoud eronder; blijft weg zonder kopje. */
function Onderdeel({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  if (!titel) return null;
  return (
    <div className="mt-10">
      <h3 className="text-2xl">{titel}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
