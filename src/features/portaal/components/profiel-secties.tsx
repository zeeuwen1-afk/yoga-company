"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FieldError, FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { totpUitschakelen } from "@/features/auth";
import {
  werkProfielBij,
  wijzigWachtwoord,
  wisselMarketingToestemming,
  type ProfielResultaat,
} from "../server/profiel";

const BEGIN: ProfielResultaat = { status: "idle" };

export function GegevensFormulier({
  voornaam,
  achternaam,
  email,
  telefoon,
}: {
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string | null;
}) {
  const [resultaat, actie] = useActionState(werkProfielBij, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  return (
    <form action={actie} className="space-y-5" noValidate>
      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_name">Voornaam</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={voornaam}
            autoComplete="given-name"
            required
            aria-invalid={velden?.first_name ? true : undefined}
          />
          <FieldError>{velden?.first_name}</FieldError>
        </div>
        <div>
          <Label htmlFor="last_name">Achternaam</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={achternaam}
            autoComplete="family-name"
            required
            aria-invalid={velden?.last_name ? true : undefined}
          />
          <FieldError>{velden?.last_name}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="phone">
          Telefoonnummer{" "}
          <span className="font-normal text-muted">(niet verplicht)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={telefoon ?? ""}
          autoComplete="tel"
          aria-invalid={velden?.phone ? true : undefined}
        />
        <FieldError>{velden?.phone}</FieldError>
      </div>

      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" value={email} disabled readOnly />
        <p className="mt-1.5 text-sm text-muted">
          Je e-mailadres wijzigen doen we voor je. Vraag het aan via{" "}
          <Link href="/portaal/aanvragen?soort=wijziging" className="underline">
            aanvragen
          </Link>
          .
        </p>
      </div>

      <SubmitButton bezigLabel="Opslaan…">Gegevens opslaan</SubmitButton>
    </form>
  );
}

export function WachtwoordFormulier() {
  const [resultaat, actie] = useActionState(wijzigWachtwoord, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  return (
    <form action={actie} className="space-y-5" noValidate>
      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          aria-invalid={velden?.password ? true : undefined}
        />
        <FieldError>{velden?.password}</FieldError>
      </div>

      <div>
        <Label htmlFor="password_confirm">Herhaal het wachtwoord</Label>
        <Input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={velden?.password_confirm ? true : undefined}
        />
        <FieldError>{velden?.password_confirm}</FieldError>
      </div>

      <SubmitButton bezigLabel="Opslaan…">Wachtwoord wijzigen</SubmitButton>
    </form>
  );
}

export function TweestapsSchakelaar({
  isIngeschakeld,
  factorId,
}: {
  isIngeschakeld: boolean;
  factorId: string | null;
}) {
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  if (!isIngeschakeld) {
    return (
      <div>
        <p className="text-sm text-muted">
          Met tweestapsverificatie vraagt YogaCompany naast je wachtwoord om een
          code uit een app op je telefoon. Zelfs als iemand je wachtwoord kent,
          komt hij er dan niet in.
        </p>
        <Link
          href="/tweestapsverificatie?vervolg=/portaal/profiel"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-green px-5 font-semibold text-cream transition-colors hover:bg-green-dark"
        >
          Tweestapsverificatie aanzetten
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-success">
        Tweestapsverificatie staat aan.
      </p>
      <p className="mt-1 text-sm text-muted">
        Bij het inloggen vragen we naast je wachtwoord om een code uit je app.
      </p>

      {fout ? (
        <div className="mt-4">
          <FormMessage variant="fout">{fout}</FormMessage>
        </div>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        disabled={bezig || !factorId}
        className="mt-4"
        onClick={() => {
          if (!factorId) return;
          setFout(null);
          startOvergang(async () => {
            const uitkomst = await totpUitschakelen(factorId);
            if (uitkomst.status === "fout") {
              setFout(uitkomst.bericht);
              return;
            }
            router.refresh();
          });
        }}
      >
        Uitzetten
      </Button>
    </div>
  );
}

export function ToestemmingSchakelaar({
  gegevenOp,
}: {
  gegevenOp: string | null;
}) {
  const [aan, setAan] = useState(Boolean(gegevenOp));
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={aan}
          disabled={bezig}
          onChange={(event) => {
            const nieuw = event.target.checked;
            setAan(nieuw);
            startOvergang(async () => {
              const uitkomst = await wisselMarketingToestemming(nieuw);
              if (!uitkomst.gelukt) {
                setAan(!nieuw);
                return;
              }
              router.refresh();
            });
          }}
          className="mt-1 size-4 shrink-0 accent-green"
        />
        <span>
          <span className="block font-semibold">
            Houd me op de hoogte van nieuwe opleidingen
          </span>
          <span className="block text-sm text-muted">
            Een paar keer per jaar, nooit vaker. Je kunt dit altijd weer
            uitzetten, en elke mail bevat een afmeldlink.
          </span>
        </span>
      </label>

      {gegevenOp ? (
        <p className="mt-2 text-xs text-muted">
          Toestemming gegeven op{" "}
          {new Date(gegevenOp).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      ) : null}
    </div>
  );
}
