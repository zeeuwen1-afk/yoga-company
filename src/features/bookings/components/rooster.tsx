import Link from "next/link";

import { groepeerPerDag, formateerTijdvak } from "../datum";
import type { EigenBoeking, Les } from "../server/queries";
import { BOEKING_LABEL, isTeLaatOmTeAnnuleren } from "../server/queries";
import { BoekingKnoppen } from "./boeking-knoppen";

/**
 * Het weekrooster (bouwprompt §7.1 en §7.3).
 *
 * Kaarten in plaats van een tabel: op de telefoon is een rooster in een tabel
 * niet te lezen, en §9 vraagt daar expliciet om kaarten.
 */

function Beschikbaarheid({ les }: { les: Les }) {
  if (les.afgelastOp) {
    return <span className="text-error">Gaat niet door</span>;
  }
  if (les.vrijePlekken === 0) {
    return <span className="text-muted">Vol — wachtlijst mogelijk</span>;
  }
  if (les.vrijePlekken <= 3) {
    return (
      <span className="text-green">
        Nog {les.vrijePlekken} {les.vrijePlekken === 1 ? "plek" : "plekken"}
      </span>
    );
  }
  return <span className="text-muted">Plek beschikbaar</span>;
}

function LesKaart({
  les,
  boeking,
  ingelogd,
}: {
  les: Les;
  boeking?: EigenBoeking;
  ingelogd: boolean;
}) {
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="label-klein">
            {formateerTijdvak(les.begintOp, les.duurMinuten)}
          </p>
          <h3 className="mt-1 text-xl">{les.titel}</h3>
          <p className="mt-1 text-sm text-muted">{les.locatie}</p>
          {les.omschrijving ? (
            <p className="mt-3 max-w-prose text-sm">{les.omschrijving}</p>
          ) : null}
          {les.afgelastOp ? (
            <p className="mt-3 text-sm text-error">
              Deze les gaat niet door. Heb je geboekt, dan kun je je boeking
              hieronder weghalen.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <p className="text-sm font-semibold">
            <Beschikbaarheid les={les} />
          </p>

          {boeking ? (
            <p className="text-sm font-semibold text-green-dark">
              {BOEKING_LABEL[boeking.status]}
            </p>
          ) : null}

          {ingelogd ? (
            <BoekingKnoppen
              lesId={les.id}
              status={boeking?.status ?? null}
              afgelast={les.afgelastOp !== null}
              teLaatOmTeAnnuleren={isTeLaatOmTeAnnuleren(les)}
            />
          ) : (
            <Link
              href={`/inloggen?volgende=${encodeURIComponent("/portaal/lessen")}`}
              className="inline-flex h-11 items-center rounded-lg bg-green px-5 text-sm font-semibold text-cream transition-colors hover:bg-green-dark"
            >
              Boek een les
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

export function Rooster({
  lessen,
  boekingen,
  ingelogd = false,
}: {
  lessen: Les[];
  /** Alleen in het portaal gevuld; bepaalt of er "geboekt" bij staat. */
  boekingen?: Map<string, EigenBoeking>;
  ingelogd?: boolean;
}) {
  if (lessen.length === 0) {
    return (
      <p className="text-muted">
        Er staan op dit moment geen lessen in het rooster. Neem gerust contact
        met ons op — dan laten we weten wanneer we weer beginnen.
      </p>
    );
  }

  const dagen = groepeerPerDag(lessen);

  return (
    <div className="space-y-10">
      {dagen.map((dag) => (
        <section key={dag.sleutel}>
          <h2 className="text-lg font-semibold text-green-dark first-letter:uppercase">
            {dag.label}
          </h2>
          <ul className="mt-4 space-y-4">
            {dag.lessen.map((les) => (
              <LesKaart
                key={les.id}
                les={les}
                boeking={boekingen?.get(les.id)}
                ingelogd={ingelogd}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
