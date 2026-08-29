import Link from "next/link";
import { redirect } from "next/navigation";

import { uitloggen } from "@/features/auth";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Shell van de beheeromgeving (BOUWPROMPT §13).
 *
 * De middleware laat hier alleen beheerders met een aal2-sessie binnen. De
 * controle hieronder is een tweede slot: mocht de middleware ooit door een
 * configuratiefout worden overgeslagen, dan staat de deur alsnog dicht.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) redirect("/inloggen?vervolg=/admin");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name, role, deleted_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (!profiel || profiel.role !== "admin" || profiel.deleted_at !== null) {
    redirect("/portaal");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="op-donker sticky top-0 z-30 border-b border-line bg-petrol">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link
              href="/admin"
              className="font-serif text-xl leading-none font-semibold text-green-dark"
            >
              YogaCompany
            </Link>
            <span className="text-sm text-muted">Beheer</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">
              {profiel.first_name}
            </span>
            <Link
              href="/portaal"
              className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-semibold text-green-dark transition-colors hover:bg-hover"
            >
              Mijn omgeving
            </Link>
            <form action={uitloggen}>
              <button
                type="submit"
                className="inline-flex h-11 items-center text-sm text-muted underline hover:text-green"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:flex">
        <AdminNav />
        <main className="min-w-0 flex-1 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
