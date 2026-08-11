import type { Metadata } from "next";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import {
  MailingActies,
  MailingWerkblad,
  afmeldsecretIngericht,
  haalMailings,
  telOntvangers,
} from "@/features/mailing";
import { mailIngericht } from "@/lib/notificatie";

export const metadata: Metadata = {
  title: "Mailings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MailingsPage() {
  const [mailings, aantalOntvangers] = await Promise.all([
    haalMailings(),
    telOntvangers(),
  ]);

  const klaarOmTeVerzenden = mailIngericht() && afmeldsecretIngericht();

  return (
    <>
      <AdminKop
        titel="Mailings"
        toelichting="Een bericht aan klanten die daar toestemming voor gaven."
      />

      <div className="space-y-6">
        {!klaarOmTeVerzenden ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-sand-light p-5 text-sm">
            <p className="font-semibold">Versturen kan nog niet.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              {!mailIngericht() ? (
                <li>
                  De mailkoppeling (Resend) is nog niet ingericht — zie
                  docs/beheer.md §8.
                </li>
              ) : null}
              {!afmeldsecretIngericht() ? (
                <li>
                  <span className="font-mono">MAILING_UNSUBSCRIBE_SECRET</span>{" "}
                  ontbreekt. Zonder werkende afmeldlink gaat er geen mailing
                  uit.
                </li>
              ) : null}
            </ul>
            <p className="mt-2 text-muted">
              Opstellen en bewaren werkt wel gewoon.
            </p>
          </div>
        ) : null}

        <Paneel titel="Nieuwe mailing">
          <div className="p-5">
            <MailingWerkblad aantalOntvangers={aantalOntvangers} />
          </div>
        </Paneel>

        <Paneel titel="Mailings">
          {mailings.length === 0 ? (
            <LegeLijst>
              Nog geen mailings. Wat je hierboven bewaart, verschijnt hier.
            </LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {mailings.map((mailing) => (
                <li key={mailing.id} className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-semibold">{mailing.onderwerp}</p>
                    <p className="text-sm text-muted">
                      {mailing.verstuurdOp
                        ? `Verstuurd op ${datumKort(mailing.verstuurdOp)} naar ${
                            mailing.aantalOntvangers
                          } ${
                            mailing.aantalOntvangers === 1
                              ? "ontvanger"
                              : "ontvangers"
                          }`
                        : `Concept van ${datumKort(mailing.aangemaaktOp)}`}
                    </p>
                  </div>

                  {mailing.fout ? (
                    <p className="mt-2 text-sm text-error">{mailing.fout}</p>
                  ) : null}

                  <div className="mt-3">
                    <MailingActies
                      id={mailing.id}
                      aantalOntvangers={aantalOntvangers}
                      alVerstuurd={Boolean(mailing.verstuurdOp)}
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
