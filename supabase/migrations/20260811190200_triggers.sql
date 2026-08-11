-- =============================================================================
-- Yoga Companie — triggers (BOUWPROMPT §7)
--
-- Bij registratie ontstaan automatisch een profielrij en een conversatie, zodat
-- de beveiligde dialoog vanaf het eerste moment bestaat en er nooit een
-- gebruiker zonder profiel in het systeem staat.
-- =============================================================================

create or replace function handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_name text;
  v_last_name text;
begin
  -- Naam komt uit de metadata die de registratie meestuurt. Ontbreekt die,
  -- dan vullen we een neutrale waarde: het profiel mag nooit ontbreken.
  v_first_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    'Onbekend'
  );
  v_last_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    'Onbekend'
  );

  insert into profiles (id, role, first_name, last_name, email)
  values (new.id, 'klant', v_first_name, v_last_name, new.email)
  on conflict (id) do nothing;

  insert into conversations (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Het e-mailadres in profiles volgt dat van het account, zodat het CRM en de
-- mailings nooit op een verouderd adres uitkomen.
create or replace function sync_profile_email() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function sync_profile_email();

-- Voortgang houdt zijn eigen tijdstempel bij (§11, "verder waar je gebleven was").
create or replace function touch_progress_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger progress_touch_updated_at
  before update on progress
  for each row execute function touch_progress_updated_at();

create or replace function touch_content_block_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger content_blocks_touch_updated_at
  before update on content_blocks
  for each row execute function touch_content_block_updated_at();
