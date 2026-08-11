import type { Metadata } from "next";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { CursusFormulier } from "@/features/courses/components/cursus-formulier";

export const metadata: Metadata = {
  title: "Nieuw aanbod",
  robots: { index: false, follow: false },
};

export default function NieuwAanbodPage() {
  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/aanbod", label: "Aanbod" }}
        titel="Nieuw aanbod"
        toelichting="Zet hem eerst op verborgen; dan kun je hem rustig afmaken voordat hij online komt."
      />

      <Paneel>
        <div className="p-5">
          <CursusFormulier isActief={false} />
        </div>
      </Paneel>
    </>
  );
}
