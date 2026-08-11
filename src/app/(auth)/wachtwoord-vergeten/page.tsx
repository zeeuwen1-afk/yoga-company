import type { Metadata } from "next";
import Link from "next/link";

import { WachtwoordVergetenFormulier } from "@/features/auth/components/wachtwoord-formulieren";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten",
  robots: { index: false, follow: false },
};

export default function WachtwoordVergetenPage() {
  return (
    <>
      <h1 className="text-3xl">Wachtwoord vergeten</h1>
      <p className="mt-2 text-sm text-muted">
        Vul je e-mailadres in. We sturen je een link waarmee je een nieuw
        wachtwoord instelt.
      </p>

      <WachtwoordVergetenFormulier />

      <p className="mt-6 text-sm text-muted">
        <Link href="/inloggen" className="font-semibold text-green underline">
          Terug naar inloggen
        </Link>
      </p>
    </>
  );
}
