import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

import type { Database } from "./types";

/**
 * Client voor openbare inhoud: het aanbod en de CMS-blokken.
 *
 * Leest geen cookies en kent dus geen sessie. Dat is bewust:
 *
 *  - publieke pagina's tonen voor iedereen hetzelfde, dus een sessie voegt
 *    niets toe;
 *  - zou deze client wél cookies lezen, dan wordt elke pagina dynamisch en
 *    vervalt de statische generatie waar de laadsnelheid op leunt (§18).
 *
 * De anon key betekent dat RLS onverkort geldt: deze client ziet precies wat
 * een willekeurige bezoeker mag zien, niets meer.
 */
export function createPublicClient() {
  const env = publicEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
