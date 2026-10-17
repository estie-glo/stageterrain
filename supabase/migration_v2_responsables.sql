-- =====================================================================
-- StageTerrain v2.0 — les responsables d'entreprise remplissent leur fiche
-- À exécuter UNE fois dans Supabase > SQL Editor (sur une base déjà créée avec schema.sql)
-- =====================================================================

-- 1. Une fiche peut être remplie par le responsable de l'entreprise (un compte = une fiche)
alter table public.entretiens
  add column if not exists responsable_id uuid unique references auth.users (id) on delete set null;

-- 2. Rôle de la personne connectée : 'responsable' si elle s'est inscrite par le lien d'un étudiant
create or replace function public.est_etudiant() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'etudiant') <> 'responsable'
$$;

-- 3. Règles de sécurité
drop policy if exists "lecture" on public.entretiens;
drop policy if exists "lecture enqueteurs connectes" on public.entretiens;
create policy "lecture" on public.entretiens for select to authenticated
  using (public.est_etudiant() or responsable_id = auth.uid());

drop policy if exists "ajout" on public.entretiens;
drop policy if exists "creation de ses entretiens" on public.entretiens;
create policy "ajout" on public.entretiens for insert to authenticated
  with check (
    (public.est_etudiant() and enqueteur_id = auth.uid() and responsable_id is null)
    or (not public.est_etudiant() and responsable_id = auth.uid())
  );

drop policy if exists "modification" on public.entretiens;
drop policy if exists "modification de ses entretiens" on public.entretiens;
create policy "modification" on public.entretiens for update to authenticated
  using (enqueteur_id = auth.uid() or responsable_id = auth.uid())
  with check (enqueteur_id = auth.uid() or responsable_id = auth.uid());

drop policy if exists "suppression" on public.entretiens;
drop policy if exists "suppression de ses entretiens" on public.entretiens;
create policy "suppression" on public.entretiens for delete to authenticated
  using (enqueteur_id = auth.uid() or responsable_id = auth.uid());
