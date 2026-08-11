import "server-only";

import type { SocialPlatform } from "./prompt";

/**
 * Publiceren via de Meta Graph API (BOUWPROMPT §15, stap 2).
 *
 * Deze koppeling staat achter de feature flag `META_PUBLISHING_ENABLED` en is
 * bewust volledig optioneel. Meta vraagt voor publiceren om een
 * developer-account, een app en een app-review op de publish-permissies — een
 * traject van weken. Tot die tijd werkt de socialmediatool via stap 1
 * (kopiëren en handmatig plaatsen) zonder enige beperking.
 *
 * Wat hier bewust níét staat: een OAuth-flow met opslag van tokens in de
 * database. Zolang er één Facebook-pagina en één Instagram-account is, is een
 * long-lived page token in de environment eenvoudiger, veiliger (het staat
 * nergens in onze database) en makkelijker in te trekken. Komen er meerdere
 * accounts, dan hoort hier een tokens-tabel met versleuteling bij.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export type MetaInstellingen = {
  token: string;
  paginaId: string | null;
  instagramId: string | null;
};

/** Staat de vlag aan én zijn de gegevens compleet? */
export function metaIngericht(): boolean {
  return (
    process.env.META_PUBLISHING_ENABLED === "true" &&
    Boolean(process.env.META_ACCESS_TOKEN)
  );
}

function instellingen(): MetaInstellingen | null {
  if (!metaIngericht()) return null;
  return {
    token: process.env.META_ACCESS_TOKEN as string,
    paginaId: process.env.META_PAGE_ID ?? null,
    instagramId: process.env.META_INSTAGRAM_ACCOUNT_ID ?? null,
  };
}

export type MetaResultaat =
  { status: "gelukt"; kanalen: string[] } | { status: "fout"; bericht: string };

async function post(pad: string, velden: Record<string, string>) {
  const antwoord = await fetch(`${GRAPH}/${pad}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(velden),
  });

  const data = (await antwoord.json()) as {
    id?: string;
    error?: { message?: string };
  };

  if (!antwoord.ok || !data.id) {
    throw new Error(data.error?.message ?? "onbekende fout van Meta");
  }

  return data.id;
}

/** Instagram publiceert in twee stappen: eerst container, dan publiceren. */
async function naarInstagram(
  meta: MetaInstellingen,
  caption: string,
  afbeeldingUrl: string,
) {
  if (!meta.instagramId) {
    throw new Error("Er is geen Instagram-account ingesteld");
  }

  const containerId = await post(`${meta.instagramId}/media`, {
    image_url: afbeeldingUrl,
    caption,
    access_token: meta.token,
  });

  await post(`${meta.instagramId}/media_publish`, {
    creation_id: containerId,
    access_token: meta.token,
  });
}

async function naarFacebook(
  meta: MetaInstellingen,
  caption: string,
  afbeeldingUrl: string,
) {
  if (!meta.paginaId) {
    throw new Error("Er is geen Facebook-pagina ingesteld");
  }

  await post(`${meta.paginaId}/photos`, {
    url: afbeeldingUrl,
    caption,
    access_token: meta.token,
  });
}

/**
 * Publiceert een bericht. Instagram staat geen post zonder beeld toe, dus een
 * afbeelding is hier altijd verplicht — ook voor Facebook, zodat het bericht op
 * beide kanalen hetzelfde is.
 */
export async function publiceerViaMeta({
  platform,
  caption,
  afbeeldingUrl,
}: {
  platform: SocialPlatform;
  caption: string;
  afbeeldingUrl: string | null;
}): Promise<MetaResultaat> {
  const meta = instellingen();

  if (!meta) {
    return {
      status: "fout",
      bericht:
        "Publiceren via Meta staat uit. Kopieer de tekst en plaats hem handmatig.",
    };
  }

  if (!afbeeldingUrl) {
    return {
      status: "fout",
      bericht: "Kies eerst een afbeelding; Meta publiceert niet zonder beeld.",
    };
  }

  const kanalen: string[] = [];

  try {
    if (platform === "instagram" || platform === "beide") {
      await naarInstagram(meta, caption, afbeeldingUrl);
      kanalen.push("Instagram");
    }
    if (platform === "facebook" || platform === "beide") {
      await naarFacebook(meta, caption, afbeeldingUrl);
      kanalen.push("Facebook");
    }
  } catch (fout) {
    const reden = fout instanceof Error ? fout.message : "onbekende fout";
    console.error(`[social] publiceren via Meta mislukt: ${reden}`);

    return {
      status: "fout",
      bericht:
        kanalen.length > 0
          ? `Geplaatst op ${kanalen.join(" en ")}, daarna ging het mis: ${reden}`
          : `Publiceren mislukt: ${reden}`,
    };
  }

  return { status: "gelukt", kanalen };
}
