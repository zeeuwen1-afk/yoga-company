-- =============================================================================
-- YogaCompany — bestellingen en Mollie (bouwprompt §6, §7.6)
--
-- Vervangt de Stripe-koppeling door Mollie en zet de betaaladministratie in
-- `orders` en `order_items`, zoals §6 voorschrijft.
--
-- Waarom een aparte bestelling en niet de betaling op de inschrijving
-- ----------------------------------------------------------------------
-- Tot nu toe hing de betaalreferentie aan `enrollments`. Dat werkt zolang één
-- betaling precies één inschrijving is, maar §7.6 vraagt straks ook om een
-- lesabonnement (maandelijkse incasso, geen inschrijving) en om betalen in
-- termijnen (drie betalingen, één inschrijving). Beide passen niet op een
-- inschrijving. Een bestelling met regels wél.
--
-- De inschrijving blijft het toegangsrecht op het lesmateriaal; de bestelling
-- is de financiële kant. Ze verwijzen naar elkaar, maar leven apart: bij een
-- AVG-verwijdering blijven de bestellingen staan voor de boekhouding terwijl
-- het profiel wordt geanonimiseerd (§8.4).
--
-- Er is geen bestaande betaaldata om over te zetten: er is nog nooit een
-- betaling gedaan. De Stripe-kolommen kunnen daarom gewoon weg.
-- =============================================================================

create type order_status as enum (
  'concept',
  'open',
  'paid',
  'canceled',
  'refunded'
);

-- -----------------------------------------------------------------------------
-- 1. Bestellingen
-- -----------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete restrict,
  status order_status not null default 'concept',
  amount_cents int not null,
  currency text not null default 'eur',
  -- Wat de klant terugziet op zijn rekeningafschrift.
  description text not null,
  -- Mollie is de bron van de betaalgegevens; wij bewaren alleen deze
  -- verwijzing, het bedrag en de status. Nooit kaart- of rekeninggegevens.
  mollie_payment_id text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_bedrag_niet_negatief check (amount_cents >= 0)
);

comment on table orders is
  'Bestellingen en hun betaalstatus. Fiscale bewaarplicht: blijft na een AVG-verwijdering staan, losgekoppeld van de persoon (§8.4).';

-- `on delete restrict` hierboven is bewust: een profiel met bestellingen mag
-- niet zomaar verdwijnen. De AVG-route anonimiseert het profiel en laat de
-- bestellingen intact.

create index orders_profile_idx on orders (profile_id, created_at desc);
create index orders_status_idx on orders (status, created_at desc);

-- De webhook van Mollie komt vaker binnen dan één keer. Deze unieke index is
-- wat idempotentie afdwingt: dezelfde betaling kan nooit twee bestellingen
-- opleveren.
create unique index orders_mollie_payment_idx on orders (mollie_payment_id)
  where mollie_payment_id is not null;

create trigger orders_touch_updated_at
  before update on orders
  for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Bestelregels
-- -----------------------------------------------------------------------------
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  -- Null bij een regel die niet op een opleiding slaat, bijvoorbeeld een
  -- losse leskaart. `on delete set null` zodat het verwijderen van een
  -- opleiding de boekhouding niet meesleept.
  course_id uuid references courses (id) on delete set null,
  -- De omschrijving wordt overgenomen op het moment van bestellen en verandert
  -- daarna niet meer. Wijzigt de titel van een opleiding later, dan blijft op
  -- de bestelling staan wat de klant destijds kocht.
  description text not null,
  amount_cents int not null,
  quantity int not null default 1,
  constraint order_items_aantal_positief check (quantity > 0),
  constraint order_items_bedrag_niet_negatief check (amount_cents >= 0)
);

create index order_items_order_idx on order_items (order_id);
create index order_items_course_idx on order_items (course_id);

-- -----------------------------------------------------------------------------
-- 3. De inschrijving wijst naar de bestelling die hem betaalde
-- -----------------------------------------------------------------------------
alter table enrollments
  add column order_id uuid references orders (id) on delete set null;

create index enrollments_order_idx on enrollments (order_id);

-- -----------------------------------------------------------------------------
-- 4. Stripe eruit
-- -----------------------------------------------------------------------------
drop index if exists enrollments_stripe_session_idx;
alter table enrollments drop column stripe_checkout_session_id;
alter table courses drop column stripe_price_id;

-- -----------------------------------------------------------------------------
-- 5. Row Level Security
--
-- Bestellingen worden uitsluitend server-side aangemaakt en bijgewerkt: door de
-- inschrijfactie en door de webhook, allebei met de service-role. De klant mag
-- ze alleen inzien. Zou een klant zelf een bestelling mogen aanmaken, dan kon
-- hij het bedrag bepalen.
-- -----------------------------------------------------------------------------
alter table orders enable row level security;
alter table order_items enable row level security;

revoke all on orders from anon, authenticated;
grant select on orders to authenticated;

revoke all on order_items from anon, authenticated;
grant select on order_items to authenticated;

create policy "bestelling: eigen bestellingen lezen"
  on orders for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "bestelling: admin doet alles"
  on orders for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "bestelregel: bij een eigen bestelling lezen"
  on order_items for select to authenticated
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.profile_id = (select auth.uid())
    )
  );

create policy "bestelregel: admin doet alles"
  on order_items for all to authenticated
  using (is_admin()) with check (is_admin());

-- De beheerder muteert bestellingen wél rechtstreeks, voor terugbetalingen en
-- correcties. RLS beperkt dat tot admins.
grant insert, update, delete on orders to authenticated;
grant insert, update, delete on order_items to authenticated;

-- -----------------------------------------------------------------------------
-- 6. AVG: bestellingen loskoppelen in plaats van verwijderen
--
-- `anonimiseer_profiel` liet bestellingen tot nu toe buiten beschouwing omdat
-- ze niet bestonden. Nu wel: ze moeten blijven staan voor de fiscale
-- bewaarplicht, maar zonder herleidbare omschrijving.
-- -----------------------------------------------------------------------------
create or replace function anonimiseer_profiel(p_profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan een profiel anonimiseren'
      using errcode = 'insufficient_privilege';
  end if;

  delete from messages
   where conversation_id in (select id from conversations where profile_id = p_profile_id);
  delete from conversations where profile_id = p_profile_id;
  delete from requests where profile_id = p_profile_id;
  delete from crm_notes where profile_id = p_profile_id;
  delete from progress where profile_id = p_profile_id;

  -- Boekingen zijn gedrag, geen administratie: die mogen weg.
  delete from bookings where profile_id = p_profile_id;

  -- Bestellingen blijven staan voor de boekhouding. De omschrijving kan een
  -- naam bevatten en gaat er daarom af; bedrag, datum en status blijven.
  update orders
     set description = 'Verwijderde klant'
   where profile_id = p_profile_id;

  update profiles
     set first_name = 'Verwijderde',
         last_name = 'klant',
         email = 'verwijderd+' || p_profile_id || '@yogacompanie.invalid',
         phone = null,
         marketing_consent_at = null,
         deleted_at = coalesce(deleted_at, now())
   where id = p_profile_id;
end;
$$;

revoke execute on function anonimiseer_profiel(uuid) from anon, public;
grant execute on function anonimiseer_profiel(uuid) to authenticated;
