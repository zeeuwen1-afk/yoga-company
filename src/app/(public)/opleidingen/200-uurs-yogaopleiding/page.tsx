import type { Metadata } from "next";

import {
  OPLEIDING_SEO_OMSCHRIJVING,
  OPLEIDING_SEO_TITEL,
} from "@/content/yogaopleiding-200";
import { haalPagina } from "@/features/cms";
import { YogaopleidingInhoud } from "@/features/cms/paginas/yogaopleiding-inhoud";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";

export const revalidate = 300;

export const metadata: Metadata = {
  title: OPLEIDING_SEO_TITEL,
  description: OPLEIDING_SEO_OMSCHRIJVING,
  alternates: { canonical: "/opleidingen/200-uurs-yogaopleiding" },
};

export default async function YogaopleidingPage() {
  // De prijzen en de praktische informatie staan op een eigen paginasleutel,
  // omdat ze op alle vijf de pagina's van deze opleiding terugkomen.
  const [pagina, gedeeld] = await Promise.all([
    haalPagina("yogaopleiding"),
    haalPagina("yogaopleiding-gedeeld"),
  ]);

  return (
    <>
      <YogaopleidingInhoud pagina={pagina} gedeeld={gedeeld} />
      <VrijeZone pageKey="yogaopleiding" />
    </>
  );
}
