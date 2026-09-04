/**
 * Foto's verkleinen in de browser, vóór ze naar de opslag gaan.
 *
 * Een foto van een moderne telefoon is 3 tot 5 MB en meet al gauw vijfduizend
 * pixels. De breedste plek waar hij ooit terechtkomt is 1600 pixels. Alles
 * daarboven wordt opgeslagen, geback-upt en bij elke bewerking opnieuw
 * gedownload, zonder dat iemand het ooit ziet.
 *
 * Dit gebeurt bewust in de browser en niet op de server. Zo wordt de trage stap
 * — het uploaden zelf — meteen tien keer korter, in plaats van dat we een groot
 * bestand eerst helemaal ontvangen en het daarna pas weggooien.
 *
 * Twee dingen die makkelijk misgaan bij dit soort werk en hier zijn afgevangen:
 *
 *  - **Foto's op hun kant.** Telefoons slaan een staande foto vaak liggend op,
 *    met een notitie erbij dat hij een kwartslag gedraaid moet worden. Wie die
 *    notitie negeert bij het verkleinen, krijgt een scheve foto terug.
 *    `imageOrientation: "from-image"` laat de browser de draaiing toepassen.
 *  - **Groter dan het origineel.** Een klein, al geoptimaliseerd bestand kan na
 *    opnieuw opslaan groter worden. Dan houden we het origineel.
 *
 * Lukt het verkleinen niet — te weinig geheugen op een oud toestel, een
 * bestandssoort die de browser niet kent — dan gaat het origineel alsnog weg.
 * Trager, maar de gebruiker loopt nergens op vast.
 */

/**
 * De langste zijde na verkleinen.
 *
 * Ruim twee keer de breedste plek waar een foto terechtkomt (1600 pixels voor
 * een hero). Die marge is er voor schermen met een hoge pixeldichtheid en voor
 * een groter kader later, zonder dat de bestanden onnodig zwaar worden.
 */
export const MAX_ZIJDE = 2560;

/** Kwaliteit voor WebP. Boven 0,85 groeit het bestand harder dan het oog volgt. */
const KWALITEIT = 0.82;

/**
 * Onder deze grens laten we een bestand met rust als het toch al klein genoeg
 * is: opnieuw opslaan kost dan alleen maar kwaliteit.
 */
const AL_GOED_BYTES = 400 * 1024;

export type VerkleinResultaat = {
  bestand: File;
  /** Is er daadwerkelijk iets veranderd? Alleen voor logging en tests. */
  verkleind: boolean;
};

/**
 * Verkleint een afbeelding tot maximaal {@link MAX_ZIJDE} pixels op de langste
 * zijde en slaat hem op als WebP. Geeft altijd een bruikbaar bestand terug,
 * desnoods het origineel.
 */
export async function verkleinAfbeelding(
  bestand: File,
): Promise<VerkleinResultaat> {
  if (!bestand.type.startsWith("image/")) {
    return { bestand, verkleind: false };
  }

  // Een gif kan bewegen. Verkleinen zou daar één plaatje van maken, en dat is
  // niet wat iemand bedoelde toen hij hem uitkoos.
  if (bestand.type === "image/gif") {
    return { bestand, verkleind: false };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(bestand, {
      imageOrientation: "from-image",
    });
  } catch {
    return { bestand, verkleind: false };
  }

  try {
    const langste = Math.max(bitmap.width, bitmap.height);
    const schaal = Math.min(1, MAX_ZIJDE / langste);

    // Past al en is al zuinig: niets aan doen.
    if (schaal === 1 && bestand.size <= AL_GOED_BYTES) {
      return { bestand, verkleind: false };
    }

    const breedte = Math.max(1, Math.round(bitmap.width * schaal));
    const hoogte = Math.max(1, Math.round(bitmap.height * schaal));

    const canvas = document.createElement("canvas");
    canvas.width = breedte;
    canvas.height = hoogte;

    const ctx = canvas.getContext("2d");
    if (!ctx) return { bestand, verkleind: false };

    ctx.drawImage(bitmap, 0, 0, breedte, hoogte);

    const blob = await naarBlob(canvas);
    if (!blob) return { bestand, verkleind: false };

    // Opnieuw opslaan leverde niets op. Gebeurt bij kleine, al geoptimaliseerde
    // bestanden; dan is het origineel gewoon beter.
    if (blob.size >= bestand.size) {
      return { bestand, verkleind: false };
    }

    const naam = vervangExtensie(bestand.name, blob.type);
    return {
      bestand: new File([blob], naam, {
        type: blob.type,
        lastModified: Date.now(),
      }),
      verkleind: true,
    };
  } catch {
    return { bestand, verkleind: false };
  } finally {
    // Opruimen mag het resultaat nooit alsnog onderuithalen: als dit omvalt,
    // is de foto al klaar en zou de gebruiker een foutmelding krijgen voor
    // iets wat gelukt is.
    try {
      bitmap.close();
    } catch {
      // Niets aan te doen, en niets aan verloren.
    }
  }
}

/**
 * WebP waar het kan, JPEG waar het niet kan. Safari kon jarenlang wel WebP
 * lezen maar niet schrijven; dan geeft `toBlob` stilletjes een PNG terug, en
 * die is voor een foto juist veel groter.
 */
async function naarBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const webp = await blobVan(canvas, "image/webp");
  if (webp && webp.type === "image/webp") return webp;
  return blobVan(canvas, "image/jpeg");
}

function blobVan(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  return new Promise((klaar) => {
    canvas.toBlob((blob) => klaar(blob), type, KWALITEIT);
  });
}

function vervangExtensie(naam: string, type: string): string {
  const extensie = type === "image/webp" ? "webp" : "jpg";
  const zonder = naam.replace(/\.[^.]+$/, "");
  return `${zonder || "foto"}.${extensie}`;
}
