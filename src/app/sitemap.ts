import type { MetadataRoute } from "next";

import { JURIDISCHE_TEKSTEN } from "@/content/juridisch";
import { haalAanbod } from "@/features/courses";
import { publicEnv } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;
  const cursussen = await haalAanbod();

  const vast: MetadataRoute.Sitemap = [
    { url: `${basis}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${basis}/opleidingen`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${basis}/trainingen`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${basis}/over-ons`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${basis}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${basis}/veiligheid`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const aanbod: MetadataRoute.Sitemap = cursussen.map((cursus) => ({
    url: `${basis}/${cursus.type === "opleiding" ? "opleidingen" : "trainingen"}/${cursus.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const juridisch: MetadataRoute.Sitemap = JURIDISCHE_TEKSTEN.map((tekst) => ({
    url: `${basis}/${tekst.pageKey}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...vast, ...aanbod, ...juridisch];
}
