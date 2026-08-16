-- Het uitgebreide klantdossier. Twee dingen moeten hier hard staan:
--
--   1. Gezondheidsgegevens zijn bijzondere persoonsgegevens en mogen door
--      niemand via de API bereikbaar zijn — ook niet door een beheerder, want
--      die leest ze server-side via de service-role.
--   2. Verslagen, notities en gegenereerde analyses zijn uitsluitend voor de
--      beheerder. Een klant mag zijn eigen dossier niet inzien; de beheerder
--      bepaalt wat hij deelt.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_gezondheid int;
begin
  perform tests.act_as_owner();

  insert into sensitive.client_health (profile_id, body, consent_at, updated_by)
  values (v_klant_a, 'Lage rugklachten, voorzichtig met voorwaartse buigingen.',
          now(), v_admin)
  on conflict (profile_id) do update set body = excluded.body;

  insert into crm_analyses (profile_id, body, model, created_by)
  values (v_klant_a, 'Gespreksverslag voor klant A.', 'test-model', v_admin);

  insert into crm_notes (profile_id, author_id, body, kind, title)
  values (v_klant_a, v_admin, 'Verslag van het intakegesprek.', 'verslag',
          'Intake');

  -- --- gezondheidsgegevens zijn voor niemand via de API bereikbaar ----------
  perform tests.act_as_anon();
  perform tests.expect(
    tests.mutation_blocked('select 1 from sensitive.client_health'),
    'een bezoeker kan niet bij de gezondheidsgegevens'
  );

  perform tests.act_as(v_klant_a);
  perform tests.expect(
    tests.mutation_blocked('select 1 from sensitive.client_health'),
    'een klant kan niet bij zijn eigen gezondheidsgegevens via de API'
  );

  perform tests.act_as(v_admin);
  perform tests.expect(
    tests.mutation_blocked('select 1 from sensitive.client_health'),
    'ook een beheerder komt er niet via de API bij, alleen server-side'
  );

  -- Ze staan er wél; alleen de weg erheen is afgesloten.
  perform tests.act_as_owner();
  select count(*) into v_gezondheid from sensitive.client_health;
  perform tests.expect(
    v_gezondheid = 1,
    'de gezondheidsgegevens zijn gewoon opgeslagen'
  );

  -- --- verslagen en analyses: uitsluitend de beheerder ----------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from crm_analyses') = 0,
    'een klant ziet zijn eigen gespreksverslag niet — de beheerder deelt wat hij wil'
  );

  perform tests.expect(
    tests.visible_count('select 1 from crm_notes') = 0,
    'een klant ziet de interne notities en verslagen niet'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into crm_analyses (profile_id, body, model) values ('
      || quote_literal(v_klant_a) || ', ''Zelf geschreven'', ''x'')'
    ),
    'een klant kan geen verslag aan zijn eigen dossier toevoegen'
  );

  perform tests.act_as(v_klant_b);
  perform tests.expect(
    tests.visible_count('select 1 from crm_analyses') = 0,
    'klant B ziet het verslag van klant A niet'
  );

  perform tests.act_as(v_admin);
  perform tests.expect(
    tests.visible_count('select 1 from crm_analyses') = 1,
    'de beheerder ziet het verslag wel'
  );

  -- --- de nieuwe klantvelden blijven onder dezelfde regels ------------------
  perform tests.act_as_owner();
  update profiles
     set birth_date = '1980-05-04', city = 'Utrecht',
         interests = array['yin', 'ademwerk']
   where id = v_klant_a;

  perform tests.act_as(v_klant_b);
  perform tests.expect(
    tests.visible_count(
      'select 1 from profiles where id = ' || quote_literal(v_klant_a)
    ) = 0,
    'klant B ziet de gegevens van klant A nog steeds niet'
  );

  perform tests.act_as(v_klant_a);
  perform tests.expect(
    tests.visible_count('select 1 from profiles where city = ''Utrecht''') = 1,
    'klant A ziet zijn eigen gegevens wel'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update profiles set birth_date = ''1990-01-01'' where id = '
      || quote_literal(v_klant_b)
    ),
    'een klant kan de geboortedatum van een ander niet aanpassen'
  );

  -- --- AVG-verwijdering ruimt juist deze gegevens volledig op ---------------
  perform tests.act_as_owner();
  perform anonimiseer_profiel(v_klant_a);

  select count(*) into v_gezondheid from sensitive.client_health
   where profile_id = v_klant_a;
  perform tests.expect(
    v_gezondheid = 0,
    'de gezondheidsgegevens zijn na verwijdering volledig weg'
  );

  perform tests.expect(
    (select count(*) from crm_analyses where profile_id = v_klant_a) = 0,
    'de gespreksverslagen zijn na verwijdering volledig weg'
  );

  perform tests.expect(
    (select birth_date is null and city is null and interests = '{}'
       from profiles where id = v_klant_a),
    'de uitgebreide klantvelden zijn leeggemaakt'
  );
end $$;
