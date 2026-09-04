import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

/**
 * Client voor handelingen die een e-mail met een link versturen: registreren
 * en wachtwoord vergeten.
 *
 * De gewone `createClient()` hierboven gebruikt PKCE. Dat bindt de link aan de
 * browser waarin hij is aangevraagd: Supabase legt daar een geheim in een
 * cookie en de link werkt alleen zolang die cookie er staat. Dat sneuvelt bij
 * het normaalste gebruik dat er is — aanvragen op de laptop, de mail openen op
 * de telefoon — en ook wanneer de linkscanner van een mailprovider de link
 * alvast opent. De bezoeker belandt dan op het inlogscherm zonder te begrijpen
 * waarom.
 *
 * Met `flowType: "implicit"` geeft Supabase een gewone `token_hash` uit, die
 * op elk apparaat werkt: dezelfde soort link als `generateLink()` server-side
 * maakt. De bescherming blijft overeind, want de link is eenmalig, verloopt na
 * een uur en komt alleen aan in het postvak van de rekeninghouder.
 */
export function createMailLinkClient() {
  const env = publicEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: "implicit",
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
