import type { NextConfig } from "next";

/**
 * Securityheaders (BOUWPROMPT §17.2).
 *
 * De Content-Security-Policy staat standaard aan en somt expliciet op met
 * welke hosts de pagina mag praten. Alles wat er niet in staat, wordt door de
 * browser geblokkeerd — ook als er ooit per ongeluk een script van elders in
 * de pagina belandt.
 */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

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
  // Alleen in productie. Lokaal draait alles over http; Safari waardeert dan
  // ook de stylesheet en scripts op naar https, die vervolgens niet laden.
  ...(process.env.NODE_ENV === "production"
    ? ["upgrade-insecure-requests"]
    : []),
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
