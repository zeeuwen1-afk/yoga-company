import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Richtext, Sectie } from "@/components/layout/sectie";
import { JURIDISCHE_TEKSTEN, vindJuridischeTekst } from "@/content/juridisch";
import { haalPagina } from "@/features/cms";

export const revalidate = 300;
export const dynamicParams = false;

/**
 * De drie juridische pagina's delen dezelfde opmaak (BOUWPROMPT §8.6).
 * `dynamicParams = false` zorgt dat alleen deze drie adressen bestaan; elk
 * ander pad valt door naar de 404-pagina.
 */
export function generateStaticParams() {
  return JURIDISCHE_TEKSTEN.map((tekst) => ({ juridisch: tekst.pageKey }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ juridisch: string }>;
}): Promise<Metadata> {
  const { juridisch } = await params;
  const tekst = vindJuridischeTekst(juridisch);

  if (!tekst) return { title: "Pagina niet gevonden" };

  return {
    title: tekst.titel,
    description: tekst.omschrijving,
    alternates: { canonical: `/${tekst.pageKey}` },
  };
}

export default async function JuridischePagina({
  params,
}: {
  params: Promise<{ juridisch: string }>;
}) {
  const { juridisch } = await params;

  if (!vindJuridischeTekst(juridisch)) notFound();

  const pagina = await haalPagina(juridisch);
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
