import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PostStatus } from "@/lib/supabase/types";

import type { SocialPlatform } from "./prompt";

/**
 * Opgeslagen socialmediaberichten (BOUWPROMPT §15).
 *
 * De tabel valt onder een admin-only policy; er is hier geen extra
 * rechtencontrole nodig. Leest een klant per ongeluk toch mee, dan krijgt hij
 * een lege lijst in plaats van andermans gegevens.
 */

export type SocialBericht = {
  id: string;
  platform: SocialPlatform;
  caption: string;
  afbeeldingPad: string | null;
  afbeeldingUrl: string | null;
  status: PostStatus;
  onderwerp: string | null;
  doel: string | null;
  gepubliceerdOp: string | null;
  fout: string | null;
  aangemaaktOp: string;
};

/** De publieke URL van een bestand in `public-media`. */
export function beeldUrl(pad: string | null): string | null {
  if (!pad) return null;
  const basis = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!basis) return null;
  return `${basis}/storage/v1/object/public/public-media/${pad}`;
}

export async function haalSocialBerichten(): Promise<SocialBericht[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("social_posts")
    .select(
      "id, platform, caption, image_path, status, topic, goal, published_at, error, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((rij) => ({
    id: rij.id,
    platform: rij.platform,
    caption: rij.caption,
    afbeeldingPad: rij.image_path,
    afbeeldingUrl: beeldUrl(rij.image_path),
    status: rij.status,
    onderwerp: rij.topic,
    doel: rij.goal,
    gepubliceerdOp: rij.published_at,
    fout: rij.error,
    aangemaaktOp: rij.created_at,
  }));
}
