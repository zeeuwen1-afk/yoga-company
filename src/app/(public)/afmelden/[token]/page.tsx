import type { Metadata } from "next";
import Link from "next/link";

import { AfmeldFormulier } from "@/features/mailing/publiek";

/**
 * Afmelden voor mailings (BOUWPROMPT §10.7).
 *
 * Openbaar en zonder inlog: wie zich wil afmelden moet dat kunnen zonder eerst
 * een wachtwoord op te zoeken. Het token in de URL is ondertekend, dus alleen
 * wie de mail ontving kan hier iets intrekken.
 *
 * Niet indexeren: de pagina bestaat alleen voor wie een mail heeft gekregen.
 */
export const metadata: Metadata = {
  title: "Afmelden voor mailings",
  robots: { index: false, follow: false },
};

export default async function AfmeldenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl">Afmelden voor mailings</h1>

      <p className="mt-4 text-muted">
        Wil je geen nieuws en aankondigingen meer van YogaCompany ontvangen?
        Bevestig het hieronder. Mails over je inschrijving en je account blijf
        je wel gewoon krijgen; die horen bij de opleiding die je volgt.
      </p>

      <div className="mt-8">
        <AfmeldFormulier token={token} />
      </div>

      <p className="mt-8 text-sm text-muted">
        Van gedachten veranderd? Je kunt je toestemming altijd weer aanzetten in{" "}
        <Link href="/portaal/profiel" className="underline hover:text-green">
          je profiel
        </Link>
        .
      </p>
    </div>
  );
}
