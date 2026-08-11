-- Profielen: een klant ziet en bewerkt uitsluitend de eigen rij, en kan de
-- eigen rol of verwijderstatus nooit aanpassen (BOUWPROMPT §6).

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
begin
  -- --- klant A ---------------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from profiles') = 1,
    'klant A ziet uitsluitend het eigen profiel'
  );

  perform tests.expect(
    tests.visible_count(
      format('select 1 from profiles where id = %L', v_klant_b)
    ) = 0,
    'klant A kan het profiel van klant B niet lezen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set first_name = ''Gekaapt'' where id = %L', v_klant_b
    )),
    'klant A kan het profiel van klant B niet wijzigen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set role = ''admin'' where id = %L', v_klant_a
    )),
    'klant A kan zichzelf geen adminrol geven'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update profiles set deleted_at = now() where id = %L', v_klant_a
    )),
    'klant A kan zichzelf niet op verwijderd zetten'
  );

  perform tests.expect(
    (select deleted_at from profiles where id = v_klant_a) is null,
    'de verwijderstatus van klant A is onveranderd gebleven'
  );

  -- De toegestane velden moeten wél werken.
  update profiles set first_name = 'Aangepast' where id = v_klant_a;
  perform tests.expect(
    (select first_name from profiles where id = v_klant_a) = 'Aangepast',
    'klant A kan de eigen naam wel wijzigen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'delete from profiles where id = %L', v_klant_b
    )),
    'klant A kan het profiel van klant B niet verwijderen'
  );

  -- --- anonieme bezoeker -----------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from profiles') = 0,
    'een anonieme bezoeker ziet geen enkel profiel'
  );

  -- --- admin -----------------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from profiles') >= 3,
    'de admin ziet alle profielen'
  );

  update profiles set role = 'admin' where id = v_klant_b;
  perform tests.expect(
    (select role from profiles where id = v_klant_b) = 'admin',
    'de admin mag rollen wel wijzigen'
  );
  update profiles set role = 'klant' where id = v_klant_b;

  perform tests.act_as_owner();
end;
$$;
