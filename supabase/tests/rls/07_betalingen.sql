-- Betaalstatus: alleen de webhook en de admin bepalen of er betaald is.
--
-- Dit is de kern van BOUWPROMPT §9: zou een klant de status zelf kunnen
-- zetten, dan geeft hij zichzelf toegang tot betaalde content zonder te
-- betalen. De inschrijving aanmaken mag; de status bepalen niet.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_inschrijving_b uuid := 'eeeeeeee-0000-0000-0000-000000000002';
  v_status enrollment_status;
begin
  -- --- klant B heeft een inschrijving in afwachting -------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.mutation_blocked(format(
      'update enrollments set status = ''betaald'' where id = %L',
      v_inschrijving_b
    )),
    'klant B kan de eigen inschrijving niet op betaald zetten'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update enrollments set paid_at = now() where id = %L',
      v_inschrijving_b
    )),
    'klant B kan geen betaaldatum invullen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update enrollments set amount_cents = 1 where id = %L',
      v_inschrijving_b
    )),
    'klant B kan het betaalde bedrag niet aanpassen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update enrollments set status = ''afgerond'' where id = %L',
      v_inschrijving_b
    )),
    'klant B kan zichzelf ook niet op afgerond zetten'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'delete from enrollments where id = %L', v_inschrijving_b
    )),
    'klant B kan de eigen inschrijving niet verwijderen'
  );

  -- Controleer dat er echt niets is veranderd.
  perform tests.act_as_owner();
  select status into v_status from enrollments where id = v_inschrijving_b;
  perform tests.expect(
    v_status = 'in_afwachting',
    'de inschrijving van klant B staat nog altijd in afwachting'
  );

  -- --- zonder betaling geen content -----------------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from content_items where is_preview = false'
    ) = 0,
    'klant B ziet nog steeds geen betaalde content'
  );

  -- --- de admin mag het wel --------------------------------------------------
  perform tests.act_as(v_admin);

  update enrollments
     set status = 'betaald', paid_at = now(), amount_cents = 295000
   where id = v_inschrijving_b;

  perform tests.act_as_owner();
  select status into v_status from enrollments where id = v_inschrijving_b;
  perform tests.expect(
    v_status = 'betaald',
    'de admin kan een inschrijving handmatig op betaald zetten'
  );

  -- --- en dan volgt de toegang vanzelf ---------------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from content_items where is_preview = false'
    ) = 1,
    'na betaling ziet klant B de betaalde content wel'
  );

  perform tests.expect(
    tests.visible_count(format(
      'select 1 from enrollments where profile_id = %L', v_klant_a
    )) = 0,
    'klant B ziet nog altijd niets van klant A'
  );

  -- --- na terugbetaling vervalt de toegang -----------------------------------
  perform tests.act_as(v_admin);
  update enrollments set status = 'geannuleerd' where id = v_inschrijving_b;

  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from content_items where is_preview = false'
    ) = 0,
    'na een terugbetaling vervalt de toegang tot de betaalde content'
  );

  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 1,
    'de proefles blijft wel zichtbaar'
  );

  perform tests.act_as_owner();
end;
$$;
