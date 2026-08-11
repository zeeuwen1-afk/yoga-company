import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JURIDISCHE_TEKSTEN, vindJuridischeTekst } from "@/content/juridisch";
import { haalPagina } from "@/features/cms";
import { JuridischeInhoud } from "@/features/cms/paginas/eenvoudige-paginas";

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
  return <JuridischeInhoud pagina={pagina} />;
}
