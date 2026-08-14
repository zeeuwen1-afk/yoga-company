#!/usr/bin/env node
/**
 * Haalt de sfeerbeelden op bij Unsplash en zet ze in `public/beeld/`.
 *
 * Waarom in de repo en niet vanaf een beeld-CDN
 * ---------------------------------------------
 * Een beeld dat je vanaf een externe server laadt, betekent dat de browser van
 * je bezoeker contact maakt met die partij — inclusief IP-adres en
 * referer-header. Dat is precies wat §3 en `docs/avg.md` willen voorkomen.
 * Daarom halen we ze hier één keer op en serveren we ze van ons eigen domein.
 *
 * Licentie
 * --------
 * Alle beelden vallen onder de Unsplash-licentie: vrij te gebruiken, ook
 * commercieel, zonder naamsvermelding. De fotograaf staat er hieronder toch
 * bij — dat hoort, ook als het niet moet. Beelden onder Unsplash+ (te
 * herkennen aan plus.unsplash.com) zijn bewust niet gebruikt: die vragen een
 * betaald abonnement.
 *
 * De beelden zijn een tussenoplossing tot er eigen foto's zijn.
 *
 *   pnpm beeld:ophalen
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const BEELDEN = [
  {
    bestand: "hero-gordijn.jpg",
    cdn: "https://images.unsplash.com/photo-1682421938316-4b186e25174c",
    fotograaf: "Saad Ahmad",
    bron: "https://unsplash.com/photos/3VSa5sbvdpc",
    alt: "De schaduw van een plant op een linnen gordijn",
    breedte: 1440,
    hoogte: 1080,
  },
  {
    bestand: "opleidingen-lattenwand.jpg",
    cdn: "https://images.unsplash.com/photo-1700798001708-dacda2a012b3",
    fotograaf: "Declan Sun",
    bron: "https://unsplash.com/photos/HjSkMsTvaPo",
    alt: "Zacht licht op een wand van verticale houten latten",
    breedte: 1600,
    hoogte: 500,
  },
  {
    bestand: "lessen-studio.jpg",
    cdn: "https://images.unsplash.com/photo-1512972972907-6d71529c5e92",
    fotograaf: "Daniel Chen",
    bron: "https://unsplash.com/photos/SoNaNOFT974",
    alt: "Een rustige ruimte met een houten bank, twee zitkussens en een rond raam",
    breedte: 1600,
    hoogte: 700,
  },
  {
    bestand: "trainingen-blad.jpg",
    cdn: "https://images.unsplash.com/photo-1600172454520-134a542a2255",
    fotograaf: "Milad Fakurian",
    bron: "https://unsplash.com/photos/UqP7U400AZs",
    alt: "De schaduw van een plant op een lichte muur",
    breedte: 1600,
    hoogte: 700,
  },
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const uit = path.join(process.cwd(), "public", "beeld");
  await mkdir(uit, { recursive: true });

  for (const b of BEELDEN) {
    // Unsplash snijdt en verkleint zelf, dus we halen precies op wat we nodig
    // hebben in plaats van een bestand van tien megabyte.
    const url =
      `${b.cdn}?w=${b.breedte}&h=${b.hoogte}` +
      "&fit=crop&crop=entropy&q=72&fm=jpg";

    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.error(`  ✗ ${b.bestand}: ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(uit, b.bestand), buf);
    console.log(`  ✓ ${b.bestand} — ${(buf.length / 1024).toFixed(0)} kB`);
  }
}
