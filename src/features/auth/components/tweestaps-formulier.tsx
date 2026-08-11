"use client";

import { useActionState, useEffect, useState } from "react";

import { FieldError, FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  totpAanmelden,
  totpVerifieren,
  type ActieResultaat,
} from "../server/actions";

const BEGIN: ActieResultaat = { status: "idle" };

type Koppeling = { factorId: string; qrCode: string; secret: string };

/**
 * Twee situaties in één scherm:
 *   - er is al een authenticator gekoppeld → alleen om de code vragen
 *   - er is er nog geen → eerst koppelen met een QR-code, dan verifiëren
 */
export function TweestapsFormulier({
  bestaandeFactorId,
  vervolg,
}: {
  bestaandeFactorId?: string;
  vervolg?: string;
}) {
  const [resultaat, actie] = useActionState(totpVerifieren, BEGIN);
  const [koppeling, setKoppeling] = useState<Koppeling | null>(null);
  const [koppelFout, setKoppelFout] = useState<string | null>(null);
  const [geheimZichtbaar, setGeheimZichtbaar] = useState(false);

  useEffect(() => {
    if (bestaandeFactorId) return;

    let geannuleerd = false;
    void totpAanmelden().then((uitkomst) => {
      if (geannuleerd) return;
      if (uitkomst.status === "gelukt") {
        setKoppeling({
          factorId: uitkomst.factorId,
          qrCode: uitkomst.qrCode,
          secret: uitkomst.secret,
        });
      } else {
        setKoppelFout(uitkomst.bericht);
      }
    });

    return () => {
      geannuleerd = true;
    };
  }, [bestaandeFactorId]);

  const factorId = bestaandeFactorId ?? koppeling?.factorId;
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  if (koppelFout) {
    return <FormMessage variant="fout">{koppelFout}</FormMessage>;
  }

  if (!factorId) {
    return (
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        Bezig met voorbereiden…
      </p>
    );
  }

  return (
    <div className="mt-6">
      {koppeling ? (
        <div className="mb-6 rounded-[var(--radius-card)] border border-line p-5">
          <p className="text-sm">
            Scan deze QR-code met je authenticator-app, bijvoorbeeld Google
            Authenticator, Microsoft Authenticator of 1Password.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- data-URI van Supabase, geen optimalisatie mogelijk */}
          <img
            src={koppeling.qrCode}
            alt="QR-code om je authenticator-app te koppelen"
            className="mx-auto my-4 size-44 rounded-lg border border-line bg-white"
          />
          <button
            type="button"
            onClick={() => setGeheimZichtbaar((zichtbaar) => !zichtbaar)}
            className="text-sm text-muted underline hover:text-green"
          >
            {geheimZichtbaar
              ? "Verberg de code"
              : "Kun je niet scannen? Toon de code"}
          </button>
          {geheimZichtbaar ? (
            <p className="mt-3 rounded-lg bg-sand-light px-3 py-2 font-mono text-sm break-all">
              {koppeling.secret}
            </p>
          ) : null}
        </div>
      ) : null}

      <form action={actie} className="space-y-5" noValidate>
        <input type="hidden" name="factor_id" value={factorId} />
        {vervolg ? (
          <input type="hidden" name="vervolg" value={vervolg} />
        ) : null}

        {resultaat.status === "fout" && !velden ? (
          <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
        ) : null}

        <div>
          <Label htmlFor="code">Zescijferige code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            required
            autoFocus
            className="text-center font-mono text-xl tracking-[0.4em]"
            aria-invalid={velden?.code ? true : undefined}
          />
          <FieldError>{velden?.code}</FieldError>
        </div>

        <SubmitButton className="w-full" bezigLabel="Controleren…">
          Bevestigen
        </SubmitButton>
      </form>
    </div>
  );
}
