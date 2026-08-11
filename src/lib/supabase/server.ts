import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

import type { Database } from "./types";

/**
 * Supabase-client voor server components, server actions en route handlers.
 * Werkt met de anon key, zodat RLS onverkort van kracht blijft: ook een fout
 * in een query kan geen data van een andere klant opleveren.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server components mogen geen cookies schrijven. De middleware
            // ververst de sessie, dus dit is hier veilig te negeren.
          }
        },
      },
    },
  );
}
