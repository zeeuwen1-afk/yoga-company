import Link from "next/link";

import { Richtext, Sectie } from "@/components/layout/sectie";
import { aangezet, type Tarief } from "@/content/tarieven";
import type { Pagina } from "../server/queries";

/**
 * De tarievenpagina en het zijbalkje naast het weekrooster (§8.2).
 *
 * Allebei lezen ze dezelfde lijst uit `content_blocks`; het zijbalkje toont
 * daarvan de regels die op "ja" staan. Zo kan de prijslijst nooit op twee
 * plekken verschillend staan.
 */

function aanvraagPad(index: number) {
  return `/lessen/tarieven/aanvragen?kaart=${index}`;
}

/** De knop die op elke regel staat. Op de tabelregels compact, eronder breed. */
function AanvraagKnop({
  index,
  naam,
  nadruk,
  breed = false,
}: {
  index: number;
  naam: string;
  nadruk: boolean;
  breed?: boolean;
}) {
  return (
    <Link
      href={aanvraagPad(index)}
      className={[
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors",
        breed ? "w-full" : "",
        nadruk
          ? "bg-primary text-primary-foreground hover:bg-accent-light"
          : "border border-green text-green hover:bg-hover",
      ].join(" ")}
    >
      Aanvragen
      <span className="sr-only"> — {naam}</span>
    </Link>
  );
}

export function TarievenInhoud({ pagina }: { pagina: Pagina }) {
  const tarieven = pagina.lijst<Tarief>("tarieven");
  const locatie = pagina.tekst("locatie");

  return (
    <Sectie>
      <div className="max-w-4xl">
        {locatie ? (
          <p className="text-sm tracking-[0.14em] text-muted uppercase">
            {locatie}
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          {pagina.tekst("inleiding")}
        </p>

        {/* Op een breed scherm een tabel: de kolommen naast elkaar zijn juist
            waar het om gaat, want daarop vergelijk je. Op een telefoon zou die
            tabel horizontaal moeten schuiven, en dan vergelijkt niemand meer —
            daar wordt het een lijst met dezelfde gegevens onder elkaar. */}
        <div className="mt-12 hidden overflow-hidden rounded-[var(--radius-card)] border border-line sm:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Tarieven voor de yogalessen, met de prijs per les en de
              geldigheidsduur
            </caption>
            <thead>
              <tr className="border-b border-line bg-cream">
                <th scope="col" className="px-5 py-3 text-sm font-semibold">
                  Kaart
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-sm font-semibold"
                >
                  Prijs
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-sm font-semibold"
                >
                  Per les
                </th>
                <th scope="col" className="px-5 py-3 text-sm font-semibold">
                  Geldig
                </th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only">Aanvragen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tarieven.map((tarief, index) => {
                const nadruk = aangezet(tarief.uitgelicht);
                return (
                  <tr
                    key={index}
                    className={`border-b border-line last:border-0 ${
                      nadruk ? "bg-hover" : ""
                    }`}
                  >
                    <th scope="row" className="px-5 py-4 font-normal">
                      <span className="font-semibold">{tarief.naam}</span>
                      {nadruk ? (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-primary-foreground uppercase">
                          Meest gekozen
                        </span>
                      ) : null}
                      {tarief.toelichting ? (
                        <span className="mt-0.5 block text-sm text-muted">
                          {tarief.toelichting}
                        </span>
                      ) : null}
                    </th>
                    {/* Bewust niet in de schreefletter, die elders wel voor
                        prijzen wordt gebruikt: Cormorant zet cijfers als
                        mediëvalcijfers, met wisselende hoogte. Naast elkaar in
                        een kolom lijnen die niet uit, en juist het vergelijken
                        is hier het punt. */}
                    <td className="px-5 py-4 text-right text-lg font-semibold tabular-nums">
                      {tarief.prijs}
                    </td>
                    <td className="px-5 py-4 text-right text-muted tabular-nums">
                      {tarief.per_les}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {tarief.geldig}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <AanvraagKnop
                        index={index}
                        naam={tarief.naam}
                        nadruk={nadruk}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-10 space-y-4 sm:hidden">
          {tarieven.map((tarief, index) => {
            const nadruk = aangezet(tarief.uitgelicht);
            return (
              <li
                key={index}
                className={`rounded-[var(--radius-card)] border p-5 ${
                  nadruk ? "border-accent bg-hover" : "border-line"
                }`}
              >
                {nadruk ? (
                  <p className="mb-2 text-[0.7rem] font-semibold tracking-wide text-green uppercase">
                    Meest gekozen
                  </p>
                ) : null}
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold">{tarief.naam}</h2>
                  <span className="text-lg font-semibold tabular-nums">
                    {tarief.prijs}
                  </span>
                </div>
                {tarief.toelichting ? (
                  <p className="mt-1 text-sm text-muted">
                    {tarief.toelichting}
                  </p>
                ) : null}
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                  <div className="flex gap-1.5">
                    <dt>Per les</dt>
                    <dd className="tabular-nums">{tarief.per_les}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt>Geldig</dt>
                    <dd>{tarief.geldig}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <AanvraagKnop
                    index={index}
                    naam={tarief.naam}
                    nadruk={nadruk}
                    breed
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 rounded-[var(--radius-card)] border border-sand bg-sand-light p-5">
          <h2 className="text-lg">Goed om te weten</h2>
          <Richtext
            html={pagina.html("voorwaarden")}
            className="mt-2 text-[0.975rem]"
          />
        </div>
      </div>
    </Sectie>
  );
}

/**
 * Het zijbalkje naast het weekrooster op /lessen.
 *
 * Toont alleen de regels die in de editor op "ja" staan. Staat er niets aan,
 * dan verdwijnt het balkje in plaats van dat er een leeg kader blijft staan.
 */
export function TarievenRail({ pagina }: { pagina: Pagina }) {
  const regels = pagina
    .lijst<Tarief>("tarieven")
    .map((tarief, index) => ({ tarief, index }))
    .filter(({ tarief }) => aangezet(tarief.rail));

  if (regels.length === 0) return null;

  return (
    <aside className="rounded-[var(--radius-card)] border border-line bg-cream p-5 lg:sticky lg:top-24">
      <h2 className="text-xl">{pagina.tekst("rail_titel")}</h2>

      <dl className="mt-4 divide-y divide-line border-y border-line">
        {regels.map(({ tarief, index }) => (
          <div
            key={index}
            className="flex items-baseline justify-between gap-3 py-2.5 text-[0.95rem]"
          >
            <dt>{tarief.naam}</dt>
            <dd className="font-semibold tabular-nums">{tarief.prijs}</dd>
          </div>
        ))}
      </dl>

      <Link
        href="/lessen/tarieven"
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
      >
        Kaart kopen
      </Link>

      <p className="mt-3 text-sm text-muted">{pagina.tekst("rail_voet")}</p>
    </aside>
  );
}
