-- =============================================================================
-- Yoga Companie — Row Level Security (BOUWPROMPT §2.1 en §6)
--
-- Klantscheiding wordt hier afgedwongen, op databaseniveau. Applicatiecode is
-- nooit de enige verdediging: ook een fout in een query mag er niet toe leiden
-- dat een klant data van een andere klant ziet of muteert.
--
-- Uitgangspunt: elke tabel krijgt RLS aan. Een tabel zonder passende policy
-- weigert standaard alles behalve voor de service-role (server-side).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Hulpfuncties
--
-- Alle drie zijn `security definer`: ze draaien met de rechten van de eigenaar
-- en omzeilen daarmee RLS. Dat is nodig om oneindige recursie te voorkomen
-- (een policy op profiles die profiles bevraagt). `search_path` staat vast om
-- te voorkomen dat een aanroeper de functie naar eigen tabellen omleidt.
-- -----------------------------------------------------------------------------

create or replace function is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
      and deleted_at is null
  );
$$;

comment on function is_admin is
  'True wanneer de huidige sessie een actieve admin is.';

-- Toegang tot digitale content volgt uit een betaalde inschrijving (§6, §12).
-- Een afgeronde opleiding behoudt toegang tot het lesmateriaal.
create or replace function has_course_access(p_course_id uuid) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from enrollments
    where profile_id = auth.uid()
      and course_id = p_course_id
      and status in ('betaald', 'afgerond')
  );
$$;

comment on function has_course_access is
  'True wanneer de huidige gebruiker een betaalde inschrijving heeft.';

create or replace function course_id_for_lesson(p_lesson_id uuid) returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.course_id
  from lessons l
  join course_modules m on m.id = l.module_id
  where l.id = p_lesson_id;
$$;

grant execute on function is_admin to anon, authenticated;
grant execute on function has_course_access to authenticated;
grant execute on function course_id_for_lesson to anon, authenticated;

-- -----------------------------------------------------------------------------
-- RLS aanzetten op ELKE tabel
-- -----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table crm_notes enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table content_items enable row level security;
alter table enrollments enable row level security;
alter table progress enable row level security;
alter table requests enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table content_blocks enable row level security;
alter table contact_messages enable row level security;
alter table mailings enable row level security;
alter table social_posts enable row level security;
alter table audit_log enable row level security;

-- Bewust GEEN `force row level security`. Dat zou ook de tabeleigenaar aan de
-- policies onderwerpen, waardoor `is_admin()` — die zelf profiles leest —
-- zichzelf via de profiles-policy opnieuw zou aanroepen en oneindig recurseert.
-- De beschermde partijen zijn `anon` en `authenticated`; die zijn nooit
-- eigenaar. De service-role blijft server-side en valt onder BOUWPROMPT §17.1.

-- -----------------------------------------------------------------------------
-- 1. profiles — klant leest en bewerkt uitsluitend de eigen rij
-- -----------------------------------------------------------------------------
create policy "profiel: eigen rij lezen"
  on profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiel: eigen rij bijwerken"
  on profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiel: admin doet alles"
  on profiles for all to authenticated
  using (is_admin())
  with check (is_admin());

-- RLS werkt per rij, niet per kolom. Deze trigger bewaakt daarom dat een klant
-- de eigen rol of soft-delete niet kan aanpassen (BOUWPROMPT §6, tabel RLS).
create or replace function guard_profile_columns() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admins mogen alles. Ontbreekt er een gebruikerssessie, dan komt de
  -- wijziging server-side binnen via de service-role (uitnodigen van een
  -- beheerder, AVG-verwijdering) en laten we hem ook door. Een klant of
  -- anonieme bezoeker heeft altijd wél een sessie of komt door RLS niet eens
  -- tot hier, dus dit opent geen deur.
  if is_admin() or auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Rol wijzigen is niet toegestaan'
      using errcode = 'insufficient_privilege';
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    raise exception 'Verwijderstatus wijzigen is niet toegestaan'
      using errcode = 'insufficient_privilege';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Profiel-id wijzigen is niet toegestaan'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_columns
  before update on profiles
  for each row execute function guard_profile_columns();

-- -----------------------------------------------------------------------------
-- 2. crm_notes — uitsluitend admin
-- -----------------------------------------------------------------------------
revoke all on crm_notes from anon, authenticated;
grant select, insert, update, delete on crm_notes to authenticated;

create policy "notities: admin doet alles"
  on crm_notes for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 3. courses, course_modules, lessons — publiek leesbaar indien actief
-- -----------------------------------------------------------------------------
create policy "aanbod: actief aanbod is openbaar"
  on courses for select to anon, authenticated
  using (is_active);

create policy "aanbod: admin doet alles"
  on courses for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "modules: bij actief aanbod openbaar"
  on course_modules for select to anon, authenticated
  using (
    exists (
      select 1 from courses c
      where c.id = course_modules.course_id and c.is_active
    )
  );

