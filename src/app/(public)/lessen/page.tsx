import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { OverzichtInhoud } from "@/features/cms/paginas/eenvoudige-paginas";
import { TarievenRail } from "@/features/cms/paginas/tarieven-inhoud";
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
  const [pagina, tarieven, lessen] = await Promise.all([
    haalPagina("lessen"),
    haalPagina("tarieven"),
    haalRooster(),
  ]);

  return (
    <OverzichtInhoud pagina={pagina}>
      {/* Het rooster is de plek waar iemand besluit te komen; de prijzen horen
          daar dus naast te staan en niet achter een extra klik. Op een smal
          scherm schuift het balkje onder het rooster; daar is naast elkaar
          geen optie, en boven het rooster zou de prijs vóór de les komen. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Rooster lessen={lessen} />
        <TarievenRail pagina={tarieven} />
      </div>
    </OverzichtInhoud>
  );
}
