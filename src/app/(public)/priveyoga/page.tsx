import type { Metadata } from "next";

import { TARIEVEN_OMSCHRIJVING, TARIEVEN_TITEL } from "@/content/tarieven";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { TarievenInhoud } from "@/features/cms/paginas/tarieven-inhoud";

export const revalidate = 300;

export const metadata: Metadata = {
  title: TARIEVEN_TITEL,
  description: TARIEVEN_OMSCHRIJVING,
  alternates: { canonical: "/priveyoga" },
};

/**
 * Privéyoga: wat het kost en hoe het werkt.
 *
 * Stond tot september 2026 op /lessen/tarieven en heette daar "Lessen,
 * workshops en privéyoga". Er stonden drie dingen op die elders beter thuis
 * zijn: de lessen die Wietske bij yogascholen geeft, een doorverwijzing naar de
 * workshops, en een blok voor organisaties dat ook in de menubalk staat. Wat
 * overblijft is wat ze zelf aanbiedt, met de prijzen erbij.
 *
 * Het adres verhuisde mee, want "lessen/tarieven" in de adresbalk klopte niet
 * meer met een pagina die alleen over privéyoga gaat. Het oude adres stuurt
 * permanent door; zie de redirect in next.config.ts.
 *
 * De blokken heten nog `tarieven`. Dat is met opzet: de beheerder heeft die
 * teksten zelf ingevuld, en ze hernoemen zou betekenen dat hij ze opnieuw moet
 * typen.
 */
export default async function PriveyogaPage() {
  const pagina = await haalPagina("tarieven");
  return (
    <>
      <TarievenInhoud pagina={pagina} />
      <VrijeZone pageKey="tarieven" />
    </>
  );
}
