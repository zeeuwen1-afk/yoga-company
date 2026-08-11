import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { uitloggen } from "@/features/auth/server/actions";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mijn omgeving",
  robots: { index: false, follow: false },
};

// De volledige inrichting van het portaal volgt in Fase 4 (BOUWPROMPT §11).
export default async function PortaalPage() {
  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (!user) redirect("/inloggen?vervolg=/portaal");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl">Hallo {profiel?.first_name ?? "daar"}</h1>
      <p className="mt-4 text-muted">
        Je bent ingelogd. Je opleidingen, voortgang en berichten verschijnen
        hier zodra Fase 4 is opgeleverd.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {profiel?.role === "admin" ? (
          <Link
            href="/admin"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-sand-light"
          >
            Naar beheer
          </Link>
        ) : null}

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
