import type { Metadata } from "next";
import Link from "next/link";

import { WachtwoordHerstellenFormulier } from "@/features/auth/components/wachtwoord-formulieren";
import { FormMessage } from "@/components/ui/form-message";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord instellen",
  robots: { index: false, follow: false },
};

export default async function WachtwoordHerstellenPage() {
  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (!user) {
    return (
      <>
        <h1 className="text-3xl">Link verlopen</h1>
        <div className="mt-6 space-y-4">
          <FormMessage variant="fout">
            Deze herstellink is niet meer geldig. Vraag een nieuwe aan.
          </FormMessage>
          <Link
            href="/wachtwoord-vergeten"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-green font-semibold text-cream transition-colors hover:bg-green-dark"
          >
            Nieuwe link aanvragen
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl">Nieuw wachtwoord</h1>
      <p className="mt-2 text-sm text-muted">
        Kies een nieuw wachtwoord voor je account.
      </p>

      <WachtwoordHerstellenFormulier />
    </>
  );
}
