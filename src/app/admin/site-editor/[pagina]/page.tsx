import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { BlokBewerker } from "@/features/cms/components/blok-bewerker";
import { PubliceerBalk } from "@/features/cms/components/publiceer-balk";
import { haalEditorPagina } from "@/features/cms/server/editor";

export const metadata: Metadata = {
  title: "Pagina bewerken",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Bewerkscherm met live-voorvertoning (BOUWPROMPT §14).
 *
 * Links de blokken, rechts de pagina zoals hij wordt. De voorvertoning draait
 * op dezelfde origin in een iframe; de securityheader `frame-ancestors 'self'`
 * staat dat toe en houdt andere sites buiten (§17.2).
 */
export default async function PaginaBewerkenPage({
  params,
}: {
  params: Promise<{ pagina: string }>;
}) {
  const { pagina: pageKey } = await params;
  const pagina = await haalEditorPagina(pageKey);

  if (!pagina) notFound();

  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/site-editor", label: "Site-editor" }}
        titel={pagina.titel}
        toelichting="Wijzigingen worden als concept bewaard tot je publiceert."
      />

      <div className="mb-6 rounded-[var(--radius-card)] border border-line bg-white p-5">
        <PubliceerBalk
          pageKey={pagina.pageKey}
          aantalConcepten={pagina.aantalConcepten}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Paneel titel="Inhoud">
          {pagina.blokken.map((blok) => (
            <BlokBewerker
              key={blok.blockKey}
              pageKey={blok.pageKey}
              blockKey={blok.blockKey}
              kind={blok.kind}
              omschrijving={blok.omschrijving}
              gepubliceerd={blok.gepubliceerd}
              concept={blok.concept}
              verbergbaar={blok.verbergbaar}
              zichtbaarNaPubliceren={blok.zichtbaarNaPubliceren}
            />
          ))}
        </Paneel>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <Paneel titel="Voorvertoning">
            <div className="p-3">
              <iframe
                key={pagina.aantalConcepten}
                src={`/voorbeeld/${pagina.pageKey}`}
                title={`Voorvertoning van ${pagina.titel}`}
                className="h-[42rem] w-full rounded-lg border border-line bg-white"
              />
            </div>
            <p className="border-t border-line px-5 py-3 text-sm text-muted">
              Zo wordt de pagina na publiceren. Sla een wijziging op om de
              voorvertoning te verversen.
            </p>
          </Paneel>
        </div>
      </div>
    </>
  );
}
