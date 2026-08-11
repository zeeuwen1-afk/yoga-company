"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { bewaarCursus, type AanbodResultaat } from "../server/admin-acties";
import type { Cursus } from "../server/queries";

const BEGIN: AanbodResultaat = { status: "idle" };

export function CursusFormulier({
  cursus,
  cursusId,
  isActief,
}: {
  cursus?: Cursus;
  cursusId?: string | null;
  isActief?: boolean;
}) {
  const [resultaat, actie] = useActionState(bewaarCursus, BEGIN);

  return (
    <form action={actie} className="space-y-5" noValidate>
      {cursusId ? <input type="hidden" name="id" value={cursusId} /> : null}

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-type">Soort</Label>
          <select
            id="c-type"
            name="type"
            defaultValue={cursus?.type ?? "opleiding"}
            className="h-11 w-full rounded-lg border border-line bg-white px-3"
          >
            <option value="opleiding">Opleiding</option>
            <option value="training">Training</option>
          </select>
        </div>
        <div>
          <Label htmlFor="c-prijs">Prijs in euro&apos;s</Label>
          <Input
            id="c-prijs"
            name="price_euro"
            type="number"
            step="0.01"
            min={0}
            defaultValue={cursus ? cursus.prijsCenten / 100 : ""}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="c-titel">Titel</Label>
        <Input
          id="c-titel"
          name="title"
          defaultValue={cursus?.titel}
          required
        />
      </div>

      <div>
        <Label htmlFor="c-slug">Webadres</Label>
        <Input
          id="c-slug"
          name="slug"
          defaultValue={cursus?.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
        <p className="mt-1.5 text-sm text-muted">
          Kleine letters, cijfers en streepjes. Wijzig dit niet meer zodra de
          pagina online staat: bestaande links werken dan niet meer.
        </p>
      </div>

      <div>
        <Label htmlFor="c-samenvatting">Samenvatting</Label>
        <Textarea
          id="c-samenvatting"
          name="summary"
          rows={2}
          defaultValue={cursus?.samenvatting}
          required
        />
        <p className="mt-1.5 text-sm text-muted">
          De tekst op de kaart in het overzicht.
        </p>
      </div>

      <div>
        <Label htmlFor="c-beschrijving">Beschrijving</Label>
        <Textarea
          id="c-beschrijving"
          name="description"
          rows={8}
          defaultValue={cursus?.beschrijving}
          required
        />
        <p className="mt-1.5 text-sm text-muted">
          Laat een lege regel tussen alinea&apos;s.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-voorwie">Voor wie</Label>
          <Textarea
            id="c-voorwie"
            name="audience"
            rows={3}
            defaultValue={cursus?.voorWie ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="c-eisen">Toelatingseisen</Label>
          <Textarea
            id="c-eisen"
            name="requirements"
            rows={3}
            defaultValue={cursus?.toelatingseisen ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-studiebelasting">Studiebelasting</Label>
          <Input
            id="c-studiebelasting"
            name="study_load_text"
            defaultValue={cursus?.studiebelasting ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="c-locatie">Locatie</Label>
          <Input
            id="c-locatie"
            name="location"
            defaultValue={cursus?.locatie ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-max">Maximaal aantal deelnemers</Label>
          <Input
            id="c-max"
            name="max_participants"
            type="number"
            min={1}
            defaultValue={cursus?.maxDeelnemers ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="c-sort">Volgorde</Label>
          <Input
            id="c-sort"
            name="sort"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="c-certificaat">Certificering</Label>
        <Textarea
          id="c-certificaat"
          name="certificate_text"
          rows={2}
          defaultValue={cursus?.certificaat ?? ""}
        />
      </div>

      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={isActief ?? true}
          className="mt-1 size-4 shrink-0 accent-green"
        />
        <span>
          <span className="block font-semibold">Zichtbaar op de website</span>
          <span className="block text-sm text-muted">
            Uitzetten haalt het aanbod van de site. Bestaande inschrijvingen en
            lesmateriaal blijven gewoon werken.
          </span>
        </span>
      </label>

      <SubmitButton bezigLabel="Opslaan…">Opslaan</SubmitButton>
    </form>
  );
}
