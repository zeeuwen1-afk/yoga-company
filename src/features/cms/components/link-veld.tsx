"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { BESTEMMINGEN } from "@/content/bestemmingen";
import { veiligeLink } from "@/lib/knoplink";

/**
 * Het veld waarin de bestemming van een knop wordt ingevuld.
 *
 * Een kaal tekstveld zou hier betekenen dat je uit je hoofd moet weten dat de
 * tarievenpagina op `/lessen/tarieven` staat en niet op `/tarieven`. Eén letter
 * mis en de knop leidt naar een 404, zonder dat er iets over klaagt.
 *
 * Daarom staan de bestaande pagina's eronder als knopjes. Aanklikken vult het
 * veld. Zelf typen mag ook, bijvoorbeeld voor de website van een yogaschool.
 *
 * Wat je invult wordt meteen beoordeeld, zodat je het hier ziet en niet pas
 * wanneer een bezoeker erop klikt.
 */
export function LinkVeld({
  id,
  waarde,
  terugval,
  onWijzig,
}: {
  id: string;
  waarde: string;
  /** Waar de knop heen gaat zolang dit veld leeg is. */
  terugval: string;
  onWijzig: (waarde: string) => void;
}) {
  const [openKlapper, setOpenKlapper] = useState(false);

  const ingevuld = waarde.trim();
  const werkelijk = veiligeLink(waarde, terugval);
  const geweigerd = ingevuld.length > 0 && werkelijk !== ingevuld;

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={waarde}
        onChange={(event) => onWijzig(event.target.value)}
        placeholder={terugval}
        aria-invalid={geweigerd || undefined}
        aria-describedby={`${id}-uitleg`}
      />

      <p id={`${id}-uitleg`} className="text-sm">
        {geweigerd ? (
          <span className="text-danger">
            Dit is geen adres dat we kunnen gebruiken. Begin met een schuine
            streep voor een pagina op deze site, met een hekje voor een sectie,
            of met https:// voor een andere website. Zolang dit niet klopt gaat
            de knop naar <span className="font-mono">{terugval}</span>.
          </span>
        ) : ingevuld ? (
          <span className="text-muted">
            De knop gaat naar <span className="font-mono">{werkelijk}</span>.
          </span>
        ) : (
          <span className="text-muted">
            Leeg betekent: naar <span className="font-mono">{terugval}</span>,
            zoals het nu is.
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={() => setOpenKlapper((open) => !open)}
        className="text-sm underline underline-offset-2 hover:no-underline"
        aria-expanded={openKlapper}
      >
        {openKlapper ? "Verberg de pagina's" : "Kies een pagina"}
      </button>

      {openKlapper ? (
        <div className="space-y-3 rounded-lg border border-line bg-cream p-3">
          {BESTEMMINGEN.map((groep) => (
            <div key={groep.groep}>
              <p className="text-sm tracking-[0.1em] text-muted uppercase">
                {groep.groep}
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {groep.items.map((bestemming) => {
                  const gekozen = ingevuld === bestemming.pad;
                  return (
                    <li key={bestemming.pad}>
                      <button
                        type="button"
                        onClick={() => onWijzig(bestemming.pad)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm transition-colors",
                          gekozen
                            ? "bg-accent-wash border-accent"
                            : "border-line hover:bg-hover",
                        ].join(" ")}
                      >
                        {gekozen ? (
                          <Check className="size-3.5" aria-hidden />
                        ) : null}
                        {bestemming.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <p className="flex items-start gap-1.5 border-t border-line pt-2 text-sm text-muted">
            <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Staat je bestemming er niet bij, typ hem dan zelf. Een andere
            website begint met https://
          </p>
        </div>
      ) : null}
    </div>
  );
}
