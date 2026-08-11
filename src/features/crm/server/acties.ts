"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * De klantlevenscyclus in de beheeromgeving (BOUWPROMPT §13).
 *
 * Elke handeling hier raakt persoonsgegevens en gaat daarom met een regel het
 * audit log in, met de reden erbij waar die van belang is (§17).
 *
 * De rechten worden afgedwongen door RLS en door de databasefuncties zelf; de
 * controle in `vereisAdmin()` is er om een begrijpelijke fout te kunnen tonen.
 */

export type AdminResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, deleted_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (profiel?.role !== "admin" || profiel.deleted_at !== null) return null;
  return { supabase, adminId: gebruiker.id };
}

const GEEN_RECHTEN: AdminResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

// --- Klant uitnodigen --------------------------------------------------------

const uitnodigingSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vul een e-mailadres in")
    .email("Dit lijkt geen geldig e-mailadres")
    .toLowerCase(),
  first_name: z.string().trim().min(1, "Vul een voornaam in").max(80),
  last_name: z.string().trim().min(1, "Vul een achternaam in").max(80),
  rol: z.enum(["klant", "admin"]).default("klant"),
});

/**
 * Nodigt iemand uit met een activatielink (BOUWPROMPT §7).
 *
 * Er wordt nooit een wachtwoord gezet: de ontvanger kiest er zelf een. Het
 * account ontstaat via de service-role, want er is nog geen sessie om onder te
 * werken.
 */
export async function nodigKlantUit(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = uitnodigingSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  const { data: bestaand } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (bestaand) {
    return {
      status: "fout",
      bericht: "Er bestaat al een account met dit e-mailadres.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      redirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/bevestigen?volgende=/wachtwoord-herstellen`,
      data: {
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
      },
    },
  );

  if (error || !data.user) {
    return {
      status: "fout",
      bericht:
        "De uitnodiging kon niet worden verstuurd. Controleer of de mailkoppeling is ingericht.",
    };
  }

  if (parsed.data.rol === "admin") {
    await supabase.rpc("zet_profiel_rol", {
      p_profile_id: data.user.id,
      p_rol: "admin",
    });
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "klant_uitgenodigd",
    entiteit: "profiles",
    entiteitId: data.user.id,
    meta: { rol: parsed.data.rol },
  });

  revalidatePath("/admin/klanten");
  return {
    status: "gelukt",
    bericht: `Uitnodiging verstuurd naar ${parsed.data.email}.`,
  };
}

// --- Gegevens bijwerken ------------------------------------------------------

