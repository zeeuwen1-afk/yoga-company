import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { BlokkenPaneel } from "@/features/cms/components/blokken-paneel";
import { PubliceerBalk } from "@/features/cms/components/publiceer-balk";
import { ELDERS_BEHEERD } from "@/features/cms/elders-beheerd";
import { cursusSlug, heeftVrijeBlokken } from "@/content/vrije-blokken";
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

  // Blokken die aan een sectie hangen horen bij die sectie in het scherm; de
  // rest blijft in de zone onderaan.
  const perSectie: Record<string, typeof vrijeBlokken> = {};
  for (const blok of vrijeBlokken) {
    if (!blok.sectie) continue;
    (perSectie[blok.sectie] ??= []).push(blok);
  }
  const onderaan = vrijeBlokken.filter((blok) => !blok.sectie);

  // Een cursuspagina heeft geen vaste blokken: titel, verhaal, prijs en
  // curriculum komen uit het aanbod, de woorden eromheen staan onder
  // "Cursuspagina's · vaste teksten". Wat hier wél kan is er zelf iets bij
  // zetten, en dan is de vraag wáár. Vandaar drie plekken in plaats van één
  // zone onderaan; de pagina toont ze op precies deze punten.
  const isCursus = cursusSlug(pageKey) !== null;
  const plekken: { sleutel?: string; naam: string; plaats: string }[] = [
    {
      sleutel: "kop",
      naam: "Onder de kop met de prijs",
      plaats: "onder de kop met de prijs",
    },
    {
      sleutel: "verhaal",
      naam: "Onder het verhaal en het curriculum",
      plaats: "onder het verhaal en het curriculum",
    },
    { naam: "Onderaan de pagina", plaats: "helemaal onderaan de pagina" },
  ];

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
          {isCursus ? (
            <>
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 text-sm text-muted">
                De titel, het verhaal, de prijs en het curriculum van deze
                cursus pas je aan bij{" "}
                <Link
                  href="/admin/aanbod"
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Aanbod
                </Link>
                . De vaste woorden eromheen — &ldquo;Voor wie&rdquo;,
                &ldquo;Praktisch&rdquo;, de knoppen — staan onder{" "}
                <Link
                  href="/admin/site-editor/cursus"
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Cursuspagina&rsquo;s · vaste teksten
                </Link>{" "}
                en gelden voor alle cursussen tegelijk. Hieronder zet je wat
                alleen op déze pagina hoort.
              </div>

              {plekken.map((plek) => (
                <Paneel key={plek.naam} titel={plek.naam}>
                  <VrijeBlokkenPaneel
                    pageKey={pageKey}
                    sectie={plek.sleutel}
                    plaats={plek.plaats}
                    blokken={
                      plek.sleutel ? (perSectie[plek.sleutel] ?? []) : onderaan
                    }
                  />
                </Paneel>
              ))}
            </>
          ) : (
            <>
              <Paneel titel="Inhoud">
                <BlokkenPaneel
                  blokken={pagina.blokken}
                  vrijePerSectie={perSectie}
                />
              </Paneel>

              {heeftVrijeBlokken(pageKey) ? (
                <Paneel titel="Eigen blokken onderaan">
                  <VrijeBlokkenPaneel pageKey={pageKey} blokken={onderaan} />
                </Paneel>
              ) : null}
            </>
          )}
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
