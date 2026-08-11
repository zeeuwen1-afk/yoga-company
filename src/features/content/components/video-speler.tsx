"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { slaPositieOp } from "@/features/progress/acties";

/**
 * Videospeler die onthoudt waar je gebleven bent (BOUWPROMPT §11).
 *
 * Drie dingen die aandacht vroegen:
 *
 *  - **De bron is tijdelijk.** De signed URL verloopt na een uur, dus wordt hij
 *    hier opgehaald in plaats van in de HTML gezet. Een gedeelde pagina-URL
 *    geeft daardoor nooit toegang tot het bestand.
 *  - **Opslaan gebeurt elke tien seconden**, niet bij elke tijdsprong. Vaak
 *    genoeg om nooit meer dan tien seconden kwijt te raken.
 *  - **Bij het verlaten van de pagina** wordt de stand nog één keer bewaard,
 *    zodat afsluiten midden in een les niet betekent dat je opnieuw moet
 *    zoeken.
 */
export function VideoSpeler({
  itemId,
  startSeconden,
  titel,
}: {
  itemId: string;
  startSeconden: number;
  titel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const laatstOpgeslagen = useRef(startSeconden);
  const [bron, setBron] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  // De tijdelijke link ophalen zodra de speler in beeld komt.
  useEffect(() => {
    let geannuleerd = false;

    void (async () => {
      try {
        const antwoord = await fetch(`/api/v1/content/${itemId}`);
        if (!antwoord.ok) throw new Error(String(antwoord.status));

        const { data } = await antwoord.json();
        if (!geannuleerd) setBron(data.url);
      } catch {
        if (!geannuleerd) {
          setFout(
            "De video kon niet worden geladen. Ververs de pagina, of laat het ons weten als het blijft misgaan.",
          );
        }
      }
    })();

    return () => {
      geannuleerd = true;
    };
  }, [itemId]);

  const bewaar = useCallback(
    (seconden: number) => {
      if (seconden < 1) return;
      laatstOpgeslagen.current = seconden;
      void slaPositieOp({
        contentItemId: itemId,
        positieSeconden: Math.floor(seconden),
      });
    },
    [itemId],
  );

  // Bij het sluiten of wegnavigeren nog één keer bewaren.
  useEffect(() => {
    const opslaanBijVertrek = () => {
      const huidige = videoRef.current?.currentTime ?? 0;
      if (Math.abs(huidige - laatstOpgeslagen.current) >= 1) bewaar(huidige);
    };

    window.addEventListener("pagehide", opslaanBijVertrek);
    return () => {
      window.removeEventListener("pagehide", opslaanBijVertrek);
      opslaanBijVertrek();
    };
  }, [bewaar]);

  if (fout) return <FormMessage variant="fout">{fout}</FormMessage>;

  if (!bron) {
    return (
      <div
        className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] border border-line bg-sand-light"
        aria-live="polite"
      >
        <span className="text-sm text-muted">Video wordt geladen…</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={bron}
      controls
      controlsList="nodownload"
      playsInline
      preload="metadata"
      aria-label={titel}
      className="w-full rounded-[var(--radius-card)] border border-line bg-black"
      onLoadedMetadata={(event) => {
        // Hervatten waar je stopte, maar niet in de laatste tien seconden:
        // dan begin je liever opnieuw dan bij de aftiteling.
        const video = event.currentTarget;
        if (startSeconden > 0 && startSeconden < video.duration - 10) {
          video.currentTime = startSeconden;
        }
      }}
      onTimeUpdate={(event) => {
        const huidige = event.currentTarget.currentTime;
        if (huidige - laatstOpgeslagen.current >= 10) bewaar(huidige);
      }}
      onPause={(event) => bewaar(event.currentTarget.currentTime)}
    />
  );
}
