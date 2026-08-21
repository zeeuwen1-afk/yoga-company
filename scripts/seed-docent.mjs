#!/usr/bin/env node
/**
 * Zet één docent volledig klaar, zodat de docentenlaag te proberen is.
 *
 *   pnpm db:seed-docent docent@voorbeeld.nl "Trisha" "de Vries" trisha
 *
 * Wat het doet, in deze volgorde:
 *
 *   1. het account opzoeken of uitnodigen;
 *   2. hem als docent koppelen aan de studio uit de seed;
 *   3. factuurgegevens en een lopend abonnement vastleggen;
 *   4. de bestaande lessen in het rooster aan een studio en aan hem hangen —
 *      zonder docent valt er niets te verrekenen en blijft "mijn lessen" leeg;
 *   5. een pagina aanmaken met het sjabloon erin, nog als concept.
 *
 * Herhaalbaar: alles wat er al staat blijft staan. Draai hem gerust twee keer.
 *
 * Let op: dit is opzetgereedschap, geen onderdeel van de gewone seed. Het maakt
 * een echt account aan met een wachtwoord dat het één keer toont.
 */
import "./omgeving.mjs";
import { createClient } from "@supabase/supabase-js";

const GROEN = "[32m";
const GEEL = "[33m";
const GRIJS = "[90m";
const RESET = "[0m";

function vereist(naam) {
  const waarde = process.env[naam];
  if (!waarde) {
    console.error(`${naam} ontbreekt. Zet hem in .env.local.`);
    process.exit(1);
  }
  return waarde;
}

const [email, voornaam, achternaam, slug] = process.argv.slice(2);

if (!email || !email.includes("@") || !voornaam || !achternaam || !slug) {
  console.error(`Geef alle vier de gegevens op:

  pnpm db:seed-docent <e-mail> <voornaam> <achternaam> <webadres>

Bijvoorbeeld:

  pnpm db:seed-docent trisha@voorbeeld.nl Trisha "de Vries" trisha

Het webadres komt op /docent/<webadres> te staan: kleine letters, cijfers en
koppeltekens.`);
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    "Het webadres mag alleen kleine letters, cijfers en koppeltekens bevatten.",
  );
  process.exit(1);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const supabase = createClient(
  vereist("NEXT_PUBLIC_SUPABASE_URL"),
  vereist("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const stap = (tekst) => console.log(`${GRIJS}  ·${RESET} ${tekst}`);
const klaar = (tekst) => console.log(`${GROEN}  ✓${RESET} ${tekst}`);
const let_op = (tekst) => console.log(`${GEEL}  !${RESET} ${tekst}`);

/**
 * Een wachtwoord dat je één keer overtypt en daarna vervangt.
 *
 * Geen uitnodigingsmail: zolang Resend niet is ingericht komt die niet aan, en
 * dan sta je met een account waar je niet in kunt. Dit is opzetgereedschap voor
 * een site die nog niet live is; een echte docent nodig je later gewoon uit.
 */
function wachtwoord() {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const cijfers = "23456789";
  const kies = (bron) => bron[Math.floor(Math.random() * bron.length)];
  return (
    Array.from({ length: 4 }, () => kies(letters)).join("") +
    "-" +
    Array.from({ length: 4 }, () => kies(letters)).join("") +
    "-" +
    Array.from({ length: 3 }, () => kies(cijfers)).join("")
  );
}

async function vindOfMaakAan() {
  const { data: bestaand } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (bestaand) {
    klaar(`account gevonden: ${bestaand.first_name} ${bestaand.last_name}`);
    if (bestaand.role === "admin") {
      let_op(
        "Dit is een beheerder. Als testdocent is dat ongelukkig: een admin mag\n" +
          "    overal bij, dus je test de beperkingen van een docent dan niet.\n" +
          "    Gebruik liever een apart account.",
      );
    }
    return { id: bestaand.id, nieuw: false };
  }

  const geheim = wachtwoord();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: geheim,
    // Meteen bevestigd: er gaat geen mail uit, dus er valt niets te bevestigen.
    email_confirm: true,
    user_metadata: { first_name: voornaam, last_name: achternaam },
  });

  if (error) throw new Error(`account aanmaken mislukte: ${error.message}`);

  klaar(`account aangemaakt voor ${email}`);
  console.log(`\n    inloggen met:  ${email}`);
  console.log(`    wachtwoord:    ${geheim}\n`);
  let_op("Verander dit wachtwoord na de eerste keer inloggen.");

  return { id: data.user.id, nieuw: true };
}

