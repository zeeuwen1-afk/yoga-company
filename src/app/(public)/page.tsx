import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { HomeInhoud } from "@/features/cms/paginas/home-inhoud";
import { haalAanbod } from "@/features/courses";

// Publieke pagina's worden statisch geserveerd en periodiek ververst, zodat een
// contentwijziging zichtbaar wordt zonder nieuwe uitrol (BOUWPROMPT §14).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "YogaCompany · opleidingsinstituut voor yoga",
  description:
    "Yogalessen in kleine groepen in Almere, workshops, korte trainingen en de 200-uurs Yin Yoga Specialist Opleiding. Bekijk het aanbod en de tarieven.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [pagina, opleidingen] = await Promise.all([
    haalPagina("home"),
    haalAanbod("opleiding"),
  ]);

  return (
    <>
      <HomeInhoud pagina={pagina} opleidingen={opleidingen} />
      <VrijeZone pageKey="home" />
    </>
  );
}
