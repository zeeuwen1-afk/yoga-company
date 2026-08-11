import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegistratieFormulier } from "@/features/auth/components/registratie-formulier";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account aanmaken",
  description: "Maak een account aan bij Yoga Companie.",
  robots: { index: false, follow: false },
};

export default async function RegistrerenPage() {
  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (user) redirect("/portaal");

  return (
    <>
      <h1 className="text-3xl">Account aanmaken</h1>
      <p className="mt-2 text-sm text-muted">
        Met een account volg je je opleidingen, bekijk je je voortgang en houd
        je contact met ons.
      </p>

      <RegistratieFormulier />

      <p className="mt-6 text-sm text-muted">
        Heb je al een account?{" "}
        <Link href="/inloggen" className="font-semibold text-green underline">
          Inloggen
        </Link>
      </p>
    </>
  );
}
