import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import {
  AanvraagPil,
  AdminKop,
  LegeLijst,
  Paneel,
  StatusPil,
  datumKort,
  datumTijd,
} from "@/features/admin/components/ui";
import { haalAuditLog, ACTIE_LABEL } from "@/features/audit";
import { formateerPrijs } from "@/features/courses";
import {
  AccountSchakelaars,
  AvgVerwijderen,
  GegevensBewerken,
  NotitieFormulier,
} from "@/features/crm/components/klant-acties";
import { AdminAntwoordFormulier } from "@/features/messages/components/admin-antwoord";
import {
  BOEKING_LABEL,
  formateerDag,
  formateerTijd,
} from "@/features/bookings";
import { haalKlantDossier, heeftTweestapsverificatie } from "@/features/crm";
import { SOORT_LABEL } from "@/features/requests";

export const metadata: Metadata = {
  title: "Klant",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dossier = await haalKlantDossier(id);
  if (!dossier) notFound();

  const {
    profiel,
    inschrijvingen,
    notities,
    aanvragen,
    gesprek,
    voortgang,
    boekingen,
  } = dossier;
  const [logboek, tweestaps] = await Promise.all([
    haalAuditLog({ entiteitId: id, limiet: 20 }),
    heeftTweestapsverificatie(id),
  ]);

  const naam = `${profiel.voornaam} ${profiel.achternaam}`;

  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/klanten", label: "Klanten" }}
        titel={naam}
        toelichting={`${profiel.email}${profiel.telefoon ? ` · ${profiel.telefoon}` : ""}`}
        actie={
          <a
            href={`/api/v1/admin/klant-export/${id}`}
            download
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-5 font-semibold text-green-dark transition-colors hover:bg-cream"
          >
            <Download className="size-4" aria-hidden />
            Exporteer gegevens
          </a>
        }
      />

      {!profiel.actief ? (
        <p className="mb-6 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          Dit account is gedeactiveerd op {datumKort(profiel.gedeactiveerdOp)}.
          De klant kan niet inloggen.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Inschrijvingen ------------------------------------------------- */}
          <Paneel titel="Inschrijvingen">
            {inschrijvingen.length === 0 ? (
              <LegeLijst>Nog geen inschrijvingen.</LegeLijst>
            ) : (
              <ul className="divide-y divide-line">
                {inschrijvingen.map((inschrijving) => (
                  <li key={inschrijving.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={`/admin/aanbod/${inschrijving.cursusSlug}`}
                        className="font-semibold hover:text-green"
                      >
                        {inschrijving.cursusTitel}
                      </Link>
                      <StatusPil status={inschrijving.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      Ingeschreven op {datumKort(inschrijving.aangemaaktOp)}
                      {inschrijving.betaaldOp
                        ? ` · betaald op ${datumKort(inschrijving.betaaldOp)}`
                        : null}
                      {inschrijving.bedragCenten
                        ? ` · ${formateerPrijs(inschrijving.bedragCenten)}`
                        : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Paneel>

          {/* Dialoog --------------------------------------------------------- */}
          <Paneel titel="Gesprek">
            <div className="p-5">
              {gesprek && gesprek.berichten.length > 0 ? (
                <ol className="mb-5 space-y-3">
                  {gesprek.berichten.map((bericht) => (
                    <li
                      key={bericht.id}
                      className={
                        bericht.vanKlant
                          ? "flex justify-start"
                          : "flex justify-end"
                      }
                    >
                      <div
                        className={
                          bericht.vanKlant
                            ? "max-w-[80%] rounded-[var(--radius-card)] border border-line px-4 py-2.5"
                            : "max-w-[80%] rounded-[var(--radius-card)] bg-green px-4 py-2.5 text-cream"
                        }
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {bericht.tekst}
                        </p>
                        <p
                          className={
                            bericht.vanKlant
                              ? "mt-1 text-xs text-muted"
                              : "mt-1 text-xs text-cream/70"
                          }
                        >
                          {bericht.vanKlant ? profiel.voornaam : "YogaCompany"}{" "}
                          · {datumTijd(bericht.verstuurdOp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mb-5 text-muted">Nog geen berichten.</p>
              )}

              {gesprek ? (
                <AdminAntwoordFormulier
                  conversationId={gesprek.id}
                  profileId={profiel.id}
                />
              ) : null}
            </div>
          </Paneel>

          {/* Boekingen -------------------------------------------------------- */}
          <Paneel titel="Lessen">
            {boekingen.length === 0 ? (
              <LegeLijst>Deze klant heeft nog geen les geboekt.</LegeLijst>
            ) : (
              <ul className="divide-y divide-line">
                {boekingen.map((boeking) => (
                  <li
                    key={boeking.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/lessen/${boeking.lesId}`}
                        className="font-semibold text-green-dark hover:underline"
                      >
                        {boeking.lesTitel}
                      </Link>
                      <p className="text-sm text-muted first-letter:uppercase">
                        {formateerDag(boeking.begintOp)} ·{" "}
                        {formateerTijd(boeking.begintOp)} · {boeking.locatie}
                      </p>
                    </div>
                    <span className="text-sm text-muted">
                      {BOEKING_LABEL[boeking.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Paneel>

          {/* Aanvragen -------------------------------------------------------- */}
          <Paneel titel="Aanvragen">
            {aanvragen.length === 0 ? (
              <LegeLijst>Geen aanvragen.</LegeLijst>
            ) : (
              <ul className="divide-y divide-line">
                {aanvragen.map((aanvraag) => (
                  <li key={aanvraag.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold">
                        {SOORT_LABEL[aanvraag.soort]}
                      </span>
                      <AanvraagPil status={aanvraag.status} />
                    </div>
                    {aanvraag.toelichting ? (
                      <p className="mt-1 text-sm whitespace-pre-wrap text-muted">
                        {aanvraag.toelichting}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted">
                      {datumKort(aanvraag.ingediendOp)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Paneel>

          {/* Notities --------------------------------------------------------- */}
          <Paneel titel="Interne notities">
            <div className="p-5">
              <NotitieFormulier profileId={profiel.id} />

              {notities.length > 0 ? (
                <ul className="mt-5 divide-y divide-line">
                  {notities.map((notitie) => (
                    <li key={notitie.id} className="py-3 first:pt-0">
                      <p className="text-sm whitespace-pre-wrap">
                        {notitie.tekst}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {notitie.auteur ?? "Onbekend"} ·{" "}
                        {datumTijd(notitie.geschrevenOp)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Paneel>
        </div>

        {/* Zijkolom ------------------------------------------------------------ */}
        <div className="space-y-6">
          <Paneel titel="Gegevens">
            <div className="p-5">
              <GegevensBewerken
                profileId={profiel.id}
                voornaam={profiel.voornaam}
                achternaam={profiel.achternaam}
                telefoon={profiel.telefoon}
              />
            </div>
          </Paneel>

          <Paneel titel="Overzicht">
            <dl className="divide-y divide-line text-sm">
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">Klant sinds</dt>
                <dd>{datumKort(profiel.aangemaaktOp)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">Rol</dt>
                <dd>{profiel.rol === "admin" ? "Beheerder" : "Klant"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">Mailings</dt>
                <dd>
                  {profiel.toestemmingOp
                    ? `Toestemming ${datumKort(profiel.toestemmingOp)}`
                    : "Geen toestemming"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">Voortgang</dt>
                <dd>
                  {voortgang.aantalItems === 0
                    ? "Nog niet begonnen"
                    : `${voortgang.aantalAfgerond} van ${voortgang.aantalItems} afgerond`}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-muted">Laatst actief</dt>
                <dd>{datumKort(voortgang.laatstActiefOp)}</dd>
              </div>
            </dl>
          </Paneel>

          <Paneel titel="Account">
            <div className="p-5">
              <AccountSchakelaars
                profileId={profiel.id}
                isActief={profiel.actief}
                isAdmin={profiel.rol === "admin"}
                heeftTweestaps={tweestaps}
              />
            </div>
          </Paneel>

          <Paneel titel="Gegevens verwijderen" className="border-error/30">
            <div className="p-5">
              <AvgVerwijderen profileId={profiel.id} naam={naam} />
            </div>
          </Paneel>

          <Paneel titel="Logboek">
            {logboek.length === 0 ? (
              <LegeLijst>Nog niets vastgelegd.</LegeLijst>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {logboek.map((regel) => (
                  <li key={regel.id} className="px-5 py-3">
                    <p>{ACTIE_LABEL[regel.actie] ?? regel.actie}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {regel.actorNaam ?? "Systeem"} ·{" "}
                      {datumTijd(regel.tijdstip)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Paneel>
        </div>
      </div>
    </>
  );
}
