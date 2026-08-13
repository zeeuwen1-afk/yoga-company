import Link from "next/link";

import { uitloggen } from "@/features/auth";

/** Vaste balk boven het portaal, op alle schermformaten hetzelfde. */
export function PortaalTopbalk({
  voornaam,
  isAdmin,
}: {
  voornaam: string | null;
  isAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/portaal"
          className="font-serif text-xl leading-none font-semibold text-green-dark"
        >
          YogaCompany
        </Link>

        <div className="flex items-center gap-4">
          {voornaam ? (
            <span className="hidden text-sm text-muted sm:inline">
              {voornaam}
            </span>
          ) : null}

          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-semibold text-green-dark transition-colors hover:bg-sand-light"
            >
              Beheer
            </Link>
          ) : null}

          <form action={uitloggen}>
            <button
              type="submit"
              className="inline-flex h-11 items-center text-sm text-muted underline hover:text-green"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
