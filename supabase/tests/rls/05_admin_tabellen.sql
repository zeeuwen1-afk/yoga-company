-- Tabellen die uitsluitend voor de admin bestaan: CRM-notities, contact-
-- berichten, mailings, social posts en het audit log (BOUWPROMPT §6, §13).

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
begin
  -- --- klant ----------------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from crm_notes') = 0,
    'een klant ziet geen CRM-notities, ook niet over zichzelf'
  );

  perform tests.expect(
    tests.visible_count('select 1 from audit_log') = 0,
    'een klant ziet het audit log niet'
  );

  perform tests.expect(
    tests.visible_count('select 1 from contact_messages') = 0,
    'een klant ziet geen ingestuurde contactberichten'
  );

  perform tests.expect(
    tests.visible_count('select 1 from mailings') = 0
    and tests.visible_count('select 1 from social_posts') = 0,
    'een klant ziet geen mailings of social posts'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into crm_notes (profile_id, author_id, body) values ('
      || quote_literal(v_klant_a) || ', ' || quote_literal(v_klant_a)
      || ', ''Zelf toegevoegd'')'
    ),
    'een klant kan geen CRM-notitie toevoegen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into audit_log (actor_id, action, entity) values ('
      || quote_literal(v_klant_a) || ', ''vervalst'', ''profiles'')'
    ),
    'een klant kan het audit log niet vervuilen'
  );

  -- --- anoniem: contactformulier mag wel worden ingestuurd -------------------
  perform tests.act_as_anon();

  insert into contact_messages (name, email, body)
  values ('Nieuwe bezoeker', 'nieuw@rls-test.invalid', 'Vraag');

  perform tests.expect(
    tests.visible_count('select 1 from contact_messages') = 0,
    'een anonieme bezoeker kan wel insturen maar niets teruglezen'
  );

  -- --- admin -----------------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from crm_notes') = 1,
    'de admin ziet de CRM-notities'
  );

  perform tests.expect(
    tests.visible_count('select 1 from contact_messages') = 2,
    'de admin ziet de ingestuurde contactberichten'
  );

  perform tests.expect(
    tests.visible_count('select 1 from audit_log') = 1,
    'de admin ziet het audit log'
  );

  -- Het audit log is onveranderlijk: ook de admin mag niet herschrijven.
  perform tests.expect(
    tests.mutation_blocked(
      'update audit_log set action = ''aangepast'' where action = ''test'''
    ),
    'het audit log kan niet worden aangepast'
  );

  perform tests.expect(
    tests.mutation_blocked('delete from audit_log where action = ''test'''),
    'het audit log kan niet worden gewist'
  );

  perform tests.act_as_owner();
end;
$$;
