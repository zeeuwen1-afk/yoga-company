import type { Metadata } from "next";

import { haalPagina } from "@/features/cms";
import { HomeInhoud } from "@/features/cms/paginas/home-inhoud";
import { haalAanbod } from "@/features/courses";
import { haalRooster } from "@/features/bookings";

// Publieke pagina's worden statisch geserveerd en periodiek ververst, zodat een
// contentwijziging zichtbaar wordt zonder nieuwe uitrol (BOUWPROMPT §14).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "YogaCompany — opleidingsinstituut voor yoga",
  description:
    "Yogalessen in kleine groepen in Almere, korte trainingen en de 200-uurs Yin Yoga Specialist Opleiding. Bekijk het rooster, de tarieven en het aanbod.",
  alternates: { canonical: "/" },
};

/** Hoeveel lessen er op de startpagina passen zonder dat het een rooster wordt. */
const LESSEN_OP_DE_STARTPAGINA = 4;

export default async function HomePage() {
  const [pagina, tarievenPagina, opleidingen, lessen] = await Promise.all([
    haalPagina("home"),
    haalPagina("tarieven"),
    haalAanbod("opleiding"),
    haalRooster(7),
  ]);

  return (
    <HomeInhoud
      pagina={pagina}
      tarievenPagina={tarievenPagina}
      opleidingen={opleidingen}
      lessen={lessen
        .filter((les) => !les.afgelastOp)
        .slice(0, LESSEN_OP_DE_STARTPAGINA)}
    />
  );
}
