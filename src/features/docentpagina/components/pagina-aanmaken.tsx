"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { maakPagina, type PaginaResultaat } from "../server/acties";

const BEGIN: PaginaResultaat = { status: "idle" };

/**
 * Het webadres kiezen, één keer.
 *
 * Het staat straks op visitekaartjes en in Instagram-bio's. Daarom laten we
 * het adres meteen zien terwijl je typt, en waarschuwen we dat het blijft
 * staan — een adres dat later verandert breekt links bij andermans volgers.
 */
export function PaginaAanmaken() {
  const [resultaat, actie] = useActionState(maakPagina, BEGIN);
  const [slug, setSlug] = useState("");

  const opgeschoond = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form action={actie} className="space-y-4">
      <div>
        <Label htmlFor="slug">Je webadres</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="trisha"
          autoComplete="off"
          required
        />
        <p className="mt-2 text-sm text-muted">
          Je pagina komt te staan op{" "}
          <span className="text-ink">
            yogacompany.eu/docent/{opgeschoond || "…"}
          </span>
        </p>
      </div>

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton bezigLabel="Aanmaken…">Pagina aanmaken</SubmitButton>

      <p className="text-sm text-muted">
        Je pagina begint met een paar blokken erin, zodat je niet naar een leeg
        scherm kijkt. Hij gaat pas online als je zelf publiceert.
      </p>
    </form>
  );
}
