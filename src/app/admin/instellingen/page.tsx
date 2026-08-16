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
import { afmeldsecretIngericht } from "@/features/mailing";
import { metaIngericht } from "@/features/social";
import { aiIngericht } from "@/lib/anthropic";
import { mailIngericht } from "@/lib/notificatie";
import { betaalModus, betalenIngericht } from "@/lib/mollie";

export const metadata: Metadata = {
  title: "Instellingen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Koppeling({
  naam,
  ingericht,
  toelichting,
  label,
}: {
  naam: string;
  ingericht: boolean;
  toelichting: string;
  /** Vervangt "Ingericht", bijvoorbeeld om testmodus te tonen. */
  label?: string;
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
        {label ?? (ingericht ? "Ingericht" : "Nog niet ingericht")}
      </span>
    </li>
  );
}

/**
 * Wat de beheerder over de betaalkoppeling te zien krijgt. De modus komt van
 * het voorvoegsel van de sleutel zelf, dus hij kan niet verkeerd staan.
 */
const MOLLIE_LABEL: Record<string, string> = {
  geen: "Nog niet gekoppeld",
  test: "Testmodus",
  live: "Live",
  onbekend: "Sleutel niet herkend",
};

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
              naam="Mollie"
              ingericht={betalenIngericht()}
              label={MOLLIE_LABEL[betaalModus() ?? "geen"]}
              toelichting="Betalingen met iDEAL en creditcard. Koppelen doe je met één sleutel — zie docs/payments.md."
            />
            <Koppeling
              naam="Resend"
              ingericht={mailIngericht()}
              toelichting="Verzenden van e-mail. Zie docs/beheer.md §8."
            />
            <Koppeling
              naam="Anthropic"
              ingericht={aiIngericht()}
              toelichting="AI-hulp bij berichten voor sociale media. Zie docs/beheer.md §10."
            />
            <Koppeling
              naam="Meta"
              ingericht={metaIngericht()}
              toelichting="Rechtstreeks publiceren op Facebook en Instagram. Optioneel; zonder deze koppeling werkt de socialmediatool volledig."
            />
            <Koppeling
              naam="Afmeldlink mailings"
              ingericht={afmeldsecretIngericht()}
              toelichting="Ondertekent de afmeldlink. Zonder deze waarde gaat er geen mailing uit."
            />
          </ul>
        </Paneel>

        <Paneel titel="Bedrijfsgegevens">
          <div className="p-5">
            <p className="text-sm text-muted">
              Naam, adres, KvK-nummer en contactgegevens staan in de teksten van
              de website en zijn aan te passen via de site-editor. De
              startinhoud staat in{" "}
              <span className="font-mono">src/content/blokken.ts</span>.
            </p>
          </div>
        </Paneel>
      </div>
    </>
  );
}
