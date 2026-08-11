import type { Metadata } from "next";

import { Sectie, SectieKop } from "@/components/layout/sectie";
import { haalPagina } from "@/features/cms";
import { haalAanbod } from "@/features/courses";
import { CursusRooster } from "@/features/courses/components/cursus-kaart";

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
    <Sectie>
      <SectieKop
        titel={pagina.tekst("titel")}
        inleiding={pagina.tekst("inleiding")}
      />
      <div className="mt-12">
        <CursusRooster cursussen={trainingen} />
      </div>
    </Sectie>
  );
}
