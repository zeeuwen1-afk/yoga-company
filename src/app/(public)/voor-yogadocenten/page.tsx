import type { Metadata } from "next";
import Link from "next/link";

import { Richtext, Sectie } from "@/components/layout/sectie";
import { haalPagina } from "@/features/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Voor yogadocenten",
  description:
    "Geef je les bij Rinske Yoga Almere? Verkoop je eigen strippenkaarten, laat ze bij collega's gelden en reken maandelijks eerlijk met elkaar af.",
  alternates: { canonical: "/voor-yogadocenten" },
};

export default async function VoorYogadocentenPage() {
  const pagina = await haalPagina("voor-yogadocenten");

  return (
    <>
      <Sectie>
        <div className="max-w-2xl">
          <p className="text-sm tracking-[0.14em] text-muted uppercase">
            {pagina.tekst("locatie")}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <p className="mt-5 text-lg text-muted">{pagina.tekst("inleiding")}</p>

          <Richtext
            html={pagina.html("uitleg")}
            className="mt-10 [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:space-y-1"
          />

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/docenten"
              className="inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
            >
              Naar de docentenportal
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-lg border border-green px-7 font-semibold text-green transition-colors hover:bg-cream"
            >
              Vraag een aansluiting aan
            </Link>
          </div>
        </div>
      </Sectie>

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">{pagina.tekst("voorwaarden_titel")}</h2>
          <Richtext
            html={pagina.html("voorwaarden")}
            className="mt-4 text-[0.975rem]"
          />
        </div>
      </Sectie>
    </>
  );
}
