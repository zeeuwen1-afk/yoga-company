import { publicEnv } from "@/lib/env";
import type { Cursus } from "../server/queries";

/**
 * Gestructureerde gegevens volgens schema.org/Course (BOUWPROMPT §8.7), zodat
 * zoekmachines het aanbod als opleiding herkennen in plaats van als gewone
 * pagina.
 */
export function CursusJsonLd({ cursus }: { cursus: Cursus }) {
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;
  const pad = cursus.type === "opleiding" ? "opleidingen" : "trainingen";
  const url = `${basis}/${pad}/${cursus.slug}`;
  const online = cursus.locatie === "Online";

  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: cursus.titel,
    description: cursus.samenvatting,
    url,
    inLanguage: "nl-NL",
    provider: {
      "@type": "Organization",
      name: "Yoga Companie",
      url: basis,
    },
    offers: {
      "@type": "Offer",
      price: (cursus.prijsCenten / 100).toFixed(2),
      priceCurrency: "EUR",
      category: "Paid",
      url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: online ? "Online" : "Onsite",
      inLanguage: "nl-NL",
      ...(cursus.maxDeelnemers
        ? { maximumAttendeeCapacity: cursus.maxDeelnemers }
        : {}),
      ...(cursus.locatie && !online
        ? { location: { "@type": "Place", name: cursus.locatie } }
        : {}),
    },
    ...(cursus.toelatingseisen
      ? { coursePrerequisites: cursus.toelatingseisen }
      : {}),
    ...(cursus.certificaat
      ? { educationalCredentialAwarded: cursus.certificaat }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // De inhoud komt uit onze eigen database en bevat geen invoer van
      // bezoekers; JSON.stringify dekt het ontsnappen van de waarden af.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
