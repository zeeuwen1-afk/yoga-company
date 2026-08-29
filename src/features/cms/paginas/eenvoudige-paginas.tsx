import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { VEILIGHEID_SECTIES } from "@/content/veiligheid";
import { ContactFormulier } from "../components/contact-formulier";
import type { Pagina } from "../server/queries";

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
      <Sectie achtergrond="creme">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <Richtext html={pagina.html("verhaal")} className="mt-8 text-lg" />
        </div>
      </Sectie>

      {beeld ? (
        <Sectie className="!pt-0">
          <Image
            src={beeld.url}
            alt={beeld.alt}
            width={1600}
            height={700}
            className="aspect-[16/7] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        </Sectie>
      ) : null}

      {docenten.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop titel="Onze docenten" />
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
        </Sectie>
      ) : null}

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">Benieuwd of het klikt?</h2>
          <p className="mt-4 text-lg text-muted">
            De beste manier om erachter te komen is het gesprek. Stel je vraag —
            we reageren meestal binnen twee werkdagen.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
          >
            Neem contact op
          </Link>
        </div>
      </Sectie>
    </>
  );
}

export function ContactInhoud({ pagina }: { pagina: Pagina }) {
  const gegevens = pagina.lijst<Gegeven>("gegevens");

  return (
    <Sectie>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <div>
          <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <p className="mt-5 text-lg text-muted">{pagina.tekst("inleiding")}</p>

          <div className="mt-10">
            <ContactFormulier />
          </div>
        </div>

        {gegevens.length > 0 ? (
          <aside className="lg:pt-24">
            <div className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
              <h2 className="text-xl">Rechtstreeks contact</h2>
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
    </Sectie>
  );
}

export function JuridischeInhoud({ pagina }: { pagina: Pagina }) {
  const waarschuwing = pagina.tekst("concept_waarschuwing");

  return (
    <Sectie>
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
        <p className="mt-5 text-lg text-muted">{pagina.tekst("inleiding")}</p>

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
    <Sectie>
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
        <p className="mt-5 text-lg text-muted">{pagina.tekst("inleiding")}</p>

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
    </Sectie>
  );
}

export function OverzichtInhoud({
  pagina,
  children,
}: {
  pagina: Pagina;
  children: React.ReactNode;
}) {
  const beeld = pagina.beeld("beeld");

  return (
    <Sectie>
      <SectieKop
        titel={pagina.tekst("titel")}
        inleiding={pagina.tekst("inleiding")}
      />

      {/* Een brede band, geen paginavullende foto: het beeld hoort de pagina
          te openen, niet te overstemmen. Blijft weg zolang er geen foto is
          gekozen, zodat de pagina niet met een gat begint. */}
      {beeld ? (
        <Image
          src={beeld.url}
          alt={beeld.alt}
          width={1600}
          height={520}
          className="mt-10 aspect-[16/5] w-full rounded-[var(--radius-card)] border border-line object-cover"
        />
      ) : null}

      <div className="mt-12">{children}</div>
    </Sectie>
  );
}