create policy "modules: admin doet alles"
  on course_modules for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "lessen: bij actief aanbod openbaar"
  on lessons for select to anon, authenticated
  using (
    exists (
      select 1
      from course_modules m
      join courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.is_active
    )
  );

create policy "lessen: admin doet alles"
  on lessons for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 4. content_items — alleen na betaling, of als proefles
-- -----------------------------------------------------------------------------
create policy "content: proeflessen zijn openbaar"
  on content_items for select to anon, authenticated
  using (is_preview);

create policy "content: toegang na betaalde inschrijving"
  on content_items for select to authenticated
  using (has_course_access(course_id_for_lesson(lesson_id)));

create policy "content: admin doet alles"
  on content_items for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 5. enrollments — eigen inschrijvingen; nieuwe altijd 'in_afwachting'
--
-- De klant mag een inschrijving aanmaken, maar nooit de status bepalen: die
-- volgt uit de betaling en wordt server-side door de Stripe-webhook gezet (§9).
-- -----------------------------------------------------------------------------
create policy "inschrijving: eigen rijen lezen"
  on enrollments for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "inschrijving: eigen rij aanmaken"
  on enrollments for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and status = 'in_afwachting'
    and paid_at is null
  );

create policy "inschrijving: admin doet alles"
  on enrollments for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 6. progress — eigen voortgang; admin leest mee voor monitoring (§12)
-- -----------------------------------------------------------------------------
create policy "voortgang: eigen rijen lezen"
  on progress for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "voortgang: eigen rij aanmaken"
  on progress for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "voortgang: eigen rij bijwerken"
  on progress for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "voortgang: admin leest mee"
  on progress for select to authenticated
  using (is_admin());

-- -----------------------------------------------------------------------------
-- 7. requests — eigen aanvragen indienen en volgen
-- -----------------------------------------------------------------------------
create policy "aanvraag: eigen rijen lezen"
  on requests for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "aanvraag: eigen rij aanmaken"
  on requests for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and status = 'open'
    and handled_by is null
  );

create policy "aanvraag: admin doet alles"
  on requests for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 8. conversations en messages — de beveiligde dialoog
-- -----------------------------------------------------------------------------
create policy "gesprek: eigen conversatie lezen"
  on conversations for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "gesprek: admin doet alles"
  on conversations for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "bericht: lezen binnen eigen conversatie"
  on messages for select to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.profile_id = (select auth.uid())
    )
  );

-- Een klant schrijft uitsluitend in de eigen conversatie en uitsluitend
-- op eigen naam; afzender vervalsen is daarmee onmogelijk.
create policy "bericht: schrijven in eigen conversatie"
  on messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.profile_id = (select auth.uid())
    )
  );

create policy "bericht: admin doet alles"
  on messages for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 9. content_blocks — publiek leest uitsluitend gepubliceerde inhoud
--
-- Concepten (`draft_value`) mogen niet uitlekken. Omdat RLS per rij werkt en
-- niet per kolom, leest het publiek via een view die alleen `value` toont; de
-- tabel zelf is uitsluitend voor admins toegankelijk.
-- -----------------------------------------------------------------------------
create policy "blokken: admin doet alles"
  on content_blocks for all to authenticated
  using (is_admin())
  with check (is_admin());

revoke all on content_blocks from anon, authenticated;
grant select, insert, update, delete on content_blocks to authenticated;

create view content_blocks_public
with (security_invoker = false) as
select page_key, block_key, kind, value, updated_at
from content_blocks;

comment on view content_blocks_public is
  'Gepubliceerde CMS-inhoud voor de publieke site. Bevat nooit concepten.';

grant select on content_blocks_public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 10. contact_messages — iedereen mag insturen, alleen admin mag lezen
-- -----------------------------------------------------------------------------
revoke all on contact_messages from anon, authenticated;
grant insert on contact_messages to anon, authenticated;
grant select, delete on contact_messages to authenticated;

create policy "contact: iedereen mag insturen"
  on contact_messages for insert to anon, authenticated
  with check (true);

create policy "contact: admin leest"
  on contact_messages for select to authenticated
  using (is_admin());

create policy "contact: admin verwijdert"
  on contact_messages for delete to authenticated
  using (is_admin());

-- -----------------------------------------------------------------------------
-- 11. mailings en social_posts — uitsluitend admin
-- -----------------------------------------------------------------------------
revoke all on mailings from anon, authenticated;
grant select, insert, update, delete on mailings to authenticated;

create policy "mailing: admin doet alles"
  on mailings for all to authenticated
  using (is_admin())
  with check (is_admin());

revoke all on social_posts from anon, authenticated;
grant select, insert, update, delete on social_posts to authenticated;

create policy "social: admin doet alles"
  on social_posts for all to authenticated
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- 12. audit_log — onveranderlijk: alleen lezen en toevoegen
-- -----------------------------------------------------------------------------
revoke all on audit_log from anon, authenticated;
grant select, insert on audit_log to authenticated;

create policy "audit: admin leest"
  on audit_log for select to authenticated
  using (is_admin());

create policy "audit: admin voegt toe"
  on audit_log for insert to authenticated
  with check (is_admin());
