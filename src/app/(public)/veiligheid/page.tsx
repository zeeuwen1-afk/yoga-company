import type { Metadata } from "next";

import {
  VEILIGHEID_OMSCHRIJVING,
  VEILIGHEID_TITEL,
} from "@/content/veiligheid";
import { haalPagina } from "@/features/cms";
import { VeiligheidInhoud } from "@/features/cms/paginas/eenvoudige-paginas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: VEILIGHEID_TITEL,
  description: VEILIGHEID_OMSCHRIJVING,
  alternates: { canonical: "/veiligheid" },
};

export default async function VeiligheidPage() {
  const pagina = await haalPagina("veiligheid");
  return <VeiligheidInhoud pagina={pagina} />;
}
