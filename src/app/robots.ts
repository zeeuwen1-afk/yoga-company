import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // De afgeschermde delen horen niet in een zoekmachine thuis.
      disallow: ["/portaal", "/admin", "/api/", "/dev/", "/auth/"],
    },
    sitemap: `${basis}/sitemap.xml`,
    host: basis,
  };
}
