import Link from "next/link";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { Richtext, Sectie } from "@/components/layout/sectie";
import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";
import { NIVEAUS } from "@/content/niveaus";
import { AcademyBadge } from "@/features/courses";

import type { Pagina } from "../server/queries";
import { VrijeZone } from "./vrije-zone";

/**
 * Waar de Yoga Company Academy voor staat, en wat het certificaat inhoudt.
 *
 * Elke badge op de site wijst hiernaartoe. Wie op een cursuspagina "Wat dit
 * certificaat inhoudt" aanklikt wil twee dingen weten: wie dit certificaat
 * uitgeeft en wat het waard is. Dat staat hier, in die volgorde, en in de
 * woorden van de site-editor, zodat Wietske ze zelf kan aanscherpen.
 *
 * De drie niveaus staan hier met hun badge en een eigen stuk tekst. De badges
 * en hun volgorde liggen vast; de teksten niet.
 */
export function AcademyInhoud({ pagina }: { pagina: Pagina }) {
  const beeld = pagina.beeld("beeld");

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

      {pagina.tekst("niveaus_titel") ? (
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
