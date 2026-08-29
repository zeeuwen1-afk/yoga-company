import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { BedrijfsyogaInhoud } from "@/features/cms/paginas/bedrijfsyoga-inhoud";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bedrijfsyoga — yoga op de werkvloer",
  description:
    "Vaste yogalessen op kantoor of online, een workshop op een teamdag, of een programma rond werkdruk en herstel. Voor teams die er even uit willen zonder de deur uit te gaan.",
  alternates: { canonical: "/bedrijfsyoga" },
};

export default async function BedrijfsyogaPage() {
  const pagina = await haalPagina("bedrijfsyoga");
  return <BedrijfsyogaInhoud pagina={pagina} />;
}
