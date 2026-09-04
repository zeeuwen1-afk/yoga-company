import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { OrganisatieInhoud } from "@/features/cms/paginas/organisatie-inhoud";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yoga in het onderwijs · voortgezet, mbo en hoger",
  description:
    "Yoga in het voortgezet onderwijs, op het mbo en in het hoger onderwijs. In het eigen lokaal, binnen een lesuur, zonder omkleden. Ook voor het docenten- en medewerkersteam.",
  alternates: { canonical: "/onderwijs" },
};

export default async function OnderwijsPage() {
  const pagina = await haalPagina("onderwijs");
  return (
    <>
      <OrganisatieInhoud pagina={pagina} pageKey="onderwijs" />
      <VrijeZone pageKey="onderwijs" />
    </>
  );
}
