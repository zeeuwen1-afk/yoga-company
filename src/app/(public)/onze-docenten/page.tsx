import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Sectie, SectieKop } from "@/components/layout/sectie";
import { haalDocentenlijst } from "@/features/docentpagina/server/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Onze docenten",
  description:
    "De yogadocenten die lesgeven bij YogaCompany, elk met een eigen pagina over hun lessen en achtergrond.",
  alternates: { canonical: "/onze-docenten" },
};

/**
 * De publieke lijst met docenten (§ docentenpagina's).
 *
 * Staat bewust niet op `/docenten` — dat is de portal waar docenten zelf
 * inloggen. Dit is de etalage; die heet `/onze-docenten`.
 *
 * De lijst komt uit dezelfde bron als de pagina's zelf, dus een docent zonder
 * lopend abonnement valt er vanzelf uit zodra zijn respijt voorbij is. Er staat
 * hier geen tweede filter op.
 */
export default async function OnzeDocentenPage() {
  const docenten = await haalDocentenlijst();

  return (
    <Sectie>
      <SectieKop
        titel="Onze docenten"
        inleiding="Mensen kiezen een docent, niet een studio. Hieronder staat wie er bij ons lesgeeft, elk met een eigen verhaal."
      />

      {docenten.length === 0 ? (
        <p className="mt-10 max-w-2xl text-muted">
          Er staan op dit moment geen docentenpagina&rsquo;s online.{" "}
          <Link href="/lessen" className="underline hover:text-green">
            Bekijk het weekrooster
          </Link>{" "}
          om te zien welke lessen er zijn.
        </p>
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docenten.map((docent) => (
            <li key={docent.slug}>
              <Link
                href={`/docent/${docent.slug}`}
                className="group block rounded-[var(--radius-card)] border border-line bg-background p-5 transition-colors hover:border-green"
              >
                {docent.portret ? (
                  <Image
                    src={docent.portret}
                    alt={docent.portretAlt}
                    width={600}
                    height={750}
                    className="aspect-[4/5] w-full rounded-lg border border-line object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="aspect-[4/5] w-full rounded-lg border border-line bg-sand-light"
                  />
                )}

                {docent.bovenkop ? (
                  <p className="mt-4 text-xs tracking-[0.14em] text-muted uppercase">
                    {docent.bovenkop}
                  </p>
                ) : null}
                <h2 className="mt-1.5 text-xl group-hover:text-green">
                  {docent.titel}
                </h2>
                {docent.zin ? (
                  <p className="mt-2 text-[0.95rem] text-muted">{docent.zin}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Sectie>
  );
}
