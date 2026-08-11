-- Het klantportaal leest overal zonder filter op profile_id: RLS levert per
-- definitie alleen de eigen rijen. Deze tests controleren dat die aanname
-- klopt — want als hij niet klopt, lekt het hele portaal (BOUWPROMPT §2.1).
--
-- Elke query hieronder is er één die het portaal daadwerkelijk uitvoert.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_item_betaald uuid := 'dddddddd-0000-0000-0000-000000000001';
  v_gesprek_a uuid;
begin
  select id into v_gesprek_a from conversations where profile_id = v_klant_a;

  -- --- Dashboard: "verder waar je gebleven was" -----------------------------
  -- Klant A heeft voortgang op een betaald item; klant B mag daar niets van
  -- terugzien, ook niet via de omweg van de gekoppelde tabellen.
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from progress p join content_items i on i.id = p.content_item_id'
    ) = 0,
    'klant B ziet via de dashboardquery geen voortgang van klant A'
  );

  -- --- Voortgangsteller ------------------------------------------------------
  -- De teller leunt erop dat content_items alleen toegankelijke items levert.
  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 1,
    'klant B telt alleen de proefles mee in zijn voortgang'
  );

  -- --- Mijn opleidingen -----------------------------------------------------
  perform tests.expect(
    tests.visible_count(
      'select 1 from enrollments where status in (''betaald'',''afgerond'')'
    ) = 0,
    'klant B ziet geen betaalde inschrijvingen, ook niet die van klant A'
  );

  -- --- Berichtenteller ------------------------------------------------------
  perform tests.expect(
    tests.visible_count(
      format('select 1 from messages where read_at is null and sender_id <> %L', v_klant_b)
    ) = 0,
    'de ongelezenteller van klant B telt geen berichten van klant A'
  );

  -- Berichten van een ander als gelezen markeren mag ook niet.
  perform tests.expect(
    tests.mutation_blocked(
      'update messages set read_at = now() where read_at is null'
    ),
    'klant B kan de berichten van klant A niet als gelezen markeren'
  );

  -- --- Aanvragenteller ------------------------------------------------------
  -- Klant B heeft zelf een aanvraag lopen; die telt wél mee. Waar het om gaat
  -- is dat de aanvraag van klant A er niet tussen zit.
  perform tests.expect(
    tests.visible_count(format(
      'select 1 from requests where profile_id <> %L', v_klant_b
    )) = 0,
    'de aanvragenteller van klant B telt niets van een andere klant mee'
  );

  -- --- AVG-export ------------------------------------------------------------
  -- De exportroute doet vijf queries zonder eigenaarsfilter. Geen daarvan mag
  -- ook maar één rij van een andere klant opleveren.
  perform tests.expect(
    tests.visible_count(format(
      'select 1 from profiles where id <> %L', v_klant_b
    )) = 0,
    'de AVG-export bevat geen ander profiel'
  );

  perform tests.expect(
    tests.visible_count(format(
      'select 1 from enrollments where profile_id <> %L', v_klant_b
    )) = 0,
    'de AVG-export bevat geen inschrijving van een andere klant'
  );

  perform tests.expect(
    tests.visible_count(format(
      'select 1 from progress where profile_id <> %L', v_klant_b
    )) = 0,
    'de AVG-export bevat geen voortgang van een andere klant'
  );

  perform tests.expect(
    tests.visible_count(format(
      'select 1 from messages m join conversations c on c.id = m.conversation_id'
      || ' where c.profile_id <> %L', v_klant_b
    )) = 0,
    'de AVG-export bevat geen bericht uit een ander gesprek'
  );

  -- --- Profielwijzigingen ----------------------------------------------------
  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set marketing_consent_at = now() where id = %L', v_klant_a
    )),
    'klant B kan geen toestemming voor mailings zetten namens klant A'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set phone = ''0600000000'' where id = %L', v_klant_a
    )),
    'klant B kan het telefoonnummer van klant A niet wijzigen'
  );

  -- Op zichzelf mag het wel.
  update profiles set marketing_consent_at = now() where id = v_klant_b;
  perform tests.expect(
    (select marketing_consent_at from profiles where id = v_klant_b) is not null,
    'klant B kan wel zelf toestemming geven'
  );

  -- --- Voortgang schrijven ---------------------------------------------------
  perform tests.expect(
    tests.mutation_blocked(
      'insert into progress (profile_id, content_item_id, last_position_seconds) values ('
      || quote_literal(v_klant_a) || ', ' || quote_literal(v_item_betaald) || ', 120)'
    ),
    'klant B kan geen voortgang wegschrijven op naam van klant A'
  );

  -- --- Berichten schrijven ---------------------------------------------------
  perform tests.expect(
    tests.mutation_blocked(
      'insert into messages (conversation_id, sender_id, body) values ('
      || quote_literal(v_gesprek_a) || ', ' || quote_literal(v_klant_b)
      || ', ''Meelezen'')'
    ),
    'klant B kan niet in de conversatie van klant A schrijven'
  );

  -- --- Klant A ziet nog steeds zijn eigen dossier ---------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from progress') = 1
    and tests.visible_count('select 1 from messages') = 1
    and tests.visible_count('select 1 from requests') = 1
    and tests.visible_count('select 1 from content_items') = 2,
    'klant A ziet zijn eigen voortgang, berichten, aanvragen en content'
  );

  perform tests.expect(
    (select marketing_consent_at from profiles where id = v_klant_a) is null,
    'de toestemming van klant A is niet aangeraakt door wat klant B deed'
  );

  -- --- Admin ziet alles voor de monitoring ----------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from progress') = 1,
    'de admin ziet de voortgang voor monitoring'
  );

  perform tests.act_as_owner();
end;
$$;
