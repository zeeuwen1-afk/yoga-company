#!/usr/bin/env node
/**
 * Maakt de merkbestanden in `public/brand/` uit het aangeleverde logo.
 *
 * Het origineel is een PDF met het logo als bitmap van 1600x1138. Die PDF
 * rendert misleidend: er staat `/Rotate 90` op en het beeld is groter gezet
 * dan de A4-pagina, dus wie hem opent ziet een gedraaid en afgesneden logo.
 * De bitmap zelf is ongeschonden. Dit script haalt hem eruit en snijdt de
 * varianten die §2 van de bouwprompt vraagt.
 *
 * Alles gebeurt met zlib uit de standaardbibliotheek; er komt geen
 * beeldbewerkingspakket aan te pas (§11.4).
 *
 *   pnpm brand:assets
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const BRON = path.join(ROOT, "brand-bron", "logo-yogacompany-gestapeld.pdf");
const UIT = path.join(ROOT, "public", "brand");

// De merkkleuren zoals ze letterlijk in het logo staan (§2).
const NACHTGROEN = [0x2f, 0x42, 0x39];
const SALIE = [0xa9, 0xbc, 0xa1];
const ONDERTITEL = [0x77, 0x84, 0x72];
const PAPER = [0xf9, 0xf7, 0xf1];

// ---------------------------------------------------------------------------
// De bitmap uit de PDF halen
// ---------------------------------------------------------------------------

/** @returns {{width:number,height:number,data:Buffer}} RGBA */
async function leesLogo() {
  const pdf = await readFile(BRON);

  const objecten = new Map();
  const objectRegex = /(\d+)\s+(\d+)\s+obj\b/g;
  const tekst = pdf.toString("latin1");
  let match;
  while ((match = objectRegex.exec(tekst)) !== null) {
    const start = match.index + match[0].length;
    const eind = tekst.indexOf("endobj", start);
    objecten.set(Number(match[1]), { start, eind });
  }

  function stream(nummer) {
    const { start, eind } = objecten.get(nummer);
    const body = tekst.slice(start, eind);
    let i = body.indexOf("stream") + "stream".length;
    if (body.slice(i, i + 2) === "\r\n") i += 2;
    else if (body[i] === "\n" || body[i] === "\r") i += 1;
    const j = body.lastIndexOf("endstream");
    return zlib.inflateSync(pdf.subarray(start + i, start + j));
  }

  function dict(nummer) {
    const { start, eind } = objecten.get(nummer);
    const body = tekst.slice(start, eind);
    const i = body.indexOf("stream");
    return i === -1 ? body : body.slice(0, i);
  }

  // De beeldobjecten opzoeken in plaats van objectnummers vast te leggen: dan
  // blijft dit werken als de PDF ooit opnieuw wordt geëxporteerd.
  let beeld = null;
  for (const nummer of objecten.keys()) {
    const d = dict(nummer);
    if (!d.includes("/Subtype") || !d.includes("/Image")) continue;
    const breedte = Number(/\/Width\s+(\d+)/.exec(d)?.[1] ?? 0);
    if (!beeld || breedte > beeld.width) {
      beeld = {
        nummer,
        width: breedte,
        height: Number(/\/Height\s+(\d+)/.exec(d)?.[1] ?? 0),
        smask: Number(/\/SMask\s+(\d+)\s+\d+\s+R/.exec(d)?.[1] ?? 0) || null,
      };
    }
  }
  if (!beeld) throw new Error(`Geen beeld gevonden in ${BRON}`);

  const { width, height } = beeld;
  const rgb = stream(beeld.nummer);
  const alfa = beeld.smask
    ? stream(beeld.smask)
    : Buffer.alloc(width * height, 255);

  const kanalen = rgb.length / (width * height);
  if (kanalen !== 3) {
    throw new Error(`Verwacht RGB, kreeg ${kanalen} kanalen per pixel`);
  }

  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = rgb[i * 3];
    data[i * 4 + 1] = rgb[i * 3 + 1];
    data[i * 4 + 2] = rgb[i * 3 + 2];
    data[i * 4 + 3] = alfa[i];
  }
  return { width, height, data };
}

// ---------------------------------------------------------------------------
// Beeldbewerkingen
// ---------------------------------------------------------------------------

