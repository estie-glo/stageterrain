-- =====================================================================
-- StageTerrain — schéma de la base Supabase
-- À coller dans Supabase > SQL Editor > New query, puis "Run".
-- =====================================================================

create table if not exists public.entretiens (
  id                 uuid primary key default gen_random_uuid(),
  client_id          text not null unique,              -- identifiant créé sur le téléphone (anti-doublon hors ligne)
  created_at         timestamptz not null default now(),
  enqueteur_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  enqueteur_nom      text,

  entreprise_nom     text not null check (char_length(entreprise_nom) between 1 and 200),
  secteur            text not null,
  ville              text,
  quartier           text,
  contact_nom        text,
  contact_poste      text,
  contact_tel        text,

  besoin_stagiaires  text not null check (besoin_stagiaires in ('oui', 'peut_etre', 'non')),
  filieres           text[] not null default '{}',
  nombre_stagiaires  integer check (nombre_stagiaires between 0 and 500),
  periode            text,

  services_proposes  text[] not null default '{}',
  interet            text not null check (interet in ('interesse', 'a_rappeler', 'pas_interesse')),
  notes              text
);

create index if not exists entretiens_created_at_idx on public.entretiens (created_at desc);
create index if not exists entretiens_enqueteur_idx on public.entretiens (enqueteur_id);

-- ---------------------------------------------------------------------
-- Sécurité (Row Level Security)
--   * tout enquêteur connecté voit tous les entretiens (tableau de bord commun)
--   * chacun ne crée, modifie ou supprime que ses propres entretiens
-- ---------------------------------------------------------------------
alter table public.entretiens enable row level security;

drop policy if exists "lecture enqueteurs connectes" on public.entretiens;
create policy "lecture enqueteurs connectes" on public.entretiens
  for select to authenticated using (true);

drop policy if exists "creation de ses entretiens" on public.entretiens;
create policy "creation de ses entretiens" on public.entretiens
  for insert to authenticated with check (enqueteur_id = auth.uid());

drop policy if exists "modification de ses entretiens" on public.entretiens;
create policy "modification de ses entretiens" on public.entretiens
  for update to authenticated using (enqueteur_id = auth.uid()) with check (enqueteur_id = auth.uid());

drop policy if exists "suppression de ses entretiens" on public.entretiens;
create policy "suppression de ses entretiens" on public.entretiens
  for delete to authenticated using (enqueteur_id = auth.uid());
