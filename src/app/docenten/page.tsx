import type { Metadata } from "next";

import {
  haalAfboekingen,
  haalConceptfacturen,
  haalMaandcijfers,
  haalProducten,
  KaartUitgeven,
  MaandAfsluiten,
} from "@/features/docenten";

export const metadata: Metadata = {
  title: "Docentenportal",
  robots: { index: false, follow: false },
};

// De cijfers veranderen bij elke boeking; deze pagina hoort dus niet gecachet
// te worden.
export const dynamic = "force-dynamic";

const MAANDEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

function euro(centen: number) {
  return `€ ${(centen / 100).toFixed(2).replace(".", ",")}`;
}

function Getal({
  label,
  waarde,
  onder,
  kleur,
  nadruk = false,
}: {
  label: string;
  waarde: string;
  onder: string;
  kleur?: string;
  nadruk?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border p-4 ${
        nadruk ? "border-sand bg-sand-light" : "border-line bg-background"
      }`}
    >
      <p className="text-[0.7rem] font-semibold tracking-wider text-muted uppercase">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-semibold tabular-nums ${kleur ?? ""}`}
      >
        {waarde}
      </p>
      <p className="mt-0.5 text-sm text-muted">{onder}</p>
    </div>
  );
}

export default async function DocentenPage() {
  const nu = new Date();
  // De maand die je afsluit is de vorige: de lopende maand kan nog lessen
  // krijgen die anders niet op de factuur passen.
  const vorige = new Date(
    Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth() - 1, 1),
  );
  const periode = vorige.toISOString().slice(0, 10);
  const maandnaam = `${MAANDEN[vorige.getUTCMonth()]} ${vorige.getUTCFullYear()}`;

  const [cijfers, afboekingen, concepten, producten] = await Promise.all([
    haalMaandcijfers(nu),
    haalAfboekingen(nu),
    haalConceptfacturen(vorige),
    haalProducten(),
  ]);

  const teFacturerenVorige = concepten.reduce(
    (som, c) => som + c.subtotaalCenten,
    0,
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[0.7rem] font-semibold tracking-wider text-muted uppercase">
          {MAANDEN[nu.getUTCMonth()]} {nu.getUTCFullYear()}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Jouw maand</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Getal
          label="Verkocht"
          waarde={euro(cijfers.verkochtCenten)}
          onder={`${cijfers.aantalVerkocht} ${cijfers.aantalVerkocht === 1 ? "kaart" : "kaarten"}`}
        />
        <Getal
          label="Openstaande verplichting"
          waarde={euro(cijfers.verplichtingCenten)}
          onder={`${cijfers.openStrippen} strippen nog te geven`}
          nadruk
        />
        <Getal
          label="Te factureren"
          waarde={euro(cijfers.teFacturerenCenten)}
          onder={`${cijfers.teFacturerenLessen} lessen van collega's`}
          kleur="text-success"
        />
        <Getal
          label="Te ontvangen facturen"
          waarde={euro(cijfers.teOntvangenCenten)}
          onder={`${cijfers.teOntvangenLessen} lessen bij collega's`}
          kleur="text-error"
        />
      </div>

      <p className="max-w-2xl text-sm text-muted">
        <strong className="text-ink">Openstaande verplichting</strong> is geen
        omzet maar een schuld: geld dat je al hebt ontvangen voor lessen die je
        nog moet geven. Het bedrag staat exclusief btw, want dat is het deel dat
        werkelijk van jou is.
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section>
          <h2 className="text-2xl">Afboekingen op jouw kaarten</h2>
          <p className="mt-1 text-sm text-muted">
            Alleen kaarten die jij hebt verkocht. Waar ze zijn gebruikt zie je
            erbij.
          </p>

          {afboekingen.length === 0 ? (
            <p className="mt-6 rounded-[var(--radius-card)] border border-line bg-background p-6 text-muted">
              Deze maand is er nog niets afgeboekt.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-line">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-cream">
                    <th className="px-4 py-2.5 font-semibold">Datum</th>
                    <th className="px-4 py-2.5 font-semibold">Klant</th>
                    <th className="px-4 py-2.5 font-semibold">Kaart</th>
                    <th className="px-4 py-2.5 font-semibold">Les door</th>
                    <th className="px-4 py-2.5 text-right font-semibold">
                      Excl. btw
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {afboekingen.map((rij) => (
                    <tr
                      key={rij.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(rij.datum).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">{rij.klant}</td>
                      <td className="px-4 py-3">{rij.kaart}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            rij.isEigen
                              ? "bg-cream text-green-dark"
                              : "bg-sand-light text-[#7a5220]"
                          }`}
                        >
                          {rij.docent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {rij.bedragCenten === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span className="text-error">
                            {euro(rij.bedragCenten)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl">{maandnaam} afsluiten</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Je factureert {euro(teFacturerenVorige)} aan{" "}
              {concepten.length === 1
                ? "één collega"
                : `${concepten.length} collega's`}
              .
            </p>
            <MaandAfsluiten
              periode={periode}
              maandnaam={maandnaam}
              teFactureren={teFacturerenVorige}
            />
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-[var(--radius-card)] border border-line bg-background p-5">
            <h2 className="text-xl">Kaart uitgeven</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Iemand heeft bij je betaald? Leg de kaart hier vast.
            </p>
            <KaartUitgeven producten={producten} />
          </section>

          {concepten.length > 0 ? (
            <section className="rounded-[var(--radius-card)] border border-line bg-background p-5">
              <h2 className="text-xl">Conceptfacturen {maandnaam}</h2>
              <ul className="mt-4 space-y-4">
                {concepten.map((concept) => (
                  <li
                    key={concept.collegaId}
                    className="border-t border-line pt-3 first:border-0 first:pt-0"
                  >
                    <p className="font-semibold">{concept.naam}</p>
                    <ul className="mt-1 space-y-0.5 text-sm text-muted">
                      {concept.regels.map((regel) => (
                        <li
                          key={regel.kaart}
                          className="flex justify-between gap-3"
                        >
                          <span>
                            {regel.aantal}× {regel.kaart}
                          </span>
                          <span className="tabular-nums">
                            {euro(regel.centen)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 flex justify-between gap-3 text-sm font-semibold">
                      <span>Subtotaal</span>
                      <span className="tabular-nums">
                        {euro(concept.subtotaalCenten)}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">
                Btw komt erbij bij het afsluiten, met het tarief uit je eigen
                factuurgegevens.
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