const klantSchema = z.object({
  profile_id: z.uuid(),
  first_name: z.string().trim().min(1, "Vul een voornaam in").max(80),
  last_name: z.string().trim().min(1, "Vul een achternaam in").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function werkKlantBij(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = klantSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", parsed.data.profile_id);

  if (error) {
    return {
      status: "fout",
      bericht: "De gegevens konden niet worden opgeslagen.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "klant_bijgewerkt",
    entiteit: "profiles",
    entiteitId: parsed.data.profile_id,
    // Welke velden zijn aangeraakt, niet wat erin staat: het log hoort geen
    // tweede kopie van de persoonsgegevens te worden.
    meta: { velden: ["first_name", "last_name", "phone"] },
  });

  revalidatePath(`/admin/klanten/${parsed.data.profile_id}`);
  return { status: "gelukt", bericht: "De gegevens zijn bijgewerkt." };
}

// --- Deactiveren en heractiveren ---------------------------------------------

export async function zetKlantActief(profileId: string, actief: boolean) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { error } = await supabase.rpc("zet_profiel_actief", {
    p_profile_id: profileId,
    p_actief: actief,
  });

  if (error) {
    return {
      status: "fout" as const,
      bericht: error.message.includes("beheerder overblijven")
        ? "Dit is de laatste beheerder; die kan niet worden gedeactiveerd."
        : "Het account kon niet worden bijgewerkt.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: actief ? "klant_geactiveerd" : "klant_gedeactiveerd",
    entiteit: "profiles",
    entiteitId: profileId,
  });

  revalidatePath(`/admin/klanten/${profileId}`);
  revalidatePath("/admin/klanten");

  return {
    status: "gelukt" as const,
    bericht: actief
      ? "Het account is weer actief."
      : "Het account is gedeactiveerd. De gegevens blijven bewaard.",
  };
}

// --- AVG-verwijdering --------------------------------------------------------

const verwijderSchema = z.object({
  profile_id: z.uuid(),
  bevestiging: z.literal("VERWIJDEREN", {
    message: "Typ VERWIJDEREN om te bevestigen",
  }),
  reden: z.string().trim().min(3, "Noteer kort waarom").max(300),
});

/**
 * Verwijdert de persoonsgegevens van een klant (BOUWPROMPT §13, §17.7).
 *
 * Anonimiseren, niet wissen: de wet vraagt om verwijdering van
 * persoonsgegevens én om het bewaren van de financiële administratie. De
 * databasefunctie doet beide in één transactie. Daarna wordt het
 * inlogaccount verwijderd, zodat er niet meer kan worden ingelogd.
 */
export async function verwijderKlantAvg(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = verwijderSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  if (parsed.data.profile_id === adminId) {
    return {
      status: "fout",
      bericht: "Je kunt je eigen account niet langs deze weg verwijderen.",
    };
  }

  const { error } = await supabase.rpc("anonimiseer_profiel", {
    p_profile_id: parsed.data.profile_id,
  });

  if (error) {
    return {
      status: "fout",
      bericht: error.message.includes("beheerder overblijven")
        ? "Dit is de laatste beheerder; die kan niet worden verwijderd."
        : "De gegevens konden niet worden geanonimiseerd.",
    };
  }

  // Het inlogaccount kan alleen met de service-role weg.
  const admin = createAdminClient();
  const { error: authFout } = await admin.auth.admin.deleteUser(
    parsed.data.profile_id,
  );

  if (authFout) {
    console.error(
      `[crm] auth-account niet verwijderd voor ${parsed.data.profile_id}: ${authFout.message}`,
    );
  }

  // Het log houdt vast dát het gebeurd is en waarom — de verantwoording die
  // de AVG vraagt — zonder de verwijderde gegevens te herhalen.
  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "klant_geanonimiseerd",
    entiteit: "profiles",
    entiteitId: parsed.data.profile_id,
    meta: {
      reden: parsed.data.reden,
      authAccountVerwijderd: !authFout,
    },
  });

  revalidatePath("/admin/klanten");
  return {
    status: "gelukt",
    bericht:
      "De persoonsgegevens zijn verwijderd. De inschrijvingen blijven geanonimiseerd staan voor de boekhouding.",
  };
}

// --- Notities ----------------------------------------------------------------

const notitieSchema = z.object({
  profile_id: z.uuid(),
  body: z.string().trim().min(1, "Schrijf eerst een notitie").max(3000),
});

export async function voegNotitieToe(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = notitieSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  const { error } = await supabase.from("crm_notes").insert({
    profile_id: parsed.data.profile_id,
    author_id: adminId,
    body: parsed.data.body,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "De notitie kon niet worden opgeslagen.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "notitie_toegevoegd",
    entiteit: "crm_notes",
    entiteitId: parsed.data.profile_id,
  });

  revalidatePath(`/admin/klanten/${parsed.data.profile_id}`);
  return { status: "gelukt", bericht: "Notitie opgeslagen." };
}

// --- Rol wijzigen ------------------------------------------------------------

export async function wijzigRol(profileId: string, rol: "klant" | "admin") {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { error } = await supabase.rpc("zet_profiel_rol", {
    p_profile_id: profileId,
    p_rol: rol,
  });

  if (error) {
    return {
      status: "fout" as const,
      bericht: error.message.includes("beheerder overblijven")
        ? "Er moet ten minste één beheerder overblijven."
        : "De rol kon niet worden gewijzigd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "rol_gewijzigd",
    entiteit: "profiles",
    entiteitId: profileId,
    meta: { nieuweRol: rol },
  });

  revalidatePath(`/admin/klanten/${profileId}`);
  return {
    status: "gelukt" as const,
    bericht:
      rol === "admin"
        ? "Deze persoon is nu beheerder en moet bij de eerstvolgende keer inloggen tweestapsverificatie instellen."
        : "De beheerdersrol is ingetrokken.",
  };
}
