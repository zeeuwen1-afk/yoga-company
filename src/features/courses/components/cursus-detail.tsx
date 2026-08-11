import Link from "next/link";

import { Sectie } from "@/components/layout/sectie";
import { formateerPrijs } from "../prijs";
import type { Cursus } from "../server/queries";

/** Markdown-achtige alinea's uit de database omzetten naar leesbare tekst. */
function Alineas({ tekst }: { tekst: string }) {
  return (
    <div className="space-y-4">
      {tekst
        .split("\n\n")
        .filter(Boolean)
        .map((alinea, index) => (
          <p key={index}>{alinea.replaceAll("**", "")}</p>
        ))}
    </div>
  );
}

function Feit({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">{waarde}</dd>
    </div>
  );
}

export function CursusDetail({ cursus }: { cursus: Cursus }) {
  const overzichtPad =
    cursus.type === "opleiding" ? "/opleidingen" : "/trainingen";
  const totaalUren = cursus.curriculum.reduce(
    (totaal, module) => totaal + module.uren,
    0,
  );

  return (
    <>
      {/* Kop met prijs en inschrijfknop ------------------------------------- */}
      <section className="border-b border-line bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <nav aria-label="Kruimelpad" className="text-sm text-muted">
            <Link href={overzichtPad} className="underline hover:text-green">
              {cursus.type === "opleiding" ? "Opleidingen" : "Trainingen"}
            </Link>
          </nav>

          <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl sm:text-5xl">{cursus.titel}</h1>
              <p className="mt-5 max-w-2xl text-lg text-muted">
                {cursus.samenvatting}
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 lg:w-72">
              <p className="font-serif text-3xl font-semibold text-green-dark">
                {formateerPrijs(cursus.prijsCenten)}
              </p>
              <p className="mt-1 text-sm text-muted">
                Betalen in termijnen is mogelijk — vraag ernaar.
              </p>
              <Link
                href={`/inschrijven/${cursus.slug}`}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-green font-semibold text-cream transition-colors hover:bg-green-dark"
              >
                Inschrijven
              </Link>
              <Link
                href="/contact"
                className="mt-3 inline-flex w-full justify-center text-sm text-muted underline hover:text-green"
              >
                Eerst een vraag stellen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Sectie>
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          {/* Hoofdtekst --------------------------------------------------- */}
          <div className="max-w-2xl">
            <Alineas tekst={cursus.beschrijving} />

            {cursus.voorWie ? (
              <>
                <h2 className="mt-12 text-2xl">Voor wie</h2>
                <p className="mt-4">{cursus.voorWie}</p>
              </>
            ) : null}

            {cursus.toelatingseisen ? (
              <>
                <h2 className="mt-12 text-2xl">Toelatingseisen</h2>
                <p className="mt-4">{cursus.toelatingseisen}</p>
              </>
            ) : null}

            {cursus.curriculum.length > 0 ? (
              <>
                <h2 className="mt-12 text-2xl">Curriculum</h2>
                <div className="mt-5 space-y-3">
                  {cursus.curriculum.map((module) => (
                    <details
                      key={module.nummer}
                      className="group rounded-[var(--radius-card)] border border-line"
                      // De eerste module staat open, zodat meteen zichtbaar is
                      // wat er in een module gebeurt.
                      open={module.nummer === cursus.curriculum[0]?.nummer}
                    >
                      <summary className="flex cursor-pointer items-baseline justify-between gap-4 p-5">
                        <span className="font-serif text-lg font-semibold text-green-dark">
                          {cursus.curriculum.length > 1
                            ? `Module ${module.nummer} — `
                            : null}
                          {module.titel}
                        </span>
                        <span className="shrink-0 text-sm text-muted">
                          {module.uren} uur
                        </span>
                      </summary>

                      <div className="border-t border-line p-5">
                        <p className="text-muted">{module.samenvatting}</p>
                        <ul className="mt-5 space-y-4">
                          {module.blokken.map((blok) => (
                            <li key={blok.titel}>
                              <p className="font-semibold">{blok.titel}</p>
                              <ul className="mt-1.5 space-y-1 text-[0.975rem] text-muted">
                                {blok.onderdelen.map((onderdeel) => (
                                  <li
                                    key={onderdeel}
                                    className="ml-5 list-disc"
                                  >
                                    {onderdeel}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Praktische gegevens ------------------------------------------ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--radius-card)] border border-line p-6">
              <h2 className="text-xl">Praktisch</h2>
              <dl className="mt-4">
                {totaalUren > 0 ? (
                  <Feit label="Omvang" waarde={`${totaalUren} uur`} />
                ) : null}
                {cursus.studiebelasting ? (
                  <Feit
                    label="Studiebelasting"
                    waarde={cursus.studiebelasting}
                  />
                ) : null}
                {cursus.locatie ? (
                  <Feit label="Locatie" waarde={cursus.locatie} />
                ) : null}
                {cursus.maxDeelnemers ? (
                  <Feit
                    label="Groepsgrootte"
                    waarde={`maximaal ${cursus.maxDeelnemers} deelnemers`}
                  />
                ) : null}
                {cursus.certificaat ? (
                  <Feit label="Certificering" waarde={cursus.certificaat} />
                ) : null}
                <Feit
                  label="Lesdata"
                  waarde="Neem contact op voor de eerstvolgende startdatum."
                />
              </dl>
            </div>
          </aside>
        </div>
      </Sectie>

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">Twijfel je of dit past?</h2>
          <p className="mt-4 text-lg text-muted">
            Stuur ons een bericht. We denken mee over wat aansluit bij waar je
            nu staat — zonder dat je ergens aan vastzit.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
          >
            Stel je vraag
          </Link>
        </div>
      </Sectie>
    </>
  );
}
