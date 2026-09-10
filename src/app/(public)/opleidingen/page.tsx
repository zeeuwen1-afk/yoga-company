import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { haalAanbod } from "@/features/courses";
import { Academie } from "@/features/courses/components/academie";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yoga Company Academy · yogaopleidingen",
  description:
    "De 200-uurs Yogaopleiding, de 200-uurs Yin Yoga Specialist Opleiding en de losse modules. Kleine groepen, certificaat per module, praktijkgericht.",
  alternates: { canonical: "/opleidingen" },
};

export default async function OpleidingenPage() {
  const [pagina, opleidingen] = await Promise.all([
    haalPagina("opleidingen"),
    haalAanbod("opleiding"),
  ]);

  return (
    <>
      <OverzichtInhoud pagina={pagina} pageKey="opleidingen">
        <Academie cursussen={opleidingen} />
      </OverzichtInhoud>
      <VrijeZone pageKey="opleidingen" />
    </>
  );
}
