import type { Metadata } from "next";

import {
  haalEigenBoekingen,
  haalRoosterVoorPortaal,
  Rooster,
} from "@/features/bookings";

export const metadata: Metadata = {
  title: "Lessen",
  robots: { index: false, follow: false },
};

// Het rooster en de eigen boekingen moeten altijd actueel zijn: hier boekt en
// annuleert de klant, en een verouderd beeld leidt tot een mislukte poging.
export const dynamic = "force-dynamic";

export default async function PortaalLessenPage() {
  const [lessen, boekingen] = await Promise.all([
    haalRoosterVoorPortaal(),
    haalEigenBoekingen(),
  ]);

  const geboekt = lessen.filter((les) => boekingen.has(les.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">Lessen</h1>
        <p className="mt-2 text-muted">
          Boek een plek in het weekrooster. Annuleren kan tot vier uur voor
          aanvang; is een les vol, dan kom je op de wachtlijst en schuiven we je
          door zodra er een plek vrijkomt.
        </p>
      </div>

      {geboekt.length > 0 ? (
        <section aria-labelledby="mijn-lessen">
          <h2 id="mijn-lessen" className="text-xl">
            Jouw lessen
          </h2>
          <div className="mt-4">
            <Rooster lessen={geboekt} boekingen={boekingen} ingelogd />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="rooster">
        <h2 id="rooster" className="text-xl">
          Het rooster
        </h2>
        <div className="mt-4">
          <Rooster lessen={lessen} boekingen={boekingen} ingelogd />
        </div>
      </section>
    </div>
  );
}
