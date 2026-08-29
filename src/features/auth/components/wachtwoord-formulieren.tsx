"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  FieldError,
  FormMessage,
  Honeypot,
} from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { MINIMALE_WACHTWOORDLENGTE } from "../schemas";
import {
  wachtwoordHerstellen,
  wachtwoordVergeten,
  type ActieResultaat,
} from "../server/actions";
import { PasswordStrength } from "./password-strength";

const BEGIN: ActieResultaat = { status: "idle" };

export function WachtwoordVergetenFormulier() {
  const [resultaat, actie] = useActionState(wachtwoordVergeten, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="mt-6 space-y-5" noValidate>
      <Honeypot />

      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={velden?.email ? true : undefined}
        />
        <FieldError>{velden?.email}</FieldError>
      </div>

      <SubmitButton className="w-full" bezigLabel="Versturen…">
        Stuur me een herstellink
      </SubmitButton>
    </form>
  );
}

export function WachtwoordHerstellenFormulier() {
  const [resultaat, actie] = useActionState(wachtwoordHerstellen, BEGIN);
  const [wachtwoord, setWachtwoord] = useState("");
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  if (resultaat.status === "gelukt") {
    return (
      <div className="mt-6 space-y-4">
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
        <Link
          href="/portaal"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
        >
          Naar mijn omgeving
        </Link>
      </div>
    );
  }

  return (
    <form action={actie} className="mt-6 space-y-5" noValidate>
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
          minLength={MINIMALE_WACHTWOORDLENGTE}
          required
          value={wachtwoord}
          onChange={(event) => setWachtwoord(event.target.value)}
          aria-invalid={velden?.password ? true : undefined}
        />
        <PasswordStrength value={wachtwoord} />
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

      <SubmitButton className="w-full" bezigLabel="Opslaan…">
        Wachtwoord opslaan
      </SubmitButton>
    </form>
  );
}
