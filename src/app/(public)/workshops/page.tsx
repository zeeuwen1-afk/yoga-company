import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { CursusRooster, haalAanbod } from "@/features/courses";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Losse workshops en dagprogramma's van YogaCompany. Een dag om te vertragen, in een kleine groep.",
  alternates: { canonical: "/workshops" },
};

export default async function WorkshopsPage() {
  const [pagina, workshops] = await Promise.all([
    haalPagina("workshops"),
    haalAanbod("workshop"),
  ]);

  return (
    <>
      <OverzichtInhoud pagina={pagina} pageKey="workshops">
        <CursusRooster cursussen={workshops} />
      </OverzichtInhoud>
      <VrijeZone pageKey="workshops" />
    </>
  );
}
