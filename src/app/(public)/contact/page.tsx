import type { Metadata } from "next";

import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalPagina } from "@/features/cms";
import { ContactInhoud } from "@/features/cms/paginas/eenvoudige-paginas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Een vraag over een yogaopleiding of training? Stuur YogaCompany een bericht; we reageren meestal binnen twee werkdagen.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const pagina = await haalPagina("contact");
  return (
    <>
      <ContactInhoud pagina={pagina} />
      <VrijeZone pageKey="contact" />
    </>
  );
}
