"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";
import { createClient } from "@/lib/supabase/client";
import { meldUploadAan } from "../server/admin-acties";

/**
 * Upload van een video of document (BOUWPROMPT §12).
 *
 * Het bestand gaat rechtstreeks van de browser naar Supabase Storage. Dat
 * scheelt een omweg langs onze server — die zou bij een video van twee gigabyte
 * het geheugen vullen — en de voortgang blijft zichtbaar.
 *
 * Schrijven in `protected-content` mag alleen een beheerder; dat dwingt het
 * storage-beleid af, niet deze component.
 */

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB, zoals §12 voorschrijft

export function BestandUpload({
  cursusSlug,
  veldNaam,
  onKlaar,
}: {
  cursusSlug: string;
  veldNaam: string;
  onKlaar?: (pad: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pad, setPad] = useState("");
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function upload(bestand: File) {
    setFout(null);

    if (bestand.size > MAX_BYTES) {
      setFout("Dit bestand is groter dan 2 GB.");
      return;
    }

    // Een vaste naam per opleiding met een tijdstempel: leesbaar in de opslag
    // en nooit botsend met een eerdere upload.
    const veiligeNaam = bestand.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-|-$/g, "");
    const doelPad = `${cursusSlug}/${Date.now()}-${veiligeNaam}`;

    setVoortgang(0);

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("protected-content")
      .upload(doelPad, bestand, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setVoortgang(null);
      setFout(
        "De upload is mislukt. Controleer je verbinding en probeer het opnieuw.",
      );
      return;
    }

    setVoortgang(100);
    setPad(doelPad);
    onKlaar?.(doelPad);
    await meldUploadAan(doelPad, bestand.size);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={veldNaam} value={pad} />

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,application/pdf"
        className="sr-only"
        onChange={(event) => {
          const bestand = event.target.files?.[0];
          if (bestand) void upload(bestand);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={voortgang !== null && voortgang < 100}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-hover disabled:opacity-60"
      >
        <Upload className="size-4" aria-hidden />
        {pad ? "Ander bestand kiezen" : "Bestand kiezen"}
      </button>

      {voortgang !== null && voortgang < 100 ? (
        <p className="text-sm text-muted" aria-live="polite">
          Bezig met uploaden… Laat dit tabblad open staan.
        </p>
      ) : null}

      {pad ? (
        <p className="text-sm text-success" aria-live="polite">
          Geüpload: <span className="font-mono">{pad}</span>
        </p>
      ) : null}

      {fout ? <FormMessage variant="fout">{fout}</FormMessage> : null}

      <p className="text-sm text-muted">
        MP4, MOV of PDF, tot 2 GB. Het bestand komt in de beveiligde opslag en
        is alleen bereikbaar voor klanten die ervoor betaald hebben.
      </p>
    </div>
  );
}
