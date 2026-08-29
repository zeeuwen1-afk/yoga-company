import { Alinea, Gegevens, Knop, Kop, Mail, Scheiding } from "./bouwstenen";

/**
 * De e-mails uit BOUWPROMPT §10. Nederlands, kort en warm, met per mail één
 * duidelijke handeling.
 *
 * Nummers 1 en 2 (accountverificatie en wachtwoordherstel) verstuurt Supabase
 * Auth zelf, via Resend als SMTP-server. Die sjablonen staan in het
 * Supabase-dashboard; zie docs/beheer.md.
 */

/** 3 + 4. Bevestiging na een geslaagde betaling. */
export function InschrijfbevestigingMail({
  voornaam,
  cursusTitel,
  bedrag,
  locatie,
  studiebelasting,
  portaalUrl,
}: {
  voornaam: string;
  cursusTitel: string;
  bedrag: string;
  locatie: string | null;
  studiebelasting: string | null;
  portaalUrl: string;
}) {
  const rijen = [
    { label: "Opleiding", waarde: cursusTitel },
    { label: "Betaald", waarde: bedrag },
    ...(locatie ? [{ label: "Locatie", waarde: locatie }] : []),
    ...(studiebelasting
      ? [{ label: "Studiebelasting", waarde: studiebelasting }]
      : []),
  ];

  return (
    <Mail voorvertoning={`Je inschrijving voor ${cursusTitel} is bevestigd`}>
      <Kop>Je inschrijving is bevestigd</Kop>
      <Alinea>Hallo {voornaam},</Alinea>
      <Alinea>
        Fijn dat je erbij bent. Je betaling is ontvangen en je plek staat vast.
      </Alinea>

      <Gegevens rijen={rijen} />

      <Alinea>
        In je eigen omgeving vind je alles wat bij deze opleiding hoort. De
        lesdata sturen we je ruim van tevoren toe.
      </Alinea>

      <Knop href={portaalUrl}>Naar mijn omgeving</Knop>

      <Scheiding />

      <Alinea gedempt>
        Een factuur of betaalbewijs nodig? Stuur ons een bericht, dan sturen we
        het je toe. Heb je vragen over de opleiding, dan kun je die stellen via
        je eigen omgeving — daar lezen we mee.
      </Alinea>
    </Mail>
  );
}

/**
 * 4b. Aanvraag tot inschrijving, zolang online betalen nog niet aanstaat
 * (§7.1). De klant koopt niets; we nemen persoonlijk contact op.
 */
export function InschrijfaanvraagMail({
  voornaam,
  cursusTitel,
}: {
  voornaam: string;
  cursusTitel: string;
}) {
  return (
    <Mail voorvertoning="We hebben je aanvraag ontvangen">
      <Kop>Je aanvraag is binnen</Kop>
      <Alinea>Hallo {voornaam},</Alinea>
      <Alinea>
        Je hebt je aangemeld voor <strong>{cursusTitel}</strong>. We nemen
        binnen twee werkdagen persoonlijk contact met je op om de inschrijving
        af te ronden en de praktische informatie door te nemen.
      </Alinea>
      <Alinea>Er is nog niets betaald en je zit nog nergens aan vast.</Alinea>
      <Alinea gedempt>
        Deze mail is automatisch verstuurd; je hoeft er niet op te antwoorden.
      </Alinea>
    </Mail>
  );
}

/**
 * 4b. Bevestiging na het aanvragen van een strippenkaart of abonnement.
 *
 * Apart van de inschrijfaanvraag, want een kaart is geen opleiding: er valt
 * geen praktische informatie door te nemen, en de kaart gaat pas gelden zodra
 * hij betaald is. Dat laatste hoort erin, anders staat iemand voor niets op de
 * mat bij de eerstvolgende les.
 */
export function KaartaanvraagMail({
  voornaam,
  kaart,
  prijs,
}: {
  voornaam: string;
  kaart: string;
  prijs: string;
}) {
  return (
    <Mail voorvertoning="We hebben je aanvraag ontvangen">
      <Kop>Je aanvraag is binnen</Kop>
      <Alinea>Hallo {voornaam},</Alinea>
      <Alinea>
        Je hebt een <strong>{kaart}</strong> aangevraagd van {prijs}. We nemen
        binnen twee werkdagen contact met je op om de betaling af te spreken.
      </Alinea>
      <Alinea>
        Zodra dat rond is staat je kaart klaar en kun je lessen reserveren. Er
        is nu nog niets betaald en je zit nergens aan vast.
      </Alinea>
      <Alinea gedempt>
        Deze mail is automatisch verstuurd; je hoeft er niet op te antwoorden.
      </Alinea>
    </Mail>
  );
}

/** 5a. Bevestiging naar de afzender van het contactformulier. */
export function ContactBevestigingMail({ naam }: { naam: string }) {
  return (
    <Mail voorvertoning="We hebben je bericht ontvangen">
      <Kop>We hebben je bericht ontvangen</Kop>
      <Alinea>Hallo {naam},</Alinea>
      <Alinea>
        Bedankt voor je bericht. We lezen het en reageren meestal binnen twee
        werkdagen.
      </Alinea>
      <Alinea gedempt>
        Deze mail is automatisch verstuurd; je hoeft er niet op te antwoorden.
      </Alinea>
    </Mail>
  );
}

/** 5b. Notificatie naar de admin. Bevat bewust geen inhoud van het bericht. */
export function ContactNotificatieMail({ beheerUrl }: { beheerUrl: string }) {
  return (
    <Mail voorvertoning="Er staat een nieuw contactbericht klaar">
      <Kop>Nieuw contactbericht</Kop>
      <Alinea>
        Er is via de website een bericht binnengekomen. Je leest het in de
        beheeromgeving.
      </Alinea>
      <Knop href={beheerUrl}>Bekijk het bericht</Knop>
      <Scheiding />
      <Alinea gedempt>
        De inhoud staat bewust niet in deze mail: persoonsgegevens horen achter
        een inlog, niet in een postvak.
      </Alinea>
    </Mail>
  );
}

/** 6. Nieuw bericht in de beveiligde dialoog — nooit met de inhoud erin. */
export function NieuwBerichtMail({
  voornaam,
  portaalUrl,
}: {
  voornaam: string;
  portaalUrl: string;
}) {
  return (
    <Mail voorvertoning="Je hebt een bericht van YogaCompany">
      <Kop>Je hebt een bericht</Kop>
      <Alinea>Hallo {voornaam},</Alinea>
      <Alinea>
        Er staat een bericht van YogaCompany voor je klaar. Log in om het te
        lezen en te beantwoorden.
      </Alinea>
      <Knop href={portaalUrl}>Lees je bericht</Knop>
      <Scheiding />
      <Alinea gedempt>
        We zetten de inhoud niet in deze mail: je gesprek met ons blijft achter
        je inlog.
      </Alinea>
    </Mail>
  );
}

/** 7. Mailing naar klanten die daar toestemming voor gaven. */
export function MailingMail({
  inhoudHtml,
  afmeldUrl,
}: {
  inhoudHtml: string;
  afmeldUrl: string;
}) {
  return (
    <Mail voorvertoning="Nieuws van YogaCompany">
      <div dangerouslySetInnerHTML={{ __html: inhoudHtml }} />
      <Scheiding />
      <Alinea gedempt>
        Je ontvangt deze mail omdat je daar toestemming voor gaf.{" "}
        <a href={afmeldUrl} style={{ color: "#4E6970" }}>
          Afmelden
        </a>{" "}
        kan met één klik.
      </Alinea>
    </Mail>
  );
}
