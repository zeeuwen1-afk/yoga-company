"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { publicEnv } from "@/lib/env";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createClient, createMailLinkClient } from "@/lib/supabase/server";

import {
  inlogSchema,
  registratieSchema,
  totpVerificatieSchema,
  wachtwoordHerstellenSchema,
  wachtwoordVergetenSchema,
} from "../schemas";

export type ActieResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

/**
 * Foutmeldingen naar de gebruiker blijven algemeen (BOUWPROMPT §17.11):
 * ze verraden nooit of een e-mailadres bestaat of waarom iets misging.
 */
const ALGEMENE_FOUT =
  "Er ging iets mis. Probeer het opnieuw of neem contact met ons op.";

function velden(error: import("zod").ZodError): Record<string, string> {
  const resultaat: Record<string, string> = {};
  for (const issue of error.issues) {
    const sleutel = String(issue.path[0] ?? "");
    resultaat[sleutel] ??= issue.message;
  }
  return resultaat;
}

export async function registreren(
  _vorige: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const parsed = registratieSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: velden(parsed.error),
    };
  }

  // Honeypot gevuld: vrijwel zeker een bot. We doen alsof het gelukt is.
  if (parsed.data.website) {
    return {
      status: "gelukt",
      bericht: "Bekijk je e-mail om je account te bevestigen.",
    };
  }

  // Zie createMailLinkClient(): de bevestigingslink moet ook werken als de
  // mail op een ander apparaat wordt geopend dan waar is geregistreerd.
  const supabase = createMailLinkClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // De trigger in de database maakt hiermee het profiel aan (§7).
      data: {
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
      },
      emailRedirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/bevestigen`,
    },
  });

  if (error) {
    // Bestaat het adres al, dan zeggen we dat niet: dat zou verklappen wie
    // er een account heeft.
    return { status: "fout", bericht: ALGEMENE_FOUT };
  }

  return {
    status: "gelukt",
    bericht:
      "Bijna klaar. We hebben je een e-mail gestuurd; bevestig daarin je adres om je account te activeren.",
  };
}

export async function inloggen(
  _vorige: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const parsed = inlogSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: velden(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Dit e-mailadres en wachtwoord horen niet bij elkaar.",
    };
  }

  const vervolg = String(formData.get("vervolg") ?? "");
  const bestemming = vervolg.startsWith("/") ? vervolg : "/portaal";

  revalidatePath("/", "layout");
  redirect(bestemming);
}

export async function uitloggen() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function wachtwoordVergeten(
  _vorige: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const parsed = wachtwoordVergetenSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: velden(parsed.error),
    };
  }

  if (!parsed.data.website) {
    const supabase = createMailLinkClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/bevestigen?volgende=/wachtwoord-herstellen`,
    });
  }

  // Altijd hetzelfde antwoord, ongeacht of het adres bestaat.
  return {
    status: "gelukt",
    bericht:
      "Als dit adres bij ons bekend is, ontvang je binnen enkele minuten een e-mail met een herstellink.",
  };
}

export async function wachtwoordHerstellen(
  _vorige: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const parsed = wachtwoordHerstellenSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: velden(parsed.error),
    };
  }

  const supabase = await createClient();
  const user = await huidigeGebruiker(supabase);

  if (!user) {
    return {
      status: "fout",
      bericht:
        "Deze herstellink is verlopen. Vraag een nieuwe aan om verder te gaan.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { status: "fout", bericht: ALGEMENE_FOUT };
  }

  return {
    status: "gelukt",
    bericht: "Je wachtwoord is gewijzigd. Je kunt nu verder.",
  };
}

// --- Tweestapsverificatie (TOTP) ---------------------------------------------

/**
 * Start het koppelen van een authenticator-app; levert QR-code en geheim.
 *
 * Eerst worden onbevestigde factoren opgeruimd. Wie het instellen halverwege
 * afbreekt — tab dicht, telefoon niet bij de hand — laat er namelijk een
 * staan, en Supabase eist dat de naam per gebruiker uniek is. Zonder deze
 * opruiming mislukte een tweede poging op dezelfde dag, en omdat het beheer
 * zonder tweestapsverificatie niet toegankelijk is, zat de beheerder daarmee
 * buitengesloten tot de volgende dag.
 *
 * Alleen `unverified` factoren gaan weg. Een werkende factor blijft staan;
 * die weghalen zou de beveiliging juist uitzetten.
 */
export async function totpAanmelden() {
  const supabase = await createClient();

  const { data: bestaande } = await supabase.auth.mfa.listFactors();
  for (const factor of bestaande?.all ?? []) {
    if (factor.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    // Tijdstip erbij, zodat twee pogingen nooit dezelfde naam krijgen.
    friendlyName: `YogaCompany ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
  });

  if (error || !data) {
    return { status: "fout" as const, bericht: ALGEMENE_FOUT };
  }

  return {
    status: "gelukt" as const,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/** Bevestigt de zescijferige code en verheft de sessie naar aal2. */
export async function totpVerifieren(
  _vorige: ActieResultaat,
  formData: FormData,
): Promise<ActieResultaat> {
  const parsed = totpVerificatieSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: velden(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data: challenge, error: challengeFout } =
    await supabase.auth.mfa.challenge({ factorId: parsed.data.factor_id });

  if (challengeFout || !challenge) {
    return { status: "fout", bericht: ALGEMENE_FOUT };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factor_id,
    challengeId: challenge.id,
    code: parsed.data.code,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Deze code klopt niet of is verlopen. Probeer de nieuwste code.",
    };
  }

  const vervolg = String(formData.get("vervolg") ?? "");
  const bestemming = vervolg.startsWith("/") ? vervolg : "/portaal";

  revalidatePath("/", "layout");
  redirect(bestemming);
}

/** Zet tweestapsverificatie uit. Voor klanten optioneel (BOUWPROMPT §7). */
export async function totpUitschakelen(factorId: string) {
  const supabase = await createClient();

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .maybeSingle();

  if (profiel?.role === "admin") {
    return {
      status: "fout" as const,
      bericht:
        "Voor beheerders is tweestapsverificatie verplicht en kan deze niet worden uitgezet.",
    };
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) {
    return { status: "fout" as const, bericht: ALGEMENE_FOUT };
  }

  revalidatePath("/portaal/profiel");
  return {
    status: "gelukt" as const,
    bericht: "Tweestapsverificatie staat uit.",
  };
}
