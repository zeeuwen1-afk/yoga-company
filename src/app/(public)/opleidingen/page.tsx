import type { Metadata } from "next";

import { Sectie, SectieKop } from "@/components/layout/sectie";
import { haalPagina } from "@/features/cms";
import { haalAanbod } from "@/features/courses";
import { CursusRooster } from "@/features/courses/components/cursus-kaart";

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
    <Sectie>
      <SectieKop
        titel={pagina.tekst("titel")}
        inleiding={pagina.tekst("inleiding")}
      />
      <div className="mt-12">
        <CursusRooster cursussen={opleidingen} />
      </div>
    </Sectie>
  );
}