async function main() {
  console.log(`\nDocent klaarzetten: ${email}\n`);

  const { id: docentId } = await vindOfMaakAan();

  // --- De studio ------------------------------------------------------------
  const { data: studio } = await supabase
    .from("studios")
    .select("id, naam, max_deelnemers")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!studio) {
    throw new Error(
      "Er staat geen studio in de database. Draai eerst supabase/seed.sql.",
    );
  }
  stap(`studio: ${studio.naam} (maximaal ${studio.max_deelnemers} deelnemers)`);

  await supabase
    .from("studio_teachers")
    .upsert(
      { studio_id: studio.id, profile_id: docentId },
      { onConflict: "studio_id,profile_id" },
    );
  klaar("gekoppeld als docent bij deze studio");

  // --- Factuurgegevens ------------------------------------------------------
  const { data: billing } = await supabase
    .from("teacher_billing")
    .select("profile_id")
    .eq("profile_id", docentId)
    .maybeSingle();

  if (!billing) {
    const { error } = await supabase.from("teacher_billing").insert({
      profile_id: docentId,
      bedrijfsnaam: `${voornaam} ${achternaam}`,
      adres: "Straatnaam 1",
      postcode: "1300 AA",
      plaats: "Almere",
      kvk_nummer: "00000000",
      btw_nummer: "NL000000000B00",
      factuur_voorvoegsel: voornaam.slice(0, 2).toUpperCase(),
    });
    if (error) throw new Error(`factuurgegevens: ${error.message}`);
    klaar("factuurgegevens vastgelegd — pas ze aan met echte gegevens");
  } else {
    stap("factuurgegevens stonden er al");
  }

  // --- Abonnement -----------------------------------------------------------
  const { data: instelling } = await supabase
    .from("platform_instellingen")
    .select("waarde")
    .eq("sleutel", "docentabonnement_centen")
    .maybeSingle();

  const centen = Number(instelling?.waarde ?? 2500);

  const { data: abo } = await supabase
    .from("teacher_subscriptions")
    .select("id, actief")
    .eq("profile_id", docentId)
    .maybeSingle();

  if (!abo) {
    const { error } = await supabase.from("teacher_subscriptions").insert({
      profile_id: docentId,
      bedrag_centen: centen,
      bron_instelling_centen: centen,
      actief: true,
    });
    if (error) throw new Error(`abonnement: ${error.message}`);
    klaar(
      `abonnement actief — € ${(centen / 100).toFixed(2).replace(".", ",")} per maand`,
    );
  } else if (!abo.actief) {
    await supabase
      .from("teacher_subscriptions")
      .update({ actief: true, respijt_tot: null })
      .eq("id", abo.id);
    klaar("abonnement weer aangezet");
  } else {
    stap("abonnement liep al");
  }

  // --- Het rooster ----------------------------------------------------------
  // Bestaande lessen hebben nog geen studio en geen docent: die kolommen zijn
  // pas met de docentenlaag toegevoegd. Zonder studio werkt een strippenkaart
  // er niet op, en zonder docent valt er niets te verrekenen.
  const { data: lessen } = await supabase
    .from("class_sessions")
    .select("id, title, capacity, studio_id, docent_id");

  const zonderStudio = (lessen ?? []).filter((l) => !l.studio_id);
  const teGroot = (lessen ?? []).filter(
    (l) => l.capacity > studio.max_deelnemers,
  );

  if (teGroot.length > 0) {
    // De capaciteitsvangrail weigert een les met meer plekken dan de ruimte
    // heeft; die moeten eerst omlaag, anders mislukt de koppeling.
    for (const les of teGroot) {
      await supabase
        .from("class_sessions")
        .update({ capacity: studio.max_deelnemers })
        .eq("id", les.id);
    }
    let_op(
      `${teGroot.length} ${teGroot.length === 1 ? "les had" : "lessen hadden"} meer plekken dan de ruimte heeft — teruggezet naar ${studio.max_deelnemers}`,
    );
  }

  if (zonderStudio.length > 0) {
    const { error } = await supabase
      .from("class_sessions")
      .update({ studio_id: studio.id, docent_id: docentId })
      .is("studio_id", null);

    if (error) throw new Error(`rooster koppelen: ${error.message}`);
    klaar(
      `${zonderStudio.length} ${zonderStudio.length === 1 ? "les" : "lessen"} gekoppeld aan de studio en aan deze docent`,
    );
  } else {
    stap("de lessen hingen al aan een studio");
  }

  // --- De pagina ------------------------------------------------------------
  const { data: pagina } = await supabase
    .from("docent_paginas")
    .select("slug, status")
    .eq("profile_id", docentId)
    .maybeSingle();

  if (pagina) {
    stap(`pagina bestond al op /docent/${pagina.slug} (${pagina.status})`);
  } else {
    const { error } = await supabase.from("docent_paginas").insert({
      profile_id: docentId,
      slug,
      seo_titel: `${voornaam} ${achternaam} — yogadocent`,
    });

    if (error) {
      throw new Error(
        error.code === "23505"
          ? `het webadres "${slug}" is al bezet — kies een ander`
          : `pagina aanmaken: ${error.message}`,
      );
    }

    const { SJABLOON, bloktype } =
      await import("../src/content/docent-blokken.ts");

    const blokken = SJABLOON.map((type, index) => {
      const definitie = bloktype(type);
      const start = { ...definitie.start };
      if (type === "kop_portret") start.titel = `${voornaam} ${achternaam}`;
      return {
        pagina_id: docentId,
        type,
        volgorde: index + 1,
        inhoud: start,
      };
    });

    const { error: blokFout } = await supabase
      .from("docent_blokken")
      .insert(blokken);

    if (blokFout) throw new Error(`blokken: ${blokFout.message}`);

    klaar(
      `pagina aangemaakt op /docent/${slug}, met ${blokken.length} blokken`,
    );
    let_op("Hij staat nog als concept — publiceren doet de docent zelf.");
  }

  console.log(`
${GROEN}Klaar.${RESET}

Log in als ${email} en ga naar:

  /docenten          de portal met de vier getallen
  /docenten/pagina   de editor — schuif de blokken en publiceer

Daarna staat de pagina op ${siteUrl}/docent/${slug}
en verschijnt hij in de lijst op ${siteUrl}/onze-docenten.
`);
}

main().catch((error) => {
  console.error(`\nMislukt: ${error.message}`);
  process.exit(1);
});
