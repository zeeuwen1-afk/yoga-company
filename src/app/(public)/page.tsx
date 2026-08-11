import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { HomeInhoud } from "@/features/cms/paginas/home-inhoud";
import { haalAanbod } from "@/features/courses";

// Publieke pagina's worden statisch geserveerd en periodiek ververst, zodat een
// contentwijziging zichtbaar wordt zonder nieuwe uitrol (BOUWPROMPT §14).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yoga Companie — opleidingsinstituut voor yoga",
  description:
    "Yogaopleidingen en trainingen in kleine groepen. De 200-uurs Yin Yoga Specialist Opleiding, losse modules en het herstelprogramma Eerst Jij.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [pagina, opleidingen] = await Promise.all([
    haalPagina("home"),
    haalAanbod("opleiding"),
  ]);

  return <HomeInhoud pagina={pagina} opleidingen={opleidingen} />;
}
