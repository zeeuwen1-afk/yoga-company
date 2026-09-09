import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";

import { OpleidingGedeeld } from "./opleiding-gedeeld";
import { VrijeZone } from "./vrije-zone";
import type { Pagina } from "../server/queries";

/**
 * De overzichtspagina van de 200-uurs Yogaopleiding.
 *
 * Alles wat hier staat komt uit de site-editor, inclusief de vier modulekaarten
 * en de adressen waar hun knoppen heen wijzen. De prijstabel en de praktische
 * blokken komen uit `OpleidingGedeeld`; die staan één keer in de editor en
 * verschijnen ook op de vier modulepagina's.
 */

type Modulekaart = {
  nummer: string;
  titel: string;
  uren: string;
  tekst: string;
  knop: string;
  href: string;
};

export function YogaopleidingInhoud({
  pagina,
  gedeeld,
}: {
  pagina: Pagina;
  /** De prijzen en praktische blokken; die staan op een eigen paginasleutel. */
  gedeeld: Pagina;
}) {
  const beeld = pagina.beeld("beeld");
  const modules = pagina
    .lijst<Modulekaart>("modules")
    .filter((module) => module.titel?.trim());

  return (
    <>
      <Sectie sectie="opening" achtergrond="creme">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          {pagina.tekst("subtitel") ? (
            <p className="mt-4 text-xl text-ink">{pagina.tekst("subtitel")}</p>
          ) : null}
          <div className="mt-6">
            <Alineas
              tekst={pagina.tekst("inleiding")}
              className="text-lg text-muted"
            />
          </div>
          {pagina.tekst("kenmerken") ? (
            <p className="mt-6 font-serif text-lg text-accent">
              {pagina.tekst("kenmerken")}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <CmsKnop
              tekst={pagina.tekst("knop")}
              link={pagina.tekst("knop_link")}
              terugval="#modules"
            />
            <CmsKnop
              tekst={pagina.tekst("knop_twee")}
              link={pagina.tekst("knop_twee_link")}
              terugval="/inschrijven/200-uurs-yogaopleiding"
              variant="omlijnd"
            />
          </div>
        </div>
      </Sectie>
      <VrijeZone pageKey="yogaopleiding" sectie="opening" />

      <BeeldMetTekst
        sectie="introductie"
        beeld={beeld}
        html={pagina.html("introductie_tekst")}
        achtergrond="wit"
        lijnBoven
      />
      <VrijeZone pageKey="yogaopleiding" sectie="introductie" />

      {modules.length > 0 ? (
        <>
          <Sectie id="modules" sectie="modules" achtergrond="zand" lijnBoven>
            <SectieKop titel={pagina.tekst("modules_titel")} />
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {modules.map((module, index) => (
                <li key={index} className="relative flex">
                  <article className="flex flex-1 flex-col rounded-[var(--radius-card)] border border-line bg-background p-6 transition-colors hover:border-accent/60">
                    <p className="label-klein text-accent">
                      {[module.nummer, module.uren].filter(Boolean).join(" · ")}
                    </p>
                    <h3 className="mt-2 text-2xl">
                      <Link href={module.href || "#"}>
                        <span className="absolute inset-0" aria-hidden />
                        {module.titel}
                      </Link>
                    </h3>
                    <p className="mt-3 flex-1 text-muted">{module.tekst}</p>
                    <p className="mt-5 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
                      {module.knop || "Lees meer"}
                      <ArrowRight className="size-4" aria-hidden />
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding" sectie="modules" />
        </>
      ) : null}

      {pagina.html("manieren_tekst") ? (
        <>
          <Sectie sectie="manieren" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("manieren_titel")}</h2>
              <Richtext
                html={pagina.html("manieren_tekst")}
                className="mt-6 text-lg"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding" sectie="manieren" />
        </>
      ) : null}

      <OpleidingGedeeld pagina={gedeeld} />

      {pagina.html("voorwie_tekst") ? (
        <>
          <Sectie sectie="voorwie" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("voorwie_titel")}</h2>
              <Richtext
                html={pagina.html("voorwie_tekst")}
                className="mt-6 text-lg"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding" sectie="voorwie" />
        </>
      ) : null}

      {pagina.html("diploma_tekst") ? (
        <>
          <Sectie sectie="diploma" achtergrond="creme" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("diploma_titel")}</h2>
              <Richtext
                html={pagina.html("diploma_tekst")}
                className="mt-6 text-lg"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding" sectie="diploma" />
        </>
      ) : null}

      {pagina.html("doorstroom_tekst") ? (
        <>
          <Sectie sectie="doorstroom" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("doorstroom_titel")}</h2>
              <Richtext
                html={pagina.html("doorstroom_tekst")}
                className="mt-6 text-lg"
              />
              <CmsKnop
                tekst={pagina.tekst("doorstroom_knop")}
                link={pagina.tekst("doorstroom_link")}
                terugval="/opleidingen/200-uurs-yin-yoga-specialist"
                variant="omlijnd"
                className="mt-8"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding" sectie="doorstroom" />
        </>
      ) : null}
    </>
  );
}
