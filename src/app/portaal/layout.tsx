import { redirect } from "next/navigation";

import { PortaalBottomNav } from "@/features/portaal/components/bottom-nav";
import { PortaalZijbalk } from "@/features/portaal/components/zijbalk";
import { PortaalTopbalk } from "@/features/portaal/components/topbalk";
import { haalOngelezenAantal } from "@/features/messages";
import { haalOpenAanvragen } from "@/features/requests";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Shell van het klantportaal (BOUWPROMPT §11).
 *
 * Twee verschijningsvormen, bewust verschillend:
 *
 *  - **Telefoon (< 768px):** bottom-navigatie met vier items, grote
 *    tap-targets, één taak per scherm. Geen zijbalk, geen uitklapmenu's.
 *  - **Tablet en groter (≥ 768px):** een rustige zijbalk, zoals op een laptop.
 *
 * De middleware laat hier alleen ingelogde bezoekers toe; de controle
 * hieronder is een tweede slot en levert tegelijk het profiel voor de
 * begroeting.
 */
export default async function PortaalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) redirect("/inloggen?vervolg=/portaal");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", gebruiker.id)
    .maybeSingle();

  const [ongelezen, openAanvragen] = await Promise.all([
    haalOngelezenAantal(),
    haalOpenAanvragen(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <PortaalTopbalk
        voornaam={profiel?.first_name ?? null}
        isAdmin={profiel?.role === "admin"}
      />

      <div className="mx-auto flex max-w-6xl gap-8 px-4 sm:px-6">
        <PortaalZijbalk ongelezen={ongelezen} openAanvragen={openAanvragen} />

        {/* Ruimte onderaan zodat de bottom-navigatie niets afdekt. */}
        <main className="min-w-0 flex-1 pt-6 pb-28 md:pt-8 md:pb-16">
          {children}
        </main>
      </div>

      <PortaalBottomNav ongelezen={ongelezen} />
    </div>
  );
}
