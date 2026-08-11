import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Mailings en het aantal ontvangers (BOUWPROMPT §10.7).
 *
 * Het aantal ontvangers wordt hier geteld, niet bewaard als lijst: welke
 * klanten toestemming hebben verandert voortdurend, en een opgeslagen lijst zou
 * een tweede klantenbestand zijn (§2.5).
 */

export type MailingOverzicht = {
  id: string;
  onderwerp: string;
  inhoudHtml: string;
  verstuurdOp: string | null;
  aantalOntvangers: number;
  fout: string | null;
  aangemaaktOp: string;
};

export async function haalMailings(): Promise<MailingOverzicht[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("mailings")
    .select(
      "id, subject, body_html, sent_at, recipient_count, error, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((rij) => ({
    id: rij.id,
    onderwerp: rij.subject,
    inhoudHtml: rij.body_html,
    verstuurdOp: rij.sent_at,
    aantalOntvangers: rij.recipient_count,
    fout: rij.error,
    aangemaaktOp: rij.created_at,
  }));
}

/** Hoeveel actieve klanten hebben toestemming voor mailings? */
export async function telOntvangers(): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .not("marketing_consent_at", "is", null)
    .is("deleted_at", null);

  return count ?? 0;
}
