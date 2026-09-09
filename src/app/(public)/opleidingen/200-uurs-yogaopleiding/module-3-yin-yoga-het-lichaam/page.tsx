import type { Metadata } from "next";

import { MODULEPAGINAS } from "@/content/yogaopleiding-200";
import { haalPagina } from "@/features/cms";
import { ModuleInhoud } from "@/features/cms/paginas/module-inhoud";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";

const MODULE = MODULEPAGINAS[2]!;

export const revalidate = 300;

export const metadata: Metadata = {
  title: MODULE.seoTitel,
  description: MODULE.seoOmschrijving,
  alternates: {
    canonical: `/opleidingen/200-uurs-yogaopleiding/${MODULE.segment}`,
  },
};

export default async function ModulePage() {
  const [pagina, gedeeld] = await Promise.all([
    haalPagina("yogaopleiding-module-3"),
    haalPagina("yogaopleiding-gedeeld"),
  ]);

  return (
    <>
      <ModuleInhoud pagina={pagina} gedeeld={gedeeld} />
      <VrijeZone pageKey="yogaopleiding-module-3" />
    </>
  );
}
