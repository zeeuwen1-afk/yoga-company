"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { BestandUpload } from "./bestand-upload";
import {
  verwijderItem,
  voegItemToe,
  voegModuleToe,
  type ContentResultaat,
} from "../server/admin-acties";

const BEGIN: ContentResultaat = { status: "idle" };

export function ModuleToevoegen({
  cursusId,
  slug,
  volgendeSort,
}: {
  cursusId: string;
  slug: string;
  volgendeSort: number;
}) {
  const [resultaat, actie] = useActionState(voegModuleToe, BEGIN);

  return (
    <form action={actie} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="course_id" value={cursusId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="sort" value={volgendeSort} />

      <div className="min-w-56 flex-1">
        <Label htmlFor="module-titel">Naam van de module</Label>
        <Input
          id="module-titel"
          name="title"
          placeholder="Bijvoorbeeld: Week 1"
          required
        />
      </div>

      <SubmitButton bezigLabel="Toevoegen…">Module toevoegen</SubmitButton>

      {resultaat.status === "fout" ? (
        <div className="w-full">
          <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
        </div>
      ) : null}
    </form>
  );
}

export function ItemToevoegen({
  lessonId,
  slug,
  cursusSlug,
  volgendeSort,
}: {
  lessonId: string;
  slug: string;
  cursusSlug: string;
  volgendeSort: number;
}) {
  const [resultaat, actie] = useActionState(voegItemToe, BEGIN);
  const [soort, setSoort] = useState<"video" | "pdf" | "tekst">("video");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Lesonderdeel toevoegen
      </Button>
    );
  }

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="sort" value={volgendeSort} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`soort-${lessonId}`}>Soort</Label>
          <select
            id={`soort-${lessonId}`}
            name="kind"
            value={soort}
            onChange={(event) =>
              setSoort(event.target.value as "video" | "pdf" | "tekst")
            }
            className="h-11 w-full rounded-lg border border-line bg-white px-3"
          >
            <option value="video">Video</option>
            <option value="pdf">Document (pdf)</option>
            <option value="tekst">Tekst</option>
          </select>
        </div>
        <div>
          <Label htmlFor={`titel-${lessonId}`}>Titel</Label>
          <Input id={`titel-${lessonId}`} name="title" required />
        </div>
      </div>

      {soort === "tekst" ? (
        <div>
          <Label htmlFor={`body-${lessonId}`}>Tekst</Label>
          <Textarea id={`body-${lessonId}`} name="body" rows={6} required />
        </div>
      ) : (
        <>
          <BestandUpload cursusSlug={cursusSlug} veldNaam="storage_path" />
          {soort === "video" ? (
            <div>
              <Label htmlFor={`duur-${lessonId}`}>
                Duur in seconden{" "}
                <span className="font-normal text-muted">(niet verplicht)</span>
              </Label>
              <Input
                id={`duur-${lessonId}`}
                name="duration_seconds"
                type="number"
                min={0}
              />
            </div>
          ) : null}
        </>
      )}

      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="is_preview"
          className="mt-1 size-4 shrink-0 accent-green"
        />
        <span>
          <span className="block font-semibold">Proefles</span>
          <span className="block text-sm text-muted">
            Zichtbaar voor iedereen, ook zonder betaling.
          </span>
        </span>
      </label>

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex gap-3">
        <SubmitButton size="sm" bezigLabel="Opslaan…">
          Toevoegen
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Annuleren
        </Button>
      </div>
    </form>
  );
}

export function ItemVerwijderen({
  itemId,
  slug,
  titel,
}: {
  itemId: string;
  slug: string;
  titel: string;
}) {
  const [bevestig, setBevestig] = useState(false);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  if (!bevestig) {
    return (
      <button
        type="button"
        onClick={() => setBevestig(true)}
        aria-label={`${titel} verwijderen`}
        className="inline-flex size-11 items-center justify-center text-muted transition-colors hover:text-error"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={bezig}
        onClick={() =>
          startOvergang(async () => {
            await verwijderItem(itemId, slug);
            router.refresh();
          })
        }
        className="inline-flex h-11 items-center text-sm font-semibold text-error"
      >
        Verwijderen
      </button>
      <button
        type="button"
        onClick={() => setBevestig(false)}
        className="inline-flex h-11 items-center text-sm text-muted"
      >
        Annuleren
      </button>
    </span>
  );
}
