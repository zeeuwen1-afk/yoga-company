import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

import "./globals.css";

// next/font haalt de fontbestanden op tijdens de build en serveert ze vanaf ons
// eigen domein. Er gaat dus geen bezoekersverzoek naar Google — dat voldoet aan
// de eis "geen Google Fonts-CDN" uit §2 van de bouwprompt.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "YogaCompany — opleidingsinstituut voor yoga",
    template: "%s · YogaCompany",
  },
  description:
    "Opleidingen · Trainingen · Lessen. Deskundig en betrouwbaar, warm en persoonlijk.",
};

export const viewport: Viewport = {
  themeColor: "#2F4239",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
