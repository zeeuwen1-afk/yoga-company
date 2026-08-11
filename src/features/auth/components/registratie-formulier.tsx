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
import { registreren, type ActieResultaat } from "../server/actions";
import { PasswordStrength } from "./password-strength";

const BEGIN: ActieResultaat = { status: "idle" };

export function RegistratieFormulier() {
  const [resultaat, actie] = useActionState(registreren, BEGIN);
  const [wachtwoord, setWachtwoord] = useState("");
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_name">Voornaam</Label>
          <Input
            id="first_name"
            name="first_name"
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
            autoComplete="family-name"
            required
            aria-invalid={velden?.last_name ? true : undefined}
          />
          <FieldError>{velden?.last_name}</FieldError>
        </div>
      </div>

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

      <div>
        <Label htmlFor="password">Wachtwoord</Label>
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
          aria-describedby="wachtwoord-uitleg"
        />
        <PasswordStrength value={wachtwoord} />
        <p id="wachtwoord-uitleg" className="mt-1.5 text-sm text-muted">
          Minstens {MINIMALE_WACHTWOORDLENGTE} tekens. Een zin die je makkelijk
          onthoudt werkt beter dan losse tekens.
        </p>
        <FieldError>{velden?.password}</FieldError>
      </div>

      <SubmitButton className="w-full" bezigLabel="Account aanmaken…">
        Account aanmaken
      </SubmitButton>

      <p className="text-xs text-muted">
        Door een account aan te maken ga je akkoord met onze{" "}
        <Link href="/algemene-voorwaarden" className="underline">
          algemene voorwaarden
        </Link>{" "}
        en{" "}
        <Link href="/privacyverklaring" className="underline">
          privacyverklaring
        </Link>
        .
      </p>
    </form>
  );
}
