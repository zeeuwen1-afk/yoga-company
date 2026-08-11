import type { Metadata } from "next";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import {
  BerichtActies,
  PLATFORM_LABEL,
  SocialWerkblad,
  haalSocialBerichten,
  metaIngericht,
} from "@/features/social";
import { aiIngericht } from "@/lib/anthropic";

export const metadata: Metadata = {
  title: "Social",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  concept: "Concept",
  gepland: "Gepland",
  gepubliceerd: "Gepubliceerd",
  mislukt: "Mislukt",
};

export default async function SocialPage() {
  const berichten = await haalSocialBerichten();
  const metaAan = metaIngericht();

  return (
    <>
      <AdminKop
        titel="Social"
        toelichting="Berichten voor Instagram en Facebook, met hulp van AI."
      />

      <div className="space-y-6">
        <SocialWerkblad metaAan={metaAan} aiAan={aiIngericht()} />

        <Paneel titel="Bewaarde berichten">
          {berichten.length === 0 ? (
            <LegeLijst>
              Nog geen berichten bewaard. Wat je hierboven bewaart, verschijnt
              hier.
            </LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {berichten.map((bericht) => (
                <li key={bericht.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted">
                        {PLATFORM_LABEL[bericht.platform]} ·{" "}
                        {STATUS_LABEL[bericht.status] ?? bericht.status} ·{" "}
                        {datumKort(bericht.aangemaaktOp)}
                      </p>
                      <p className="mt-2 text-sm whitespace-pre-wrap">
                        {bericht.caption}
                      </p>
                      {bericht.fout ? (
                        <p className="mt-2 text-sm text-error">
                          {bericht.fout}
                        </p>
                      ) : null}
                    </div>

                    {bericht.afbeeldingUrl ? (
                      // Gewone img: opslag-URL die next/image niet vooraf kent.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bericht.afbeeldingUrl}
                        alt=""
                        className="size-24 shrink-0 rounded-lg border border-line object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <BerichtActies
                      id={bericht.id}
                      metaAan={metaAan}
                      alGepubliceerd={bericht.status === "gepubliceerd"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Paneel>
      </div>
    </>
  );
}
