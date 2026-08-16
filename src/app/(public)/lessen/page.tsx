import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { haalRooster, Rooster } from "@/features/bookings";

// Het rooster verandert zodra iemand boekt, dus korter dan bij het aanbod.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Yogalessen en weekrooster",
  description:
    "Het weekrooster van de yogalessen bij YogaCompany. Kleine groepen, boeken kan met een account.",
  alternates: { canonical: "/lessen" },
};

export default async function LessenPage() {
  const [pagina, lessen] = await Promise.all([
    haalPagina("lessen"),
    haalRooster(),
  ]);

  return (
    <OverzichtInhoud pagina={pagina}>
      <Rooster lessen={lessen} />
    </OverzichtInhoud>
  );
}
