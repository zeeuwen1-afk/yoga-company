import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { AcademyInhoud } from "@/features/cms/paginas/academy-inhoud";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Waar de Yoga Company Academy voor staat",
  description:
    "Kleine groepen, ervaren docenten en een certificaat van de Yoga Company Academy per module. Wat de drie niveaus betekenen en wat het certificaat inhoudt.",
  alternates: { canonical: "/opleidingen/academy" },
};

/**
 * Een vaste map onder /opleidingen, net als de 200-uurs Yogaopleiding: die
 * wint van de dynamische cursusroute, en "academy" is geen cursus.
 */
export default async function AcademyPage() {
  const pagina = await haalPagina("academy");

  return (
    <>
      <AcademyInhoud pagina={pagina} />
      <VrijeZone pageKey="academy" />
    </>
  );
}
