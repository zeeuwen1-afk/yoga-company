-- Inschrijvingen en voortgang: strikt gescheiden per klant. Een klant mag zich
-- inschrijven, maar nooit zelf bepalen dat er betaald is (BOUWPROMPT §6, §9).

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_cursus uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_item uuid := 'dddddddd-0000-0000-0000-000000000001';
begin
  -- --- inschrijvingen --------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from enrollments') = 1,
    'klant A ziet uitsluitend de eigen inschrijving'
  );

  perform tests.expect(
    tests.visible_count(format(
      'select 1 from enrollments where profile_id = %L', v_klant_b
    )) = 0,
    'klant A kan de inschrijving van klant B niet lezen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update enrollments set status = ''betaald'' where profile_id = %L',
      v_klant_b
    )),
    'klant A kan de inschrijving van klant B niet op betaald zetten'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into enrollments (profile_id, course_id, status) values ('
      || quote_literal(v_klant_a) || ', '
      || quote_literal('aaaaaaaa-0000-0000-0000-000000000002') || ', ''betaald'')'
    ),
    'klant A kan geen inschrijving aanmaken die meteen betaald is'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into enrollments (profile_id, course_id) values ('
      || quote_literal(v_klant_b) || ', '
      || quote_literal('aaaaaaaa-0000-0000-0000-000000000002') || ')'
    ),
    'klant A kan geen inschrijving op naam van klant B aanmaken'
  );

  -- Een eigen inschrijving in afwachting mag wel.
  insert into enrollments (profile_id, course_id)
  values (v_klant_a, 'aaaaaaaa-0000-0000-0000-000000000002');
  perform tests.expect(
    tests.visible_count('select 1 from enrollments') = 2,
    'klant A kan zich wel zelf inschrijven'
  );

  -- --- voortgang -------------------------------------------------------------
  perform tests.expect(
    tests.visible_count('select 1 from progress') = 1,
    'klant A ziet de eigen voortgang'
  );

  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count('select 1 from progress') = 0,
    'klant B ziet de voortgang van klant A niet'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update progress set last_position_seconds = 999 where profile_id = %L',
      v_klant_a
    )),
    'klant B kan de voortgang van klant A niet wijzigen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into progress (profile_id, content_item_id) values ('
      || quote_literal(v_klant_a) || ', ' || quote_literal(v_item) || ')'
    ),
    'klant B kan geen voortgang op naam van klant A aanmaken'
  );

  -- --- admin -----------------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from enrollments') >= 3,
    'de admin ziet alle inschrijvingen'
  );

  perform tests.expect(
    tests.visible_count('select 1 from progress') = 1,
    'de admin ziet de voortgang voor monitoring'
  );

  perform tests.act_as_owner();
end;
$$;
