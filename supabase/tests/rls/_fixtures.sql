-- =============================================================================
-- Testgegevens: twee klanten die niets van elkaar mogen zien, en één admin.
--
-- Vaste UUID's zodat de tests er rechtstreeks naar kunnen verwijzen.
--   klant A  11111111-1111-1111-1111-111111111111
--   klant B  22222222-2222-2222-2222-222222222222
--   admin    33333333-3333-3333-3333-333333333333
-- =============================================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_user_meta_data
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'klant-a@rls-test.invalid', 'x',
    now(), now(), now(),
    '{"first_name":"Klant","last_name":"A"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'klant-b@rls-test.invalid', 'x',
    now(), now(), now(),
    '{"first_name":"Klant","last_name":"B"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated', 'admin@rls-test.invalid', 'x',
    now(), now(), now(),
    '{"first_name":"Beheerder","last_name":"Test"}'::jsonb
  );

-- De trigger heeft zojuist profielen en conversaties aangemaakt; alleen de
-- adminrol moet nog worden gezet.
update profiles
set role = 'admin'
where id = '33333333-3333-3333-3333-333333333333';

-- Aanbod: één betaalde opleiding met content, en één inactieve.
insert into courses (
  id, type, title, slug, summary, description, price_cents, is_active,
  has_digital_content
)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001', 'opleiding',
    'Testopleiding', 'testopleiding', 'Samenvatting', 'Beschrijving',
    295000, true, true
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002', 'training',
    'Verborgen training', 'verborgen-training', 'Samenvatting',
    'Beschrijving', 29500, false, false
  );

insert into course_modules (id, course_id, title)
values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Module 1'
);

insert into lessons (id, module_id, title)
values (
  'cccccccc-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'Les 1'
);

insert into content_items (id, lesson_id, kind, title, storage_path, is_preview)
values
  (
    'dddddddd-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'video', 'Betaalde video', 'testopleiding/les1.mp4', false
  ),
  (
    'dddddddd-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000001',
    'video', 'Proefles', 'testopleiding/proef.mp4', true
  );

-- Klant A heeft betaald, klant B niet.
insert into enrollments (id, profile_id, course_id, status, paid_at)
values (
  'eeeeeeee-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'betaald', now()
);

insert into enrollments (id, profile_id, course_id, status)
values (
  'eeeeeeee-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'in_afwachting'
);

-- Voortgang van klant A.
insert into progress (profile_id, content_item_id, last_position_seconds)
values (
  '11111111-1111-1111-1111-111111111111',
  'dddddddd-0000-0000-0000-000000000001',
  42
);

-- Een bericht in de conversatie van klant A.
insert into messages (conversation_id, sender_id, body)
select c.id, '11111111-1111-1111-1111-111111111111', 'Bericht van klant A'
from conversations c
where c.profile_id = '11111111-1111-1111-1111-111111111111';

-- Een aanvraag van klant A.
insert into requests (id, profile_id, kind, body)
values (
  'ffffffff-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'vraag', 'Vraag van klant A'
);

-- Een CMS-blok met een concept dat niet mag uitlekken.
insert into content_blocks (page_key, block_key, kind, value, draft_value)
values (
  'home', 'hero_titel', 'text',
  '{"text":"Gepubliceerde titel"}'::jsonb,
  '{"text":"GEHEIM CONCEPT"}'::jsonb
);

-- Een CRM-notitie en een auditregel: beide uitsluitend voor admins.
insert into crm_notes (profile_id, author_id, body)
values (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Interne notitie'
);

insert into audit_log (actor_id, action, entity, entity_id)
values (
  '33333333-3333-3333-3333-333333333333',
  'test', 'profiles', '11111111-1111-1111-1111-111111111111'
);

insert into contact_messages (name, email, body)
values ('Bezoeker', 'bezoeker@rls-test.invalid', 'Hallo');
