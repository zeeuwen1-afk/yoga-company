#!/usr/bin/env node
/**
 * Controleert de mailkoppeling door één echte proefmail te versturen.
 *
 * Zonder dit script is "Resend ingericht" een aanname: de sleutel staat in een
 * dashboard, de DNS-records staan bij de registrar, en of het samen werkt merk
 * je pas wanneer een klant zijn wachtwoord niet kan herstellen. Dit maakt er
 * een controle van die je vóór de livegang kunt doen.
 *
 *   pnpm mail:test jouw@adres.nl
 *
 * Het script controleert eerst wat er mis kan zijn — ontbrekende sleutel,
 * afzender op een ander domein dan het geverifieerde — en verstuurt daarna
 * pas. Wat Resend terugmeldt wordt vertaald naar wat je eraan kunt doen.
 */
import "./omgeving.mjs";
import { Resend } from "resend";

const GROEN = "[32m";
const ROOD = "[31m";
const GEEL = "[33m";
const DIM = "[2m";
const RESET = "[0m";

const ontvanger = process.argv[2];

if (!ontvanger || !ontvanger.includes("@")) {
  console.error(`Geef het adres op waar de proefmail heen moet:

  pnpm mail:test jouw@adres.nl

Gebruik bij voorkeur een adres bij een grote aanbieder (Gmail, Outlook), want
juist die filteren streng. Komt hij dáár aan, dan zit het goed.`);
  process.exit(1);
}

const sleutel = process.env.RESEND_API_KEY;
const afzender = process.env.EMAIL_FROM ?? "YogaCompany <info@yogacompany.eu>";

if (!sleutel) {
  console.error(`${ROOD}RESEND_API_KEY ontbreekt.${RESET}

Zet hem in .env.local om lokaal te testen, en in Vercel onder
Settings → Environment Variables om hem op de site te laten werken.

Zolang hij ontbreekt verstuurt de site niets: aanvragen en contactberichten
komen wél binnen bij het beheer, maar de klant krijgt geen bevestiging.`);
  process.exit(1);
}

/** Het domein achter het @ in de afzender, ook als er een naam voor staat. */
function domeinVan(adres) {
  const match = adres.match(/@([^>\s]+)/);
  return match ? match[1].toLowerCase() : null;
}

const afzenderDomein = domeinVan(afzender);

console.log(`${DIM}Afzender:${RESET}  ${afzender}`);
console.log(`${DIM}Ontvanger:${RESET} ${ontvanger}`);
console.log(
  `${DIM}Sleutel:${RESET}   ${sleutel.slice(0, 6)}… (${sleutel.length} tekens)\n`,
);

const resend = new Resend(sleutel);

// Eerst kijken welke domeinen Resend geverifieerd heeft. Een afzender op een
// niet-geverifieerd domein is de meest voorkomende oorzaak, en de foutmelding
// van Resend zelf noemt het domein niet.
try {
  const { data, error } = await resend.domains.list();

  if (error) {
    console.log(
      `${GEEL}Kon de domeinlijst niet opvragen (${error.message}). Ik probeer het versturen alsnog.${RESET}\n`,
    );
  } else {
    const domeinen = data?.data ?? [];

    if (domeinen.length === 0) {
      console.log(
        `${GEEL}Er is nog geen domein toegevoegd bij Resend.${RESET}\nVersturen lukt dan alleen naar je eigen accountadres.\n`,
      );
    } else {
      for (const domein of domeinen) {
        const klaar = domein.status === "verified";
        const teken = klaar ? `${GROEN}✓${RESET}` : `${GEEL}…${RESET}`;
        console.log(`  ${teken} ${domein.name} — ${domein.status}`);
      }
      console.log();

      const passend = domeinen.find(
        (d) => d.name.toLowerCase() === afzenderDomein,
      );

      if (!passend) {
        console.log(
          `${GEEL}Let op: de afzender staat op ${afzenderDomein}, en dat domein staat niet in de lijst hierboven.${RESET}\nZet EMAIL_FROM op een adres bij een geverifieerd domein.\n`,
        );
      } else if (passend.status !== "verified") {
        console.log(
          `${GEEL}Let op: ${afzenderDomein} is nog niet geverifieerd (${passend.status}).${RESET}\nDe DNS-records zijn waarschijnlijk nog niet overal doorgevoerd; dat kan tot 24 uur duren.\n`,
        );
      }
    }
  }
} catch (fout) {
  console.log(
    `${GEEL}Kon de domeinlijst niet opvragen (${fout.message}). Ik probeer het versturen alsnog.${RESET}\n`,
  );
}

const nu = new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });

const { data, error } = await resend.emails.send({
  from: afzender,
  to: [ontvanger],
  subject: "Proefmail van YogaCompany",
  text: `Deze proefmail is verstuurd op ${nu} vanaf de mailkoppeling van YogaCompany.

Komt hij aan in je postvak IN — en niet in de spammap — dan is de koppeling in orde.

Belandt hij wél in spam, dan ontbreken meestal de DNS-records SPF, DKIM of DMARC,
of zijn ze nog niet overal doorgevoerd.`,
  html: `<p>Deze proefmail is verstuurd op <strong>${nu}</strong> vanaf de mailkoppeling van YogaCompany.</p>
<p>Komt hij aan in je postvak IN — en niet in de spammap — dan is de koppeling in orde.</p>
<p>Belandt hij wél in spam, dan ontbreken meestal de DNS-records SPF, DKIM of DMARC, of zijn ze nog niet overal doorgevoerd.</p>`,
});

if (error) {
  console.error(`${ROOD}Versturen mislukt:${RESET} ${error.message}`);

  const tekst = `${error.name ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (tekst.includes("domain") || tekst.includes("verif")) {
    console.error(`
Dit gaat vrijwel zeker over het afzenderdomein. Controleer bij Resend onder
Domains of ${afzenderDomein} op "verified" staat, en of EMAIL_FROM een adres
op dat domein gebruikt.`);
  } else if (tekst.includes("api") && tekst.includes("key")) {
    console.error(`
De sleutel wordt niet geaccepteerd. Maak bij Resend een nieuwe aan onder
API Keys en werk RESEND_API_KEY bij — in .env.local én in Vercel.`);
  } else if (tekst.includes("testing") || tekst.includes("own email")) {
    console.error(`
Zolang er geen geverifieerd domein is, laat Resend alleen mail toe naar het
adres van je eigen account. Voeg ${afzenderDomein} toe onder Domains.`);
  }

  process.exit(1);
}

console.log(`${GROEN}Verstuurd.${RESET} Resend-id: ${data?.id ?? "onbekend"}

Kijk nu in het postvak van ${ontvanger}:

  ${GROEN}✓${RESET} in postvak IN   → de koppeling is in orde
  ${GEEL}!${RESET} in de spammap    → controleer SPF, DKIM en DMARC bij je registrar
  ${ROOD}✗${RESET} nergens          → kijk in het logboek van Resend onder Emails

${DIM}Let op: dit test de mail die de site zelf verstuurt. De verificatie- en
herstelmails komen van Supabase; die test je door in te loggen met "wachtwoord
vergeten". Zie docs/beheer.md §8.${RESET}`);
