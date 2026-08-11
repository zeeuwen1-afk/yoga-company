import type { Metadata } from "next";

import { Sectie } from "@/components/layout/sectie";
import { haalPagina } from "@/features/cms";
import { ContactFormulier } from "@/features/cms/components/contact-formulier";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Een vraag over een yogaopleiding of training? Stuur Yoga Companie een bericht — we reageren meestal binnen twee werkdagen.",
  alternates: { canonical: "/contact" },
};

type Gegeven = { label: string; waarde: string };

export default async function ContactPage() {
  const pagina = await haalPagina("contact");
  const gegevens = pagina.lijst<Gegeven>("gegevens");

  return (
    <Sectie>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <div>
          <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <p className="mt-5 text-lg text-muted">{pagina.tekst("inleiding")}</p>

          <div className="mt-10">
            <ContactFormulier />
          </div>
        </div>

        {gegevens.length > 0 ? (
          <aside className="lg:pt-24">
            <div className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
              <h2 className="text-xl">Rechtstreeks contact</h2>
              <dl className="mt-4 space-y-3">
                {gegevens.map((gegeven) => (
                  <div key={gegeven.label}>
                    <dt className="text-sm text-muted">{gegeven.label}</dt>
                    <dd className="mt-0.5">{gegeven.waarde}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        ) : null}
      </div>
    </Sectie>
  );
}
