-- Registratie: een nieuw account krijgt automatisch een profiel én een
-- conversatie, zodat de beveiligde dialoog vanaf dag één bestaat en er nooit
-- een gebruiker zonder profiel in het systeem staat (BOUWPROMPT §7).

do $$
declare
  v_nieuw uuid := '44444444-4444-4444-4444-444444444444';
  v_profiel profiles%rowtype;
  v_gesprekken int;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values (
    '00000000-0000-0000-0000-000000000000', v_nieuw,
    'authenticated', 'authenticated', 'nieuw@rls-test.invalid', 'x',
    now(), now(), now(),
    '{"first_name":"Nieuwe","last_name":"Cursist"}'::jsonb
  );

  select * into v_profiel from profiles where id = v_nieuw;

  perform tests.expect(
    v_profiel.id is not null,
    'registratie maakt automatisch een profiel aan'
  );

  perform tests.expect(
    v_profiel.role = 'klant',
    'een nieuw account krijgt de rol klant, nooit admin'
  );

  perform tests.expect(
    v_profiel.first_name = 'Nieuwe' and v_profiel.last_name = 'Cursist',
    'de naam uit de registratie komt in het profiel terecht'
  );

  perform tests.expect(
    v_profiel.email = 'nieuw@rls-test.invalid',
    'het e-mailadres komt mee'
  );

  perform tests.expect(
    v_profiel.marketing_consent_at is null,
    'zonder opt-in staat er geen toestemming voor mailings'
  );

  select count(*) into v_gesprekken
  from conversations where profile_id = v_nieuw;

  perform tests.expect(
    v_gesprekken = 1,
    'registratie maakt precies één conversatie aan'
  );

  -- Verandert het e-mailadres van het account, dan volgt het profiel mee.
  update auth.users set email = 'gewijzigd@rls-test.invalid' where id = v_nieuw;

  perform tests.expect(
    (select email from profiles where id = v_nieuw)
      = 'gewijzigd@rls-test.invalid',
    'een gewijzigd e-mailadres wordt doorgezet naar het profiel'
  );

  -- De nieuwe klant begint met een schone lei en ziet niets van anderen.
  perform tests.act_as(v_nieuw);

  perform tests.expect(
    tests.visible_count('select 1 from profiles') = 1
    and tests.visible_count('select 1 from enrollments') = 0
    and tests.visible_count('select 1 from messages') = 0
    and tests.visible_count('select 1 from requests') = 0,
    'een nieuwe klant ziet uitsluitend het eigen, lege dossier'
  );

  perform tests.act_as_owner();
end;
$$;
