-- =============================================================================
-- Een portfolioblok op de docentpagina
--
-- Dezelfde behoefte als de portfoliopagina van de studio, maar dan voor wie
-- er lesgeeft: een loopbaan op een rij, voor wie je wil inhuren. De lijst met
-- toegestane bloktypen staat als check-constraint op de tabel; Postgres kan
-- een constraint niet uitbreiden, dus hij gaat eraf en komt terug met het
-- nieuwe type erbij.
-- =============================================================================

alter table docent_blokken drop constraint docent_blokken_type;

alter table docent_blokken add constraint docent_blokken_type check (
  type in (
    'kop_portret', 'over_mij', 'tekst', 'beeld', 'fotoreeks', 'citaat',
    'video', 'vraag_antwoord', 'contact', 'portfolio', 'mijn_lessen',
    'wat_het_kost'
  )
);
