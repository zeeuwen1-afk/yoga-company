import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Landingsroute voor de links uit accountverificatie-, uitnodigings- en
 * wachtwoordherstelmails. Wisselt de eenmalige code in voor een sessie en
 * stuurt daarna door (BOUWPROMPT §7, §10).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const volgende = searchParams.get("volgende") ?? "/portaal";
  const bestemming = volgende.startsWith("/") ? volgende : "/portaal";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/inloggen?fout=link_ongeldig`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(`${origin}/inloggen?fout=link_verlopen`);
  }

  return NextResponse.redirect(`${origin}${bestemming}`);
}
