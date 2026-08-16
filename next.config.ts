import type { NextConfig } from "next";

import { isProductiedomein } from "./src/lib/domein";

/**
 * Securityheaders (BOUWPROMPT §17.2).
 *
 * De Content-Security-Policy staat standaard aan en somt expliciet op met
 * welke hosts de pagina mag praten. Alles wat er niet in staat, wordt door de
 * browser geblokkeerd — ook als er ooit per ongeluk een script van elders in
 * de pagina belandt.
 */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Het adres waarop de site draait. Bepaalt of https afgedwongen mag worden. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** Het betaalscherm van Mollie, waar de bezoeker straks naartoe wordt gestuurd. */
const MOLLIE_CHECKOUT = "https://www.mollie.com";

const csp = [
  "default-src 'self'",
  // Next heeft inline scripts nodig om de pagina te hydrateren. In
  // ontwikkeling gebruikt Turbopack daarnaast eval voor hot reloading.
  `script-src 'self' 'unsafe-inline'${
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
  }`,
  // Tailwind en next/font zetten stijlen inline.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  // Mollie staat hier bewust niet bij: het betaalverkeer loopt vanaf de server,
  // niet vanuit de browser. De bezoeker gaat straks alleen naar Mollie toe.
  `connect-src 'self' ${supabaseHost} wss://*.supabase.co`,
  // Alleen video-insluitingen uit de site-editor. Mollie werkt met een
  // doorverwijzing en niet in een iframe; dat is ook hun eigen advies.
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
  "media-src 'self' blob: https://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  // Mollie moet erbij. Inschrijven verloopt via een serveractie die eindigt in
  // een doorverwijzing naar het betaalscherm. Mét JavaScript is dat een gewone
  // navigatie, maar zónder JavaScript wordt het een formulierverzending — en
  // dan blokkeert `form-action 'self'` de doorverwijzing in Chrome.
  `form-action 'self' ${MOLLIE_CHECKOUT}`,
  // De preview van de site-editor draait op dezelfde origin (§17.2).
  "frame-ancestors 'self'",
  // Alleen als de site ook echt over https bereikbaar is. Anders waardeert
  // Safari de stylesheet en de scripts op naar https, die er op een
  // http-adres niet zijn — en dan krijgt de bezoeker een pagina zonder opmaak.
  //
  // De voorwaarde stond eerst op NODE_ENV === "production". Dat is bijna
  // hetzelfde, maar niet helemaal: een productiebuild die op
  // http://localhost draait viel er ook onder. De browsertests op CI draaien
  // precies zo, en acht van hen vielen daarop om — op de mobiele browser, die
  // WebKit gebruikt, net als Safari. Wat het adres is, is de vraag die er
  // toe doet; niet hoe er gebouwd is.
  ...(siteUrl.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN in plaats van DENY, zodat de site-editor de publieke pagina in
  // een preview-iframe kan tonen. Andere origins blijven geweerd.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Zolang dit niet het eigen domein is, blijft de hele site uit de
  // zoekmachines. Bewust een header en geen `Disallow: /` in robots.txt: dat
  // laatste verbiedt het ophálen van de pagina, en dan kan een zoekmachine dit
  // verbod juist niet lezen — het adres belandt dan alsnog in de index, met
  // "geen omschrijving beschikbaar" eronder. Ophalen mag dus; opnemen niet.
  ...(isProductiedomein(siteUrl)
    ? []
    : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Beelden uit de bucket `public-media`, geplaatst via de site-editor.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
