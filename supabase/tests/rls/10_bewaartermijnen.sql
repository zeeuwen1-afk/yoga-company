-- Bewaartermijnen (BOUWPROMPT §17.6).
--
-- Een bewaartermijn die alleen in een document staat is geen bewaartermijn.
-- Deze tests controleren dat de opschoontaak echt verwijdert wat te oud is,
-- echt laat staan wat nog binnen de termijn valt, en dat niet zomaar iedereen
-- hem kan aanroepen.

do $$
declare
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_uitkomst jsonb;
begin
  -- --- klaarzetten: oud en recent naast elkaar --------------------------------
  perform tests.act_as_owner();

  insert into contact_messages (name, email, body, created_at)
  values
    ('Oud bericht', 'oud@rls-test.invalid', 'Van te lang geleden',
     now() - interval '13 months'),
    ('Recent bericht', 'recent@rls-test.invalid', 'Van vorige maand',
     now() - interval '1 month');

  insert into mailings (subject, body_html, created_at)
  values
    ('Oude mailing', '<p>oud</p>', now() - interval '13 months'),
    ('Recente mailing', '<p>recent</p>', now() - interval '2 months');

  insert into audit_log (actor_id, action, entity, created_at)
  values
    (v_admin, 'oude_actie', 'test', now() - interval '25 months'),
    (v_admin, 'recente_actie', 'test', now() - interval '1 month');

  -- Klant B staat al zeven maanden op non-actief en is dus toe aan definitief
  -- anonimiseren.
  update profiles
     set deleted_at = now() - interval '7 months'
   where id = v_klant_b;

  -- --- een klant mag de taak niet aanroepen ----------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.mutation_blocked('select opruimen_bewaartermijnen()'),
    'een klant kan de opschoontaak niet aanroepen'
  );

  perform tests.act_as_owner();
  perform tests.expect(
    -- Alleen de twee rijen van deze test tellen: eerdere testbestanden delen
    -- dezelfde transactie en laten hun eigen contactberichten achter.
    (select count(*) from contact_messages
      where name in ('Oud bericht', 'Recent bericht')) = 2,
    'de mislukte poging heeft niets opgeruimd'
  );

  -- --- de admin mag het wel --------------------------------------------------
  perform tests.act_as(v_admin);
  select opruimen_bewaartermijnen() into v_uitkomst;
  perform tests.act_as_owner();

  -- --- wat te oud is, is weg -------------------------------------------------
  perform tests.expect(
    (select count(*) from contact_messages
      where name = 'Oud bericht') = 0,
    'een contactbericht ouder dan 12 maanden is verwijderd'
  );

  perform tests.expect(
    (select count(*) from mailings where subject = 'Oude mailing') = 0,
    'een mailing ouder dan 12 maanden is verwijderd'
  );

  perform tests.expect(
    (select count(*) from audit_log where action = 'oude_actie') = 0,
    'een auditregel ouder dan 24 maanden is verwijderd'
  );

  -- --- wat binnen de termijn valt, blijft staan ------------------------------
  perform tests.expect(
    (select count(*) from contact_messages
      where name = 'Recent bericht') = 1,
    'een contactbericht van een maand oud blijft staan'
  );

  perform tests.expect(
    (select count(*) from mailings where subject = 'Recente mailing') = 1,
    'een mailing van twee maanden oud blijft staan'
  );

  perform tests.expect(
    (select count(*) from audit_log where action = 'recente_actie') = 1,
    'een auditregel van een maand oud blijft staan'
  );

  -- --- soft-deleted profielen worden geanonimiseerd --------------------------
  perform tests.expect(
    (select email from profiles where id = v_klant_b)
      like 'verwijderd+%@yogacompanie.invalid',
    'een profiel dat zeven maanden op non-actief stond is geanonimiseerd'
  );

  perform tests.expect(
    (select count(*) from profiles
      where id = v_admin
        and deleted_at is null
        and email not like 'verwijderd+%') = 1,
    'een actief profiel is niet aangeraakt'
  );

  -- --- de uitkomst is de verantwoording --------------------------------------
  perform tests.expect(
    (v_uitkomst ->> 'contactberichten')::int = 1
      and (v_uitkomst ->> 'mailings')::int = 1
      and (v_uitkomst ->> 'auditregels')::int = 1
      and (v_uitkomst ->> 'profielen')::int = 1,
    'de taak meldt precies wat hij heeft opgeruimd'
  );

  -- --- nog een keer draaien is ongevaarlijk ----------------------------------
  perform tests.act_as(v_admin);
  select opruimen_bewaartermijnen() into v_uitkomst;
  perform tests.act_as_owner();

  perform tests.expect(
    (v_uitkomst ->> 'profielen')::int = 0,
    'een tweede ronde anonimiseert niet nog eens hetzelfde profiel'
  );
end;
$$;

-- Mailings en social posts blijven onder een admin-only policy vallen; de
-- nieuwe kolommen mogen daar niets aan veranderd hebben.
do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
begin
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select id from mailings') = 0,
    'een klant ziet geen mailings'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into social_posts (platform, caption, topic) '
      || 'values (''instagram'', ''hallo'', ''test'')'
    ),
    'een klant kan geen socialmediabericht aanmaken'
  );

  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select id from mailings') = 0,
    'een bezoeker zonder sessie ziet geen mailings'
  );
end;
$$;
