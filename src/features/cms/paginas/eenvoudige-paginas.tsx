import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { BeeldAchtergrond } from "@/components/layout/beeld-achtergrond";
import { isAchtergrond, isNaastElkaar } from "@/lib/beeldlayout";
import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";
import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { SectieBeeld } from "@/components/layout/sectie-beeld";
import { VEILIGHEID_SECTIES } from "@/content/veiligheid";
import { ContactFormulier } from "../components/contact-formulier";
import type { Pagina } from "../server/queries";
import { VrijeZone } from "./vrije-zone";

/**
 * De overige pagina's met bewerkbare inhoud (BOUWPROMPT §8).
 *
 * Net als de landingspagina losgemaakt van het ophalen, zodat de site-editor
 * dezelfde opmaak kan tonen met de concepten erin (§14).
 */

type Docent = { naam: string; rol: string; bio: string; foto: string };
type Gegeven = { label: string; waarde: string };

export function OverOnsInhoud({ pagina }: { pagina: Pagina }) {
  const docenten = pagina.lijst<Docent>("docenten");
  const beeld = pagina.beeld("beeld");

  return (
    <>
      <>
        <SectieBeeld
          beeld={pagina.beeld("opening_beeld")}
          sectie="opening"
          achtergrond="creme"
        >
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          </div>
        </SectieBeeld>
        <VrijeZone pageKey={"over-ons"} sectie="opening" />
      </>

      <BeeldMetTekst
        sectie="verhaal"
        beeld={beeld}
        html={pagina.html("verhaal")}
        achtergrond="creme"
      />

      {docenten.length > 0 ? (
        <SectieBeeld
          beeld={pagina.beeld("docenten_beeld")}
          sectie="docenten"
          lijnBoven
        >
          <SectieKop titel={pagina.tekst("docenten_titel")} />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {docenten.map((docent, index) => (
              <li key={index} className="flex gap-5">
                {docent.foto ? (
                  <Image
                    src={docent.foto}
                    alt={`Portret van ${docent.naam}`}
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="size-24 shrink-0 rounded-full border border-line bg-sand"
                  />
                )}
                <div>
                  <h3 className="text-lg">{docent.naam}</h3>
                  <p className="text-sm text-muted">{docent.rol}</p>
                  <p className="mt-2 text-[0.975rem]">{docent.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectieBeeld>
      ) : null}

      {pagina.tekst("cta_titel") ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("cta_beeld")}
            sectie="cta"
            achtergrond="zand"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
              <div className="mt-4">
                <Alineas
                  tekst={pagina.tekst("cta_tekst")}
                  className="text-lg text-muted"
                />
              </div>
              <CmsKnop
                tekst={pagina.tekst("cta_knop")}
                link={pagina.tekst("cta_link")}
                terugval="/contact"
                className="mt-8"
              />
            </div>
          </SectieBeeld>
          <VrijeZone pageKey={"over-ons"} sectie="cta" />
        </>
      ) : null}
    </>
  );
}

export function ContactInhoud({ pagina }: { pagina: Pagina }) {
  const gegevens = pagina.lijst<Gegeven>("gegevens");

  return (
    <>
      <SectieBeeld beeld={pagina.beeld("opening_beeld")} sectie="opening">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_1fr]">
          <div>
            <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
            <div className="mt-5">
              <Alineas
                tekst={pagina.tekst("inleiding")}
                className="text-lg text-muted"
              />
            </div>

            <div className="mt-10">
              <ContactFormulier />
            </div>
          </div>

          {gegevens.length > 0 ? (
            <aside className="lg:pt-24">
              <div className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
                {pagina.tekst("rechtstreeks_titel") ? (
                  <h2 className="text-xl">
                    {pagina.tekst("rechtstreeks_titel")}
                  </h2>
                ) : null}
                <dl className="mt-4 space-y-3">
                  {gegevens.map((gegeven) => (
                    <div key={gegeven.label}>
                      <dt className="text-sm text-muted">{gegeven.label}</dt>
                      <dd className="mt-0.5">{gegeven.waarde}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          ) : null}
        </div>
      </SectieBeeld>
      <VrijeZone pageKey={"contact"} sectie="opening" />
    </>
  );
}

export function JuridischeInhoud({ pagina }: { pagina: Pagina }) {
  const waarschuwing = pagina.tekst("concept_waarschuwing");

  return (
    <Sectie sectie="opening">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
        <div className="mt-5">
          <Alineas
            tekst={pagina.tekst("inleiding")}
            className="text-lg text-muted"
          />
        </div>

        {waarschuwing ? (
          <p
            role="note"
            className="mt-8 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
          >
            {waarschuwing}
          </p>
        ) : null}

        <Richtext
          html={pagina.html("inhoud")}
          className="mt-10 [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:space-y-1"
        />
      </div>
    </Sectie>
  );
}

export function VeiligheidInhoud({ pagina }: { pagina: Pagina }) {
  return (
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

          <Richtext
            html={pagina.html("kern")}
            className="mt-10 text-lg [&_li]:mt-2"
          />

          {/* Uitklappers met <details>, niet met een schakelaar in JavaScript:
            zo staan ze open in een afdruk, vindt de zoekfunctie van de browser
            ook de dichtgeklapte tekst, en werkt de pagina wanneer er onderweg
            iets met de scripts misgaat. Dat past bij een pagina die juist over
            betrouwbaarheid gaat. */}
          <div className="mt-12 divide-y divide-line border-y border-line">
            {VEILIGHEID_SECTIES.map((_, index) => {
              const nummer = index + 1;
              const vraag = pagina.tekst(`sectie_${nummer}_vraag`);
              const antwoord = pagina.html(`sectie_${nummer}_antwoord`);

              if (!vraag) return null;

              return (
                <details key={nummer} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-ink marker:content-none hover:text-green [&::-webkit-details-marker]:hidden">
                    {vraag}
                    <ChevronDown
                      aria-hidden
                      className="size-5 shrink-0 text-green transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <Richtext html={antwoord} className="pb-6 text-muted" />
                </details>
              );
            })}
          </div>
        </div>
      </SectieBeeld>
      <VrijeZone pageKey={"veiligheid"} sectie="opening" />
    </>
  );
}

export function OverzichtInhoud({
  pagina,
  pageKey,
  children,
}: {
  pagina: Pagina;
  /** Nodig om de eigen blokken van déze pagina op te halen. */
  pageKey: string;
  children: React.ReactNode;
}) {
  const beeld = pagina.beeld("beeld");
  const naast = beeld !== null && isNaastElkaar(beeld.layout);
  const opDeFoto = beeld !== null && isAchtergrond(beeld.layout);

  const kop = (
    <SectieKop
      hoofdkop
      titel={pagina.tekst("titel")}
      inleiding={pagina.tekst("inleiding")}
    />
  );

  // Een brede band, geen paginavullende foto: het beeld hoort de pagina te
  // openen, niet te overstemmen. Kiest de beheerder links of rechts, dan komt
  // hij naast de kop te staan in plaats van eronder. Blijft weg zolang er geen
  // foto is gekozen, zodat de pagina niet met een gat begint.
  const foto = beeld ? (
    <Image
      src={beeld.url}
      alt={beeld.alt}
      width={naast ? 900 : 1600}
      height={naast ? 700 : 520}
      style={{ objectPosition: beeld.focus }}
      className={[
        "w-full rounded-[var(--radius-card)] border border-line object-cover",
        naast ? "aspect-[4/3]" : "mt-10 aspect-[16/5]",
      ].join(" ")}
    />
  ) : null;

  // Tekst op de foto: kop en inleiding komen op het beeld te staan, en het
  // rooster of het aanbod eronder in een gewone sectie.
  if (opDeFoto && beeld) {
    return (
      <>
        <BeeldAchtergrond beeld={beeld} sectie="opening">
          <SectieKop
            hoofdkop
            titel={pagina.tekst("titel")}
            inleiding={pagina.tekst("inleiding")}
          />
        </BeeldAchtergrond>
        <Sectie>
          <div id="rooster" className="scroll-mt-24">
            {children}
          </div>
        </Sectie>
      </>
    );
  }

  return (
    <>
      <Sectie sectie="opening">
        {naast ? (
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* De foto blijft in de opbouw vóór de kop staan, ook bij "rechts":
              zo staat hij op een telefoon altijd boven en leest een schermlezer
              alles in dezelfde volgorde als iedereen. */}
            <div
              className={beeld?.layout === "rechts" ? "lg:order-2" : undefined}
            >
              {foto}
            </div>
            <div>{kop}</div>
          </div>
        ) : (
          <>
            {kop}
            {foto}
          </>
        )}

        {/* Het anker waar een knop naartoe kan springen: op /lessen is dit het
          weekrooster, op /opleidingen en /trainingen het aanbod. Staat als
          `/lessen#rooster` in de lijst met bestemmingen. */}
        <div id="rooster" className="mt-12 scroll-mt-24">
          {children}
        </div>
      </Sectie>
      <VrijeZone pageKey={pageKey} sectie="opening" />
    </>
  );
}

/**
 * De pagina voor yogadocenten.
 *
 * Stond als losse opmaak in de route zelf. Daardoor kon de voorvertoning hem
 * niet tonen: die kan alleen componenten aanroepen, geen routes. Hier staat hij
 * één keer, en beide plekken gebruiken hem.
 */
export function VoorYogadocentenInhoud({ pagina }: { pagina: Pagina }) {
  return (
    <>
      <SectieBeeld beeld={pagina.beeld("opening_beeld")} sectie="opening">
        <div className="max-w-2xl">
          {pagina.tekst("locatie") ? (
            <p className="text-sm tracking-[0.14em] text-muted uppercase">
              {pagina.tekst("locatie")}
            </p>
          ) : null}
          <h1 className="mt-3 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <div className="mt-5">
            <Alineas
              tekst={pagina.tekst("inleiding")}
              className="text-lg text-muted"
            />
          </div>

          <Richtext
            html={pagina.html("uitleg")}
            className="mt-10 [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:space-y-1"
          />

          <div className="mt-10 flex flex-wrap gap-3">
            <CmsKnop
              tekst={pagina.tekst("knop")}
              link={pagina.tekst("knop_link")}
              terugval="/docenten"
            />
            <CmsKnop
              tekst={pagina.tekst("knop_twee")}
              link={pagina.tekst("knop_twee_link")}
              terugval="/contact"
              variant="omlijnd"
            />
          </div>
        </div>
      </SectieBeeld>
      <VrijeZone pageKey="voor-yogadocenten" sectie="opening" />

      {pagina.html("voorwaarden") ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("voorwaarden_beeld")}
            sectie="voorwaarden"
            achtergrond="zand"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("voorwaarden_titel")}</h2>
              <Richtext
                html={pagina.html("voorwaarden")}
                className="mt-4 text-[0.975rem]"
              />
            </div>
          </SectieBeeld>
          <VrijeZone pageKey="voor-yogadocenten" sectie="voorwaarden" />
        </>
      ) : null}

      {pagina.tekst("registreren_titel") ? (
        <>
          <SectieBeeld
            beeld={pagina.beeld("registreren_beeld")}
            sectie="registreren"
            lijnBoven
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("registreren_titel")}</h2>
              <div className="mt-4">
                <Alineas
                  tekst={pagina.tekst("registreren_tekst")}
                  className="text-lg text-muted"
                />
              </div>
              <CmsKnop
                tekst={pagina.tekst("registreren_knop")}
                link={pagina.tekst("registreren_link")}
                terugval="/opleidingen/academy#registreren"
                className="mt-8"
              />
            </div>
          </SectieBeeld>
          <VrijeZone pageKey="voor-yogadocenten" sectie="registreren" />
        </>
      ) : null}
    </>
  );
}
