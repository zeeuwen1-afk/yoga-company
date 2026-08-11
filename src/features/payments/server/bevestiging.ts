import "server-only";

import { InschrijfbevestigingMail } from "@/emails/templates";
import { formateerPrijs } from "@/features/courses";
import { publicEnv } from "@/lib/env";
import { verstuurMail } from "@/lib/notificatie";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Bevestigingsmail na een geslaagde betaling (BOUWPROMPT §10.3 en §10.4).
 *
 * Wordt aangeroepen vanuit de webhook. Draait buiten een gebruikerssessie om
 * en gebruikt daarom de service-role client (§17.1).
 */
export async function verstuurInschrijfbevestiging(enrollmentId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `amount_cents,
       profiles!inner (first_name, email),
       courses!inner (title, location, study_load_text, price_cents, currency)`,
    )
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `Inschrijving ${enrollmentId} niet gevonden voor bevestigingsmail`,
    );
  }

  // De join levert een object; Supabase typeert dat als array wanneer de
  // relatie niet uniek is, vandaar deze afvlakking.
  const profiel = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;
  const cursus = Array.isArray(data.courses) ? data.courses[0] : data.courses;

  if (!profiel || !cursus) {
    throw new Error(`Onvolledige gegevens bij inschrijving ${enrollmentId}`);
  }

  const bedrag = formateerPrijs(
    data.amount_cents ?? cursus.price_cents,
    cursus.currency,
  );

  return verstuurMail({
    aan: profiel.email,
    onderwerp: `Je inschrijving voor ${cursus.title} is bevestigd`,
    template: InschrijfbevestigingMail({
      voornaam: profiel.first_name,
      cursusTitel: cursus.title,
      bedrag,
      locatie: cursus.location,
      studiebelasting: cursus.study_load_text,
      portaalUrl: `${publicEnv().NEXT_PUBLIC_SITE_URL}/portaal`,
    }),
  });
}
