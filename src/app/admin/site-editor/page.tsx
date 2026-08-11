import type { Metadata } from "next";
import Link from "next/link";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { haalEditorPaginas } from "@/features/cms/server/editor";

export const metadata: Metadata = {
  title: "Site-editor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SiteEditorPage() {
  const paginas = await haalEditorPaginas();
  const totaalConcepten = paginas.reduce(
    (som, pagina) => som + pagina.aantalConcepten,
    0,
  );

  return (
    <>
      <AdminKop
        titel="Site-editor"
        toelichting="Pas de teksten en beelden van de website aan. Je werkt in concept; pas als je publiceert is het online."
      />

      {totaalConcepten > 0 ? (
        <p className="mb-6 rounded-lg border border-line bg-sand-light px-4 py-3 text-sm">
          Er staan <strong>{totaalConcepten}</strong>{" "}
          {totaalConcepten === 1 ? "wijziging" : "wijzigingen"} klaar die nog
          niet gepubliceerd zijn.
        </p>
      ) : null}

      <Paneel>
        <ul className="divide-y divide-line">
          {paginas.map((pagina) => (
            <li key={pagina.pageKey}>
              <Link
                href={`/admin/site-editor/${pagina.pageKey}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-cream"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{pagina.titel}</span>
                  <span className="block text-sm text-muted">
                    {pagina.blokken.length}{" "}
                    {pagina.blokken.length === 1 ? "onderdeel" : "onderdelen"}
                  </span>
                </span>

                {pagina.aantalConcepten > 0 ? (
                  <span className="shrink-0 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-green-dark">
                    {pagina.aantalConcepten} in concept
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </Paneel>

      <div className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-5">
        <h2 className="text-lg">Hoe het werkt</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <strong className="text-ink">1. Bewerken.</strong> Je wijzigingen
            worden als concept bewaard. De website verandert nog niet.
          </li>
          <li>
            <strong className="text-ink">2. Bekijken.</strong> In de
            voorvertoning zie je de pagina precies zoals hij wordt.
          </li>
          <li>
            <strong className="text-ink">3. Publiceren.</strong> Binnen enkele
            seconden staat het online. Er hoeft niets uitgerold te worden.
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted">
          De indeling van een pagina ligt vast; je past de inhoud aan, niet de
          structuur. Dat houdt de site consistent en voorkomt dat een pagina
          onbedoeld uit elkaar valt.
        </p>
      </div>
    </>
  );
}
