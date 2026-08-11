import type { Metadata, Viewport } from "next";
import { EB_Garamond, Source_Sans_3 } from "next/font/google";

import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Yoga Companie — opleidingsinstituut voor yoga",
    template: "%s · Yoga Companie",
  },
  description:
    "Opleidingen, trainingen en yogalessen. Deskundig en betrouwbaar, warm en persoonlijk.",
};

export const viewport: Viewport = {
  themeColor: "#2E4A3B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${ebGaramond.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
