import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { BlokkenPaneel } from "@/features/cms/components/blokken-paneel";
import { PubliceerBalk } from "@/features/cms/components/publiceer-balk";
import { ELDERS_BEHEERD } from "@/features/cms/elders-beheerd";
import { heeftVrijeBlokken } from "@/content/vrije-blokken";
import { VrijeBlokkenPaneel } from "@/features/cms/components/vrije-blokken-paneel";
import { haalEditorPagina } from "@/features/cms/server/editor";
import { haalVrijeBlokkenVoorEditor } from "@/features/cms/server/vrije-blokken";

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

  const elders = ELDERS_BEHEERD[pageKey];
  const vrijeBlokken = await haalVrijeBlokkenVoorEditor(pageKey);

  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/site-editor", label: "Site-editor" }}
        titel={pagina.titel}
        toelichting="Wijzigingen worden als concept bewaard tot je publiceert."
      />

      {elders ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-sand bg-sand-light p-5">
          <p className="max-w-prose text-sm">
            <Info
              className="mr-1.5 inline size-4 align-text-bottom"
              aria-hidden
            />
            {elders.wat}
          </p>
          <Link
            href={elders.href}
            className="inline-flex h-11 shrink-0 items-center rounded-lg border border-line bg-background px-5 font-semibold transition-colors hover:bg-hover"
          >
            {elders.knop}
          </Link>
        </div>
      ) : null}

      <div className="mb-6 rounded-[var(--radius-card)] border border-line bg-white p-5">
        <PubliceerBalk
          pageKey={pagina.pageKey}
          aantalConcepten={pagina.aantalConcepten}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Paneel titel="Inhoud">
            <BlokkenPaneel blokken={pagina.blokken} />
          </Paneel>

          {heeftVrijeBlokken(pageKey) ? (
            <Paneel titel="Eigen blokken onderaan">
              <VrijeBlokkenPaneel pageKey={pageKey} blokken={vrijeBlokken} />
            </Paneel>
          ) : null}
        </div>

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
              <strong className="font-semibold text-ink">
                Klik hierin op wat je wilt veranderen
              </strong>{" "}
              en de bijbehorende velden gaan links open. Zo wordt de pagina na
              publiceren; sla een wijziging op om de voorvertoning te verversen.
            </p>
          </Paneel>
        </div>
      </div>
    </>
  );
}
