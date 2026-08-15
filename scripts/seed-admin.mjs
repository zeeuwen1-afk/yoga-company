#!/usr/bin/env node
/**
 * Nodigt het adres uit SEED_ADMIN_EMAIL uit als beheerder.
 *
 * Er wordt bewust nooit een wachtwoord gezet (BOUWPROMPT §19): de ontvanger
 * kiest er zelf een via de uitnodigingsmail. Het script is idempotent — een
 * bestaand account krijgt alleen de adminrol.
 *
 *   pnpm db:seed-admin
 */
import "./omgeving.mjs";
import { createClient } from "@supabase/supabase-js";

function vereist(naam) {
  const waarde = process.env[naam];
  if (!waarde) {
    console.error(`${naam} ontbreekt. Zet hem in .env.local.`);
    process.exit(1);
  }
  return waarde;
}

const email = vereist("SEED_ADMIN_EMAIL").toLowerCase();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const supabase = createClient(
  vereist("NEXT_PUBLIC_SUPABASE_URL"),
  vereist("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function vindGebruiker() {
  // De admin-API kent geen zoekopdracht op e-mail; het profiel wel.
  const { data } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();
  return data;
}

async function main() {
  const bestaand = await vindGebruiker();

  if (bestaand) {
    if (bestaand.role === "admin") {
      console.log(`${email} is al beheerder. Niets te doen.`);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", bestaand.id);

    if (error) throw new Error(error.message);
    console.log(`${email} is nu beheerder.`);
    return;
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/bevestigen?volgende=/wachtwoord-herstellen`,
    data: { first_name: "Beheerder", last_name: "YogaCompany" },
  });

  if (error) throw new Error(error.message);

  const { error: rolFout } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", data.user.id);

  if (rolFout) throw new Error(rolFout.message);

  console.log(
    `Uitnodiging verstuurd naar ${email}.\n` +
      "Volg de link in de mail om een wachtwoord te kiezen. Bij de eerste keer\n" +
      "inloggen op /admin wordt tweestapsverificatie verplicht ingesteld.",
  );
}

main().catch((error) => {
  console.error(`\nSeed mislukt: ${error.message}`);
  process.exit(1);
});