function bbox(beeld, y0 = 0, y1 = beeld.height) {
  let minX = beeld.width;
  let minY = beeld.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = y0; y < y1; y += 1) {
    for (let x = 0; x < beeld.width; x += 1) {
      if (beeld.data[(y * beeld.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    x: minX,
    y: minY,
    breedte: maxX - minX + 1,
    hoogte: maxY - minY + 1,
  };
}

function snij(beeld, { x, y, breedte, hoogte }) {
  const data = Buffer.alloc(breedte * hoogte * 4);
  for (let ry = 0; ry < hoogte; ry += 1) {
    beeld.data.copy(
      data,
      ry * breedte * 4,
      ((y + ry) * beeld.width + x) * 4,
      ((y + ry) * beeld.width + x + breedte) * 4,
    );
  }
  return { width: breedte, height: hoogte, data };
}

/**
 * Verkleinen met een box-filter over vóórvermenigvuldigde alfa. Zonder die
 * vóórvermenigvuldiging kleuren doorzichtige randpixels mee en krijgt het logo
 * een vuile rand.
 */
function schaal(beeld, nieuweBreedte) {
  const factor = beeld.width / nieuweBreedte;
  const nieuweHoogte = Math.max(1, Math.round(beeld.height / factor));
  const data = Buffer.alloc(nieuweBreedte * nieuweHoogte * 4);

  for (let y = 0; y < nieuweHoogte; y += 1) {
    const y0 = Math.floor((y * beeld.height) / nieuweHoogte);
    const y1 = Math.max(
      y0 + 1,
      Math.floor(((y + 1) * beeld.height) / nieuweHoogte),
    );
    for (let x = 0; x < nieuweBreedte; x += 1) {
      const x0 = Math.floor((x * beeld.width) / nieuweBreedte);
      const x1 = Math.max(
        x0 + 1,
        Math.floor(((x + 1) * beeld.width) / nieuweBreedte),
      );

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (sy * beeld.width + sx) * 4;
          const alfa = beeld.data[i + 3] / 255;
          r += beeld.data[i] * alfa;
          g += beeld.data[i + 1] * alfa;
          b += beeld.data[i + 2] * alfa;
          a += beeld.data[i + 3];
          n += 1;
        }
      }
      const gemAlfa = a / n;
      const i = (y * nieuweBreedte + x) * 4;
      if (gemAlfa > 0) {
        const deel = gemAlfa / 255;
        data[i] = Math.round(r / n / deel);
        data[i + 1] = Math.round(g / n / deel);
        data[i + 2] = Math.round(b / n / deel);
      }
      data[i + 3] = Math.round(gemAlfa);
    }
  }
  return { width: nieuweBreedte, height: nieuweHoogte, data };
}

function leegBeeld(breedte, hoogte) {
  return {
    width: breedte,
    height: hoogte,
    data: Buffer.alloc(breedte * hoogte * 4),
  };
}

/** Plakt `bron` op positie (x, y) in `doel`; simpel overschrijven volstaat. */
function plak(doel, bron, x, y) {
  for (let ry = 0; ry < bron.height; ry += 1) {
    bron.data.copy(
      doel.data,
      ((y + ry) * doel.width + x) * 4,
      ry * bron.width * 4,
      (ry + 1) * bron.width * 4,
    );
  }
}

function afstand(data, i, kleur) {
  return (
    Math.abs(data[i] - kleur[0]) +
    Math.abs(data[i + 1] - kleur[1]) +
    Math.abs(data[i + 2] - kleur[2])
  );
}

/**
 * Variant voor donkere ondergronden: wat nachtgroen is wordt paper, en de
 * ondertitel gaat naar salie zodat hij leesbaar blijft. De salie in het
 * merkteken blijft ongemoeid.
 */
function voorDonkereAchtergrond(beeld) {
  const data = Buffer.from(beeld.data);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const naarGroen = afstand(data, i, NACHTGROEN);
    const naarSalie = afstand(data, i, SALIE);
    const naarOndertitel = afstand(data, i, ONDERTITEL);
    const kleinste = Math.min(naarGroen, naarSalie, naarOndertitel);
    const nieuw =
      kleinste === naarGroen
        ? PAPER
        : kleinste === naarOndertitel
          ? SALIE
          : SALIE;
    data[i] = nieuw[0];
    data[i + 1] = nieuw[1];
    data[i + 2] = nieuw[2];
  }
  return { width: beeld.width, height: beeld.height, data };
}

/** Legt het beeld gecentreerd in een vierkant met doorzichtige rand. */
function vierkant(beeld, marge = 0.06) {
  const zijde = Math.round(
    Math.max(beeld.width, beeld.height) * (1 + marge * 2),
  );
  const doel = leegBeeld(zijde, zijde);
  plak(
    doel,
    beeld,
    Math.round((zijde - beeld.width) / 2),
    Math.round((zijde - beeld.height) / 2),
  );
  return doel;
}

// ---------------------------------------------------------------------------
// PNG schrijven
// ---------------------------------------------------------------------------

