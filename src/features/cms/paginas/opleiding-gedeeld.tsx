import { Richtext, Sectie } from "@/components/layout/sectie";
import { AanmeldFormulier } from "../components/aanmeld-formulier";
import { VrijeZone } from "./vrije-zone";
import type { Pagina } from "../server/queries";

/**
 * De blokken die op alle vijf de pagina's van de 200-uurs Yogaopleiding
 * terugkomen: de prijstabel, de praktische informatie, de inschrijfstappen en
 * de disclaimer.
 *
 * Ze staan één keer in de editor onder "Yogaopleiding · prijzen en praktisch",
 * en worden hier op elke pagina getoond. Vijf kopieën zouden betekenen dat een
 * prijswijziging op vijf plekken moet, en dan staat er een keer een verkeerd
 * bedrag op een pagina die niemand meer nakijkt.
 *
 * Elke sectie verdwijnt als hij leeg is, zodat de beheerder een blok kan
 * weghalen zonder dat er een lege strook overblijft.
 */

export type Prijsregel = {
  variant: string;
  inhoud: string;
  prijs: string;
};

export function OpleidingGedeeld({
  pagina,
  onderwerp,
  gekozenVariant,
}: {
  pagina: Pagina;
  /** Van welke pagina een aanmelding komt; staat bovenaan het bericht. */
  onderwerp: string;
  /** Wat er in het formulier voorgeselecteerd staat. */
  gekozenVariant?: string;
}) {
  const prijzen = pagina
    .lijst<Prijsregel>("prijzen")
    .filter((regel) => regel.variant?.trim());

  return (
    <>
      {prijzen.length > 0 ? (
        <>
          <Sectie sectie="prijzen" achtergrond="zand" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("prijzen_titel")}</h2>
            </div>

            {/* Op een breed scherm een tabel: de bedragen onder elkaar zijn
                juist waar het om gaat, want daarop vergelijk je. Op een
                telefoon zou die tabel uit het scherm lopen, dus daar wordt het
                een lijst met kaarten. */}
            <div className="mt-8 hidden overflow-x-auto md:block">
              <table className="w-full max-w-4xl border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 pr-6 font-semibold">
                      Variant
                    </th>
                    <th scope="col" className="py-3 pr-6 font-semibold">
                      Inhoud
                    </th>
                    <th scope="col" className="py-3 font-semibold">
                      Prijs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prijzen.map((regel, index) => (
                    <tr key={index} className="border-b border-line">
                      <th scope="row" className="py-3 pr-6 font-medium">
                        {regel.variant}
                      </th>
                      <td className="py-3 pr-6 text-muted">{regel.inhoud}</td>
                      <td className="py-3 font-semibold tabular-nums">
                        {regel.prijs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-8 grid max-w-2xl gap-3 md:hidden">
              {prijzen.map((regel, index) => (
                <li
                  key={index}
                  className="rounded-[var(--radius-card)] border border-line bg-background p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-semibold">{regel.variant}</h3>
                    <span className="font-semibold tabular-nums">
                      {regel.prijs}
                    </span>
                  </div>
                  {regel.inhoud ? (
                    <p className="mt-1 text-sm text-muted">{regel.inhoud}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <Richtext
              html={pagina.html("prijzen_voet")}
              className="mt-8 max-w-2xl text-[0.975rem]"
            />
          </Sectie>
          <VrijeZone pageKey="yogaopleiding-gedeeld" sectie="prijzen" />
        </>
      ) : null}

      {pagina.html("praktisch_tekst") ? (
        <>
          <Sectie sectie="praktisch" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("praktisch_titel")}</h2>
              <Richtext
                html={pagina.html("praktisch_tekst")}
                className="mt-6 text-lg"
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding-gedeeld" sectie="praktisch" />
        </>
      ) : null}

      {pagina.html("inschrijven_tekst") ? (
        <>
          <Sectie sectie="inschrijven" achtergrond="creme" lijnBoven>
            <div className="max-w-2xl">
              <h2 className="text-3xl">{pagina.tekst("inschrijven_titel")}</h2>
              <Richtext
                html={pagina.html("inschrijven_tekst")}
                className="mt-6 text-lg"
              />
            </div>

            {/* Het anker waar elke [Schrijf je in]-knop naartoe springt. */}
            <div id="aanmelden" className="mt-10 max-w-2xl scroll-mt-24">
              <AanmeldFormulier
                onderwerp={onderwerp}
                varianten={prijzen.map((regel) => regel.variant)}
                gekozen={gekozenVariant}
              />
            </div>
          </Sectie>
          <VrijeZone pageKey="yogaopleiding-gedeeld" sectie="inschrijven" />
        </>
      ) : null}

      {pagina.tekst("disclaimer") ? (
        <Sectie sectie="disclaimer" lijnBoven className="!py-8">
          <p className="max-w-3xl text-sm text-muted">
            {pagina.tekst("disclaimer")}
          </p>
        </Sectie>
      ) : null}
    </>
  );
}
