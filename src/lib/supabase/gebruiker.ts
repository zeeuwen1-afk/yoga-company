import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Haalt de geverifieerde gebruiker op en levert `null` wanneer dat niet lukt.
 *
 * `getUser()` gooit bij een netwerkstoring. Een pagina mag daar nooit op
 * omvallen: valt Supabase weg, dan behandelen we de bezoeker als niet
 * ingelogd. Dat is de veilige kant — afgeschermde routes sturen dan door naar
 * de inlogpagina in plaats van iets te tonen wat verborgen hoort te blijven.
 */
export async function huidigeGebruiker(
  supabase: SupabaseClient<Database>,
): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
