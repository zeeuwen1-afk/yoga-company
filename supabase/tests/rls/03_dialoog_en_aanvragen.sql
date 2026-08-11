-- De beveiligde dialoog: een klant leest en schrijft uitsluitend in de eigen
-- conversatie, en kan de afzender niet vervalsen (BOUWPROMPT §6, §11).

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_gesprek_a uuid;
  v_gesprek_b uuid;
begin
  select id into v_gesprek_a from conversations where profile_id = v_klant_a;
  select id into v_gesprek_b from conversations where profile_id = v_klant_b;

  perform tests.expect(
    v_gesprek_a is not null and v_gesprek_b is not null,
    'bij registratie is automatisch een conversatie aangemaakt'
  );

  -- --- klant B probeert bij klant A te komen ---------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count('select 1 from conversations') = 1,
    'klant B ziet uitsluitend de eigen conversatie'
  );

  perform tests.expect(
    tests.visible_count('select 1 from messages') = 0,
    'klant B ziet geen berichten van klant A'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into messages (conversation_id, sender_id, body) values ('
      || quote_literal(v_gesprek_a) || ', ' || quote_literal(v_klant_b)
      || ', ''Ingebroken'')'
    ),
    'klant B kan niet schrijven in de conversatie van klant A'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into messages (conversation_id, sender_id, body) values ('
      || quote_literal(v_gesprek_b) || ', ' || quote_literal(v_klant_a)
      || ', ''Vervalst'')'
    ),
    'klant B kan geen bericht op naam van klant A versturen'
  );

  -- In de eigen conversatie op eigen naam mag het wel.
  insert into messages (conversation_id, sender_id, body)
  values (v_gesprek_b, v_klant_b, 'Eigen bericht');
  perform tests.expect(
    tests.visible_count('select 1 from messages') = 1,
    'klant B kan wel in de eigen conversatie schrijven'
  );

  -- --- aanvragen -------------------------------------------------------------
  perform tests.expect(
    tests.visible_count('select 1 from requests') = 0,
    'klant B ziet de aanvraag van klant A niet'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into requests (profile_id, kind, body) values ('
      || quote_literal(v_klant_a) || ', ''vraag'', ''Namens A'')'
    ),
    'klant B kan geen aanvraag op naam van klant A indienen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into requests (profile_id, kind, status) values ('
      || quote_literal(v_klant_b) || ', ''vraag'', ''afgerond'')'
    ),
    'klant B kan een aanvraag niet meteen als afgerond indienen'
  );

  insert into requests (profile_id, kind, body)
  values (v_klant_b, 'vraag', 'Eigen vraag');
  perform tests.expect(
    tests.visible_count('select 1 from requests') = 1,
    'klant B kan wel een eigen aanvraag indienen'
  );

  -- --- anoniem ---------------------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from messages') = 0
    and tests.visible_count('select 1 from conversations') = 0
    and tests.visible_count('select 1 from requests') = 0,
    'een anonieme bezoeker ziet geen dialoog of aanvragen'
  );

  -- --- admin -----------------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from messages') >= 2,
    'de admin ziet de berichten van alle klanten'
  );

  perform tests.expect(
    tests.visible_count('select 1 from requests') >= 2,
    'de admin ziet alle aanvragen'
  );

  perform tests.act_as_owner();
end;
$$;
