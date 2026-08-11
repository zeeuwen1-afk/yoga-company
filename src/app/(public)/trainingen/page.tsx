import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { CursusRooster, haalAanbod } from "@/features/courses";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trainingen",
  description:
    "Kortere programma's rond één onderwerp: het 8-weekse herstelprogramma Eerst Jij en de hormoonyoga-training.",
  alternates: { canonical: "/trainingen" },
};

export default async function TrainingenPage() {
  const [pagina, trainingen] = await Promise.all([
    haalPagina("trainingen"),
    haalAanbod("training"),
  ]);

  return (
    <OverzichtInhoud pagina={pagina}>
      <CursusRooster cursussen={trainingen} />
    </OverzichtInhoud>
  );
}
