import type { Metadata } from "next";

import { VoorYogadocentenInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Voor yogadocenten",
  description:
    "Verkoop je eigen strippenkaarten, laat ze bij collega's gelden en reken maandelijks eerlijk met elkaar af.",
  alternates: { canonical: "/voor-yogadocenten" },
};

export default async function VoorYogadocentenPage() {
  const pagina = await haalPagina("voor-yogadocenten");

  return (
    <>
      <VoorYogadocentenInhoud pagina={pagina} />
      <VrijeZone pageKey="voor-yogadocenten" />
    </>
  );
}
