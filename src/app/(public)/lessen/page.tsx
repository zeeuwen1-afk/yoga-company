import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yogalessen",
  description:
    "Waar Wietske Visser lesgeeft, en hoe je een proefles boekt bij die school.",
  alternates: { canonical: "/lessen" },
};

export default async function LessenPage() {
  const pagina = await haalPagina("lessen");

  return (
    <>
      {/* Geen weekrooster meer. Er stond nooit een les in — nul lessen, nul
          boekingen — en de pagina meldde dus alleen dat het rooster leeg was.
          Wat hier telt is waar Wietske lesgeeft en hoe je daar een proefles
          boekt; dat staat in de tekst uit de editor. */}
      <OverzichtInhoud pagina={pagina} pageKey="lessen" />
      <VrijeZone pageKey="lessen" />
    </>
  );
}
