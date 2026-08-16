import type { Metadata } from "next";

import { Gesprek } from "@/features/messages/components/gesprek";
import { haalGesprek, markeerBerichtenGelezen } from "@/features/messages";

export const metadata: Metadata = {
  title: "Berichten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BerichtenPage() {
  const berichten = await haalGesprek();

  // Openen betekent gelezen: zo klopt de teller met wat de klant heeft gezien.
  await markeerBerichtenGelezen();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl">Berichten</h1>
        <p className="mt-2 text-muted">
          Je persoonlijke lijn met YogaCompany. Alleen jij en wij lezen mee.
        </p>
      </div>

      <Gesprek berichten={berichten} />
    </div>
  );
}
