-- AVG-verwijdering (BOUWPROMPT §13, §17.7).
--
-- Twee dingen moeten hier tegelijk waar zijn, en ze spreken elkaar op het
-- eerste gezicht tegen: de persoonsgegevens moeten wég, en de financiële
-- administratie moet blijven. Deze tests controleren beide.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_profiel profiles%rowtype;
  v_inschrijvingen int;
  v_berichten int;
  v_aanvragen int;
  v_notities int;
  v_voortgang int;
begin
  -- --- een klant mag dit niet zelf ------------------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.mutation_blocked(format(
      'select anonimiseer_profiel(%L)', v_klant_a
    )),
    'een klant kan het profiel van een ander niet anonimiseren'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'select zet_profiel_rol(%L, ''admin'')', v_klant_b
    )),
    'een klant kan zichzelf via de rolfunctie geen beheerder maken'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'select zet_profiel_actief(%L, false)', v_klant_a
    )),
    'een klant kan een ander account niet deactiveren'
  );

  -- Controleer dat er niets is gebeurd.
  perform tests.act_as_owner();
  select * into v_profiel from profiles where id = v_klant_a;
  perform tests.expect(
    v_profiel.first_name <> 'Verwijderde',
    'het profiel van klant A is ongemoeid gebleven'
  );

  -- --- de admin mag het wel --------------------------------------------------
  perform tests.act_as(v_admin);
  perform anonimiseer_profiel(v_klant_a);
  perform tests.act_as_owner();

  select * into v_profiel from profiles where id = v_klant_a;

  perform tests.expect(
    v_profiel.first_name = 'Verwijderde' and v_profiel.last_name = 'klant',
    'de naam is vervangen'
  );

  perform tests.expect(
    v_profiel.email like 'verwijderd+%@yogacompanie.invalid',
    'het e-mailadres is vervangen door een onbruikbaar adres'
  );

  perform tests.expect(
    v_profiel.phone is null and v_profiel.marketing_consent_at is null,
    'telefoonnummer en toestemming zijn gewist'
  );

  perform tests.expect(
    v_profiel.deleted_at is not null,
    'het profiel staat als verwijderd gemarkeerd'
  );

  -- --- vrije tekst is weg ----------------------------------------------------
  select count(*) into v_berichten
    from messages m
    join conversations c on c.id = m.conversation_id
   where c.profile_id = v_klant_a;
  perform tests.expect(v_berichten = 0, 'de berichten zijn verwijderd');

  select count(*) into v_aanvragen from requests where profile_id = v_klant_a;
  perform tests.expect(v_aanvragen = 0, 'de aanvragen zijn verwijderd');

  select count(*) into v_notities from crm_notes where profile_id = v_klant_a;
  perform tests.expect(v_notities = 0, 'de interne notities zijn verwijderd');

  select count(*) into v_voortgang from progress where profile_id = v_klant_a;
  perform tests.expect(v_voortgang = 0, 'de voortgang is verwijderd');

  perform tests.expect(
    (select count(*) from conversations where profile_id = v_klant_a) = 0,
    'de conversatie is verwijderd'
  );

  -- --- maar de administratie blijft ------------------------------------------
  select count(*) into v_inschrijvingen
    from enrollments where profile_id = v_klant_a;

  perform tests.expect(
    v_inschrijvingen > 0,
    'de inschrijvingen blijven staan voor de boekhouding'
  );

  perform tests.expect(
    (select status from enrollments
      where id = 'eeeeeeee-0000-0000-0000-000000000001') = 'betaald',
    'de betaalstatus van de inschrijving is onaangeroerd'
  );

  -- --- herhaalbaar ------------------------------------------------------------
  perform tests.act_as(v_admin);
  perform anonimiseer_profiel(v_klant_a);
  perform tests.act_as_owner();

  perform tests.expect(
    (select count(*) from profiles where id = v_klant_a) = 1,
    'een tweede keer anonimiseren verandert niets en faalt niet'
  );
end;
$$;

-- De laatste beheerder mag nooit verdwijnen: anders kan niemand er meer bij.
do $$
declare
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_rol user_role;
begin
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.mutation_blocked(format(
      'select zet_profiel_rol(%L, ''klant'')', v_admin
    )),
    'de laatste beheerder kan zijn eigen rol niet intrekken'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'select zet_profiel_actief(%L, false)', v_admin
    )),
    'de laatste beheerder kan zichzelf niet deactiveren'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set role = ''klant'' where id = %L', v_admin
    )),
    'ook rechtstreeks bijwerken kan de laatste beheerder niet degraderen'
  );

  perform tests.act_as_owner();
  select role into v_rol from profiles where id = v_admin;
  perform tests.expect(
    v_rol = 'admin',
    'de beheerder is nog altijd beheerder'
  );
end;
$$;
