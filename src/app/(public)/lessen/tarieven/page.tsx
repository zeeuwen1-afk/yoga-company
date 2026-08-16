import type { Metadata } from "next";

import { TARIEVEN_OMSCHRIJVING, TARIEVEN_TITEL } from "@/content/tarieven";
import { haalPagina } from "@/features/cms";
import { TarievenInhoud } from "@/features/cms/paginas/tarieven-inhoud";

export const revalidate = 300;

export const metadata: Metadata = {
  title: TARIEVEN_TITEL,
  description: TARIEVEN_OMSCHRIJVING,
  alternates: { canonical: "/lessen/tarieven" },
};

export default async function TarievenPage() {
  const pagina = await haalPagina("tarieven");
  return <TarievenInhoud pagina={pagina} />;
}
