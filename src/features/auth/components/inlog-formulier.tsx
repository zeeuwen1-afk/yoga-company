"use client";

import { useActionState } from "react";
import Link from "next/link";

import { FieldError, FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { inloggen, type ActieResultaat } from "../server/actions";

const BEGIN: ActieResultaat = { status: "idle" };

export function InlogFormulier({ vervolg }: { vervolg?: string }) {
  const [resultaat, actie] = useActionState(inloggen, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  return (
    <form action={actie} className="mt-6 space-y-5" noValidate>
      {vervolg ? <input type="hidden" name="vervolg" value={vervolg} /> : null}

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

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <Label htmlFor="password" className="mb-0">
            Wachtwoord
          </Label>
          <Link
            href="/wachtwoord-vergeten"
            className="text-sm text-muted hover:text-green"
          >
            Vergeten?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={velden?.password ? true : undefined}
        />
        <FieldError>{velden?.password}</FieldError>
      </div>

      <SubmitButton className="w-full" bezigLabel="Bezig met inloggen…">
        Inloggen
      </SubmitButton>
    </form>
  );
}
