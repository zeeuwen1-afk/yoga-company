import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { OverOnsInhoud } from "@/features/cms/paginas/eenvoudige-paginas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "YogaCompany is een opleidingsinstituut voor yoga. Kleine groepen, praktijkgericht, en een manier van kijken waarin yoga geen prestatie is.",
  alternates: { canonical: "/over-ons" },
};

export default async function OverOnsPage() {
  const pagina = await haalPagina("over-ons");
  return <OverOnsInhoud pagina={pagina} />;
}
