import type { Metadata } from "next";
import Link from "next/link";

import { uitloggen } from "@/features/auth/server/actions";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

/**
 * De middleware laat hier alleen admins met een aal2-sessie binnen
 * (BOUWPROMPT §7). Het volledige CRM volgt in Fase 5.
 */
export default async function AdminPage() {
  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-muted">Beheer</p>
      <h1 className="mt-2 text-4xl">Welkom {profiel?.first_name ?? ""}</h1>
      <p className="mt-4 text-muted">
        Je bent ingelogd als beheerder, met tweestapsverificatie bevestigd. Het
        CRM, het aanbodbeheer en de site-editor volgen in Fase 5 en 6.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/portaal"
          className="inline-flex h-11 items-center rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-sand-light"
        >
          Naar mijn omgeving
        </Link>

        <form action={uitloggen}>
          <button
            type="submit"
            className="h-11 text-sm text-muted underline hover:text-green"
          >
            Uitloggen
          </button>
        </form>
      </div>
    </div>
  );
}
