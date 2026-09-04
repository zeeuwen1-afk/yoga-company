import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { CursusRooster, haalAanbod } from "@/features/courses";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yogaopleidingen",
  description:
    "De 200-uurs Yin Yoga Specialist Opleiding en de vier losse modules. Kleine groepen, certificaat per module, praktijkgericht.",
  alternates: { canonical: "/opleidingen" },
};

export default async function OpleidingenPage() {
  const [pagina, opleidingen] = await Promise.all([
    haalPagina("opleidingen"),
    haalAanbod("opleiding"),
  ]);

  return (
    <>
      <OverzichtInhoud pagina={pagina}>
        <CursusRooster cursussen={opleidingen} />
      </OverzichtInhoud>
      <VrijeZone pageKey="opleidingen" />
    </>
  );
}
