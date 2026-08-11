import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TweestapsFormulier } from "@/features/auth/components/tweestaps-formulier";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tweestapsverificatie",
  robots: { index: false, follow: false },
};

export default async function TweestapsverificatiePage({
  searchParams,
}: {
  searchParams: Promise<{ vervolg?: string }>;
}) {
  const { vervolg } = await searchParams;

  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (!user) redirect("/inloggen");

  // Al een geverifieerde tweestapssessie? Dan is er hier niets te doen.
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") {
    redirect(vervolg?.startsWith("/") ? vervolg : "/portaal");
  }

  const { data: factoren } = await supabase.auth.mfa.listFactors();
  const bestaande = factoren?.totp?.find(
    (factor) => factor.status === "verified",
  );

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profiel?.role === "admin";

  return (
    <>
      <h1 className="text-3xl">
        {bestaande
          ? "Bevestig dat jij het bent"
          : "Tweestapsverificatie instellen"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {bestaande
          ? "Vul de code in uit je authenticator-app."
          : isAdmin
            ? "Voor beheerders is tweestapsverificatie verplicht. Koppel eerst een authenticator-app om verder te gaan."
            : "Een extra slot op je account: naast je wachtwoord vraagt Yoga Companie voortaan om een code uit je app."}
      </p>

      <TweestapsFormulier bestaandeFactorId={bestaande?.id} vervolg={vervolg} />
    </>
  );
}
