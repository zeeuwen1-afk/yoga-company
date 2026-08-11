import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumKort,
} from "@/features/admin/components/ui";
import { UitnodigenFormulier } from "@/features/crm/components/uitnodigen-formulier";
import { haalKlanten } from "@/features/crm";
import { mailIngericht } from "@/lib/notificatie";
import { stripeIngericht } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Instellingen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Koppeling({
  naam,
  ingericht,
  toelichting,
}: {
  naam: string;
  ingericht: boolean;
  toelichting: string;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <p className="font-semibold">{naam}</p>
        <p className="text-sm text-muted">{toelichting}</p>
      </div>
      <span
        className={
          ingericht
            ? "rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success"
            : "rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-muted"
        }
      >
        {ingericht ? "Ingericht" : "Nog niet ingericht"}
      </span>
    </li>
  );
}

export default async function InstellingenPage() {
  const beheerders = await haalKlanten({ rol: "admin" });

  return (
    <>
      <AdminKop
        titel="Instellingen"
        toelichting="Teamleden en de koppelingen met externe diensten."
      />

      <div className="space-y-6">
        <Paneel titel="Beheerders">
          {beheerders.length === 0 ? (
            <LegeLijst>Geen beheerders gevonden.</LegeLijst>
          ) : (
            <ul className="divide-y divide-line">
              {beheerders.map((beheerder) => (
                <li
                  key={beheerder.id}
                  className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/admin/klanten/${beheerder.id}`}
                      className="font-semibold hover:text-green"
                    >
                      {beheerder.voornaam} {beheerder.achternaam}
                    </Link>
                    <p className="text-sm text-muted">{beheerder.email}</p>
                  </div>
                  <span className="text-sm text-muted">
                    {beheerder.actief
                      ? `Sinds ${datumKort(beheerder.aangemaaktOp)}`
                      : "Gedeactiveerd"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-line p-5">
            <p className="mb-4 text-sm text-muted">
              Beheerders moeten bij de eerste keer inloggen verplicht
              tweestapsverificatie instellen; zonder komen ze niet in het
              beheer. Er moet altijd minstens één beheerder overblijven.
            </p>
            <UitnodigenFormulier />
          </div>
        </Paneel>

        <Paneel titel="Koppelingen">
          <ul className="divide-y divide-line">
            <Koppeling
              naam="Stripe"
              ingericht={stripeIngericht()}
              toelichting="Betalingen met iDEAL en creditcard. Zie docs/beheer.md §7."
            />
            <Koppeling
              naam="Resend"
              ingericht={mailIngericht()}
              toelichting="Verzenden van e-mail. Zie docs/beheer.md §8."
            />
            <Koppeling
              naam="Anthropic"
              ingericht={Boolean(process.env.ANTHROPIC_API_KEY)}
              toelichting="AI-hulp bij berichten voor sociale media (Fase 7)."
            />
            <Koppeling
              naam="Meta"
              ingericht={process.env.META_PUBLISHING_ENABLED === "true"}
              toelichting="Publiceren op Facebook en Instagram (Fase 7, optioneel)."
            />
          </ul>
        </Paneel>

        <Paneel titel="Bedrijfsgegevens">
          <div className="p-5">
            <p className="text-sm text-muted">
              Naam, adres, KvK-nummer en contactgegevens staan in de teksten van
              de website en zijn straks aan te passen via de site-editor (Fase
              6). Tot die tijd staan ze als startinhoud in{" "}
              <span className="font-mono">src/content/blokken.ts</span>.
            </p>
          </div>
        </Paneel>
      </div>
    </>
  );
}
