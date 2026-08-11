"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  FieldError,
  FormMessage,
  Honeypot,
} from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  verstuurContactbericht,
  type ContactResultaat,
} from "../server/contact";

const BEGIN: ContactResultaat = { status: "idle" };

export function ContactFormulier() {
  const [resultaat, actie] = useActionState(verstuurContactbericht, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="space-y-5" noValidate>
      <Honeypot />

      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="name">Naam</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={velden?.name ? true : undefined}
        />
        <FieldError>{velden?.name}</FieldError>
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
        <Label htmlFor="phone">
          Telefoonnummer{" "}
          <span className="font-normal text-muted">(niet verplicht)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={velden?.phone ? true : undefined}
        />
        <FieldError>{velden?.phone}</FieldError>
      </div>

      <div>
        <Label htmlFor="body">Je bericht</Label>
        <Textarea
          id="body"
          name="body"
          rows={6}
          required
          placeholder="Waar kunnen we je mee helpen?"
          aria-invalid={velden?.body ? true : undefined}
        />
        <FieldError>{velden?.body}</FieldError>
      </div>

      <SubmitButton bezigLabel="Versturen…">Verstuur bericht</SubmitButton>

      <p className="text-xs text-muted">
        We gebruiken je gegevens uitsluitend om je vraag te beantwoorden. Lees
        hoe we daarmee omgaan in onze{" "}
        <Link href="/privacyverklaring" className="underline">
          privacyverklaring
        </Link>
        .
      </p>
    </form>
  );
}
