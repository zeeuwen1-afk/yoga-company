import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { PortfolioInhoud } from "@/features/cms/paginas/portfolio-inhoud";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const pagina = await haalPagina("portfolio");
  const naam = pagina.tekst("naam");

  return {
    title: `${naam} · portfolio`,
    description: `${pagina.tekst("rol")}. Werkervaring, opleidingen en specialisaties van ${naam}.`,
    alternates: { canonical: "/portfolio" },
  };
}

export default async function PortfolioPage() {
  const pagina = await haalPagina("portfolio");
  return <PortfolioInhoud pagina={pagina} />;
}
