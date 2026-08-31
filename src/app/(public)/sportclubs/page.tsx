import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { OrganisatieInhoud } from "@/features/cms/paginas/organisatie-inhoud";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yoga bij je sportclub · herstel, mobiliteit en focus",
  description:
    "Yoga voor teams en individuele sporters: beweeglijkheid, herstel na de wedstrijd en ademhaling onder druk. In de kantine, de gymzaal of op het veld.",
  alternates: { canonical: "/sportclubs" },
};

export default async function SportclubsPage() {
  const pagina = await haalPagina("sportclubs");
  return <OrganisatieInhoud pagina={pagina} pageKey="sportclubs" />;
}