function schrijfPng(beeld) {
  const stride = beeld.width * 4;
  const ruw = Buffer.alloc((stride + 1) * beeld.height);
  for (let y = 0; y < beeld.height; y += 1) {
    ruw[y * (stride + 1)] = 0; // filtertype 0
    beeld.data.copy(ruw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  function blok(tag, inhoud) {
    const lengte = Buffer.alloc(4);
    lengte.writeUInt32BE(inhoud.length);
    const romp = Buffer.concat([Buffer.from(tag, "latin1"), inhoud]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(romp) >>> 0);
    return Buffer.concat([lengte, romp, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(beeld.width, 0);
  ihdr.writeUInt32BE(beeld.height, 4);
  ihdr[8] = 8; // bits per kanaal
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    blok("IHDR", ihdr),
    blok("IDAT", zlib.deflateSync(ruw, { level: 9 })),
    blok("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------

async function bewaar(naam, beeld, map = UIT) {
  const bestand = path.join(map, naam);
  await writeFile(bestand, schrijfPng(beeld));
  console.log(
    `  ✓ ${path.relative(ROOT, bestand)} — ${beeld.width}×${beeld.height}`,
  );
}

const bron = await leesLogo();
await mkdir(UIT, { recursive: true });
console.log(
  `Bron: ${path.relative(ROOT, BRON)} — ${bron.width}×${bron.height}`,
);

// Het logo bestaat uit drie blokken met lege banden ertussen: het merkteken,
// het woordmerk en de ondertitel. Die banden zoeken we op in plaats van de
// grenzen hard in te typen.
const geheel = bbox(bron);
const legeRijen = [];
for (let y = geheel.y; y < geheel.y + geheel.hoogte; y += 1) {
  let leeg = true;
  for (let x = 0; x < bron.width; x += 1) {
    if (bron.data[(y * bron.width + x) * 4 + 3] > 8) {
      leeg = false;
      break;
    }
  }
  if (leeg) legeRijen.push(y);
}
const banden = [];
for (const y of legeRijen) {
  const laatste = banden[banden.length - 1];
  if (laatste && y === laatste[1] + 1) laatste[1] = y;
  else banden.push([y, y]);
}
const scheidingen = banden.filter(([a, b]) => b - a > 4);
if (scheidingen.length < 1) {
  throw new Error("Kan merkteken en woordmerk niet van elkaar scheiden");
}

const merktekenTot = scheidingen[0][0];
const merkteken = snij(bron, bbox(bron, geheel.y, merktekenTot));
const tekstblok = snij(
  bron,
  bbox(bron, scheidingen[0][1], geheel.y + geheel.hoogte),
);

// De tweede lege band scheidt het woordmerk van de ondertitel. Dat woordmerk
// hebben we apart nodig: in een balk van veertig pixels hoog is de ondertitel
// niet meer te lezen en wordt hij ruis in plaats van informatie.
const woordmerk = snij(
  bron,
  scheidingen.length > 1
    ? bbox(bron, scheidingen[0][1], scheidingen[1][0])
    : bbox(bron, scheidingen[0][1], geheel.y + geheel.hoogte),
);

/** Zet merkteken en tekst naast elkaar, verticaal gecentreerd. */
function naastElkaar(links, rechts) {
  const tussenruimte = Math.round(links.width * 0.22);
  const doel = leegBeeld(
    links.width + tussenruimte + rechts.width,
    Math.max(links.height, rechts.height),
  );
  plak(doel, links, 0, Math.round((doel.height - links.height) / 2));
  plak(
    doel,
    rechts,
    links.width + tussenruimte,
    Math.round((doel.height - rechts.height) / 2),
  );
  return doel;
}

// 1. Gestapeld — het aangeleverde logo, alleen bijgesneden.
const gestapeld = snij(bron, geheel);
await bewaar("logo-gestapeld.png", schaal(gestapeld, 1200));

// 2. Horizontaal — merkteken links, tekst met ondertitel rechts. Voor plekken
//    waar het logo groot genoeg staat om de ondertitel te kunnen lezen.
const horizontaal = naastElkaar(merkteken, tekstblok);
await bewaar("logo-horizontaal.png", schaal(horizontaal, 1200));

// 3. Compact — hetzelfde, maar zonder ondertitel. Dit is de variant voor de
//    header: daar is de balk veertig pixels hoog en zou de ondertitel op vier
//    pixels uitkomen. Onleesbaar klein is erger dan weglaten.
const compact = naastElkaar(merkteken, woordmerk);
await bewaar("logo-compact.png", schaal(compact, 900));

// 4. Donker — dezelfde opbouw, voor het nachtgroen in de paginavoet.
await bewaar(
  "logo-horizontaal-donker.png",
  schaal(voorDonkereAchtergrond(horizontaal), 1200),
);
await bewaar(
  "logo-compact-donker.png",
  schaal(voorDonkereAchtergrond(compact), 900),
);
await bewaar(
  "logo-gestapeld-donker.png",
  schaal(voorDonkereAchtergrond(gestapeld), 1200),
);

// 5. Merkteken los, vierkant — voor favicons, avatars en socialprofielen.
const icoon = vierkant(merkteken);
await bewaar("icoon.png", schaal(icoon, 512));

// 6. Favicons volgens de conventies van de App Router.
await bewaar("icon.png", schaal(icoon, 32), path.join(ROOT, "src", "app"));
await bewaar(
  "apple-icon.png",
  schaal(icoon, 180),
  path.join(ROOT, "src", "app"),
);

console.log("\nKlaar.");
