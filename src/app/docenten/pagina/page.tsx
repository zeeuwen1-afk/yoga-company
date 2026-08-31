import type { Metadata } from "next";
import Link from "next/link";

import { PaginaEditor } from "@/features/docentpagina/components/pagina-editor";
import { PaginaAanmaken } from "@/features/docentpagina/components/pagina-aanmaken";
import { FotoUploaden } from "@/features/docentpagina/components/foto-uploaden";
import {
  haalAbonnement,
  haalEigenMedia,
  haalEigenPagina,
} from "@/features/docentpagina/server/queries";

export const metadata: Metadata = {
  title: "Mijn pagina",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MijnPaginaPage() {
  const [pagina, media, abonnement] = await Promise.all([
    haalEigenPagina(),
    haalEigenMedia(),
    haalAbonnement(),
  ]);

  const magBewerken = abonnement?.loopt === true;

  if (!pagina) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl">Mijn pagina</h1>
          <p className="mt-2 text-muted">
            Een eigen plek op het adres van YogaCompany, die je zelf indeelt.
            Kies eerst je webadres; dat komt op je visitekaartjes te staan, dus
            kies er een die je over drie jaar nog wilt.
          </p>
        </div>

        {magBewerken ? (
          <PaginaAanmaken />
        ) : (
          <div className="rounded-[var(--radius-card)] border border-sand bg-sand-light p-5">
            <h2 className="text-lg">Hiervoor heb je een abonnement nodig</h2>
            <p className="mt-2 text-sm">
              Een eigen pagina hoort bij het docentenabonnement van{" "}
              <strong>
                €{" "}
                {((abonnement?.standaardCenten ?? 2500) / 100)
                  .toFixed(2)
                  .replace(".", ",")}
              </strong>{" "}
              per maand. Neem contact op om hem aan te zetten.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
            >
              Neem contact op
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Mijn pagina</h1>
          <p className="mt-1.5 text-muted">
            {pagina.status === "gepubliceerd" ? (
              <>
                Online op{" "}
                <Link
                  href={`/docent/${pagina.slug}`}
                  className="underline hover:text-green"
                >
                  /docent/{pagina.slug}
                </Link>
              </>
            ) : (
              <>
                Nog niet online. Hij komt op{" "}
                <span className="text-ink">/docent/{pagina.slug}</span> zodra je
                publiceert.
              </>
            )}
          </p>
        </div>

        <Link
          href="/docenten/pagina/voorbeeld"
          className="inline-flex h-11 items-center rounded-lg border border-green px-5 font-semibold text-green transition-colors hover:bg-hover"
        >
          Voorvertoning
        </Link>
      </div>

      {!magBewerken ? (
        <div className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-5 py-4">
          <h2 className="font-semibold text-error">
            Bewerken staat stil, want je abonnement loopt niet
          </h2>
          <p className="mt-1.5 text-sm">
            Je pagina blijft nog even online, maar je kunt hem nu niet
            aanpassen. Er wordt niets weggegooid: zodra het abonnement weer
            loopt staat alles er precies zoals je het achterliet.
          </p>
        </div>
      ) : null}

      <PaginaEditor
        blokken={pagina.blokken}
        fotos={media.map((m) => ({ url: m.url, bestandsnaam: m.bestandsnaam }))}
        magBewerken={magBewerken}
      />

      {magBewerken ? <FotoUploaden /> : null}
    </div>
  );
}
