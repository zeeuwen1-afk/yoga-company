import { NextResponse, type NextRequest } from "next/server";

import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Toegangscontrole voor de afgeschermde delen van het platform
 * (BOUWPROMPT §7).
 *
 *   /portaal/*  ingelogd zijn is genoeg
 *   /admin/*    adminrol én een sessie met tweestapsverificatie (aal2)
 *
 * De controle staat hier zodat een pagina nooit per ongeluk onbeschermd kan
 * worden opgeleverd. Rechten op de data zelf komen daarnaast uit RLS: deze
 * middleware is een extra laag, geen vervanging.
 */

const AANMELDPAD = "/inloggen";
const TWEESTAPS_PAD = "/tweestapsverificatie";

function redirect(request: NextRequest, pad: string, params?: URLSearchParams) {
  const url = request.nextUrl.clone();
  url.pathname = pad;
  url.search = params ? `?${params}` : "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pad = request.nextUrl.pathname;
  const isPortaal = pad.startsWith("/portaal");
  const isAdmin = pad.startsWith("/admin");

  // Publieke pagina's raken de database niet: dat scheelt een netwerkronde per
  // verzoek en houdt de publieke site onafhankelijk van Supabase. De sessie
  // wordt ververst zodra iemand een afgeschermd deel opent.
  if (!isPortaal && !isAdmin) {
    return NextResponse.next({ request });
  }

  const { supabase, getResponse } = createMiddlewareClient(request);

  // Gebruik altijd getUser(): dat controleert het token bij Supabase, in
  // tegenstelling tot getSession(), dat alleen de cookie leest en dus te
  // vertrouwen is voor weergave maar niet voor toegangscontrole.
  // Lukt de controle niet, dan geldt de bezoeker als niet ingelogd: bij twijfel
  // sluiten we de deur in plaats van hem open te laten staan.
  const user = await huidigeGebruiker(supabase);

  if (!user) {
    const params = new URLSearchParams({ vervolg: pad });
    return redirect(request, AANMELDPAD, params);
  }

  if (isAdmin) {
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role, deleted_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profiel || profiel.role !== "admin" || profiel.deleted_at !== null) {
      // Geen adminrechten: doorsturen naar het portaal in plaats van naar de
      // inlogpagina, zodat we niet prijsgeven dat deze route bestaat.
      const url = request.nextUrl.clone();
      url.pathname = "/portaal";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Tweestapsverificatie is verplicht voor admins (BOUWPROMPT §7).
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal?.currentLevel !== "aal2") {
      const params = new URLSearchParams({ vervolg: pad });
      return redirect(request, TWEESTAPS_PAD, params);
    }
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Alle paden behalve statische bestanden en beeldmateriaal. De middleware
     * draait ook op publieke routes, omdat de sessie daar ververst moet worden.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
