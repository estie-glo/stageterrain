-- =====================================================================
-- StageTerrain v3.0 — fiche officielle de l'école de terrain (19 au 25 octobre 2026)
-- « Fiche détaillée de collecte des données sur le marché de l'emploi,
--   les besoins en recrutement et les profils professionnels recherchés »
-- À exécuter UNE fois dans Supabase > SQL Editor (après la migration v2).
-- =====================================================================

-- Toutes les réponses de la fiche (rubriques I à XI, postes, métiers, compétences…)
alter table public.entretiens add column if not exists reponses jsonb;

-- La base recharge sa liste de colonnes tout de suite
notify pgrst, 'reload schema';
