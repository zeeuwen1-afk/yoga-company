-- =============================================================================
-- YogaCompany — storage buckets (BOUWPROMPT §6)
--
-- `protected-content` is privé. Bestanden daaruit worden nooit rechtstreeks
-- geserveerd: een server-route controleert eerst de inschrijving en geeft dan
-- een signed URL van 60 minuten af (§17.4).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media', 'public-media', true, 20971520),          -- 20 MB, beelden
  ('protected-content', 'protected-content', false, 2147483648), -- 2 GB, video
  ('avatars', 'avatars', false, 5242880)                     -- 5 MB
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- public-media — iedereen leest, alleen admin beheert
-- -----------------------------------------------------------------------------
create policy "media: openbaar leesbaar"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');

create policy "media: admin beheert"
  on storage.objects for all to authenticated
  using (bucket_id = 'public-media' and is_admin())
  with check (bucket_id = 'public-media' and is_admin());

-- -----------------------------------------------------------------------------
-- protected-content — uitsluitend admin via de client; klanten krijgen
-- toegang via signed URLs die de server na een entitlement-controle afgeeft.
-- -----------------------------------------------------------------------------
create policy "content: admin beheert"
  on storage.objects for all to authenticated
  using (bucket_id = 'protected-content' and is_admin())
  with check (bucket_id = 'protected-content' and is_admin());

-- -----------------------------------------------------------------------------
-- avatars — eigenaar beheert de eigen map, admin mag meekijken
--
-- Padconventie: <profile_id>/<bestandsnaam>
-- -----------------------------------------------------------------------------
create policy "avatar: eigenaar beheert"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatar: admin leest"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and is_admin());
