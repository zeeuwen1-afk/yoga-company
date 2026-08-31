"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/**
 * Afbeelding kiezen voor een blok (BOUWPROMPT §14).
 *
 * Twee dingen die geen optie zijn:
 *
 *  - **Alt-tekst is verplicht.** Zonder beschrijving is de afbeelding er niet
 *    voor wie hem niet kan zien, en dat is een toegankelijkheidseis (§18).
 *    Opslaan kan pas als het veld is ingevuld.
 *  - **De upload gaat rechtstreeks naar de opslag.** Schrijven in
 *    `public-media` mag alleen een beheerder; dat dwingt het storagebeleid af.
 */

const MAX_BYTES = 10 * 1024 * 1024;

export function BeeldKiezer({
  url,
  alt,
  onWijzig,
  id = "beeld",
  toonAlt = true,
}: {
  url: string;
  alt: string;
  onWijzig: (waarde: { url: string; alt: string }) => void;
  /** Uniek per kiezer; er kunnen er meer op één scherm staan. */
  id?: string;
  /**
   * Uit wanneer de beschrijving ergens anders vandaan komt. Bij een docent in
   * een lijst is dat de naam ernaast: "Portret van Wietske" schrijft niemand
   * twee keer.
   */
  toonAlt?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function upload(bestand: File) {
    setFout(null);

    if (!bestand.type.startsWith("image/")) {
      setFout("Kies een afbeelding.");
      return;
    }
    if (bestand.size > MAX_BYTES) {
      setFout("Deze afbeelding is groter dan 10 MB.");
      return;
    }

    setBezig(true);

    const veiligeNaam = bestand.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-|-$/g, "");
    const pad = `site/${Date.now()}-${veiligeNaam}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("public-media")
      .upload(pad, bestand, { cacheControl: "31536000", upsert: false });

    if (error) {
      setBezig(false);
      setFout("De upload is mislukt. Probeer het opnieuw.");
      return;
    }

    const { data } = supabase.storage.from("public-media").getPublicUrl(pad);
    setBezig(false);
    onWijzig({ url: data.publicUrl, alt });
  }

  return (
    <div className="space-y-4">
      {url ? (
        // Bewust een gewone img: de bron is een willekeurige opslag-URL die
        // next/image niet vooraf kent, en dit is een beheerscherm.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt || "Voorbeeld van de gekozen afbeelding"}
          className="max-h-56 rounded-lg border border-line object-cover"
        />
      ) : (
        <div className="flex h-32 items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-cream text-sm text-muted">
          <ImageIcon className="size-5" aria-hidden />
          Nog geen afbeelding gekozen
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => {
          const bestand = event.target.files?.[0];
          if (bestand) void upload(bestand);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={bezig}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-hover disabled:opacity-60"
      >
        <Upload className="size-4" aria-hidden />
        {bezig
          ? "Bezig met uploaden…"
          : url
            ? "Andere afbeelding"
            : "Afbeelding kiezen"}
      </button>

      {fout ? <FormMessage variant="fout">{fout}</FormMessage> : null}

      {toonAlt ? (
        <div>
          <Label htmlFor={`${id}-alt`}>Beschrijving van de afbeelding</Label>
          <Input
            id={`${id}-alt`}
            value={alt}
            onChange={(event) => onWijzig({ url, alt: event.target.value })}
            placeholder="Bijvoorbeeld: docente begeleidt een deelnemer in een yin-houding"
            aria-invalid={url && !alt ? true : undefined}
          />
          <p className="mt-1.5 text-sm text-muted">
            Wat is er te zien? Dit lezen mensen die de afbeelding niet kunnen
            zien, en zoekmachines. Verplicht zodra er een afbeelding staat.
          </p>
        </div>
      ) : null}
    </div>
  );
}
