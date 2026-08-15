import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";

import type { Database } from "./types";

/**
 * Client met de service-role key. Deze omzeilt Row Level Security volledig en
 * mag daarom uitsluitend server-side worden gebruikt, voor handelingen die
 * niet aan een ingelogde gebruiker hangen: de Mollie-webhook, het uitnodigen
 * van accounts en AVG-verwijdering (BOUWPROMPT §17.1).
 *
 * Gebruik in alle andere gevallen `createClient()` uit `./server`, zodat RLS
 * de klantscheiding blijft afdwingen.
 */
export function createAdminClient() {
  const env = publicEnv();
  const secrets = serverEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    secrets.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}

/**
 * Is de service-role sleutel er?
 *
 * Handelingen die deze client nodig hebben — uitnodigen, wachtwoordherstel,
 * tweestapsverificatie loskoppelen, AVG-verwijdering — kunnen zonder die
 * sleutel niet. Zonder deze controle gooit `serverEnv()` een fout en krijgt de
 * beheerder een klapper in plaats van uitleg.
 */
export function serviceRoleBeschikbaar(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
