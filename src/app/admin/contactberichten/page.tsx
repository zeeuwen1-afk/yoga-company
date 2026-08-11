import type { Metadata } from "next";

import {
  AdminKop,
  LegeLijst,
  Paneel,
  datumTijd,
} from "@/features/admin/components/ui";
import { ContactberichtVerwijderen } from "@/features/requests/components/admin-acties";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Contactberichten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContactberichtenPage() {
  const supabase = await createClient();

  const { data: berichten } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, body, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminKop
        titel="Contactberichten"
        toelichting="Berichten via het formulier op de website."
      />

      <Paneel>
        {!berichten || berichten.length === 0 ? (
          <LegeLijst>Nog geen berichten.</LegeLijst>
        ) : (
          <ul className="divide-y divide-line">
            {berichten.map((bericht) => (
              <li key={bericht.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{bericht.name}</span>
                  <span className="text-sm text-muted">
                    {datumTijd(bericht.created_at)}
                  </span>
                </div>

                <p className="mt-0.5 text-sm text-muted">
                  <a
                    href={`mailto:${bericht.email}`}
                    className="underline hover:text-green"
                  >
                    {bericht.email}
                  </a>
                  {bericht.phone ? ` · ${bericht.phone}` : null}
                </p>

                <p className="mt-3 rounded-lg bg-cream px-4 py-3 text-sm whitespace-pre-wrap">
                  {bericht.body}
                </p>

                <div className="mt-2">
                  <ContactberichtVerwijderen berichtId={bericht.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Paneel>

      <p className="mt-4 text-sm text-muted">
        Contactberichten worden na twaalf maanden automatisch opgeruimd
        (BOUWPROMPT §17.6). Je kunt ze ook eerder verwijderen.
      </p>
    </>
  );
}
