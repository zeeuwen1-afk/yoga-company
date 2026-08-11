import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InlogFormulier } from "@/features/auth/components/inlog-formulier";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in op je eigen omgeving bij Yoga Companie.",
  robots: { index: false, follow: false },
};

export default async function InloggenPage({
  searchParams,
}: {
  searchParams: Promise<{ vervolg?: string }>;
}) {
  const { vervolg } = await searchParams;

  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (user) {
    redirect(vervolg?.startsWith("/") ? vervolg : "/portaal");
  }

  return (
    <>
      <h1 className="text-3xl">Inloggen</h1>
      <p className="mt-2 text-sm text-muted">
        Welkom terug. Log in om bij je opleidingen en berichten te komen.
      </p>

      <InlogFormulier vervolg={vervolg} />

      <p className="mt-6 text-sm text-muted">
        Nog geen account?{" "}
        <Link
          href="/registreren"
          className="font-semibold text-green underline"
        >
          Maak er een aan
        </Link>
      </p>
    </>
  );
}
