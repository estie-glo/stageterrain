# StageTerrain

Application web (au rendu mobile, installable sur téléphone) pour l'école de terrain de l'ESTLC Ambam :
interroger 100 entreprises sur leurs besoins en stagiaires et leur proposer des services adaptés.

- **Frontend** : React 19 + Vite, PWA (installable, interface disponible hors ligne)
- **Base de données et comptes** : Supabase (PostgreSQL + Auth, règles RLS)
- **Hébergement** : Vercel
- **Export** : fichier Excel généré dans le navigateur

Sans configuration Supabase, l'application démarre en **mode démo** (données gardées sur le téléphone).

---

## 1. Lancer en local

```bash
unzip stageterrain.zip && cd stageterrain
npm install
npm run dev
```

Ouvrir l'adresse affichée (ex. `http://localhost:5173`). Sur le téléphone, même Wi-Fi : utiliser l'adresse `Network`.

## 2. Créer la base Supabase

1. Créer un compte sur https://supabase.com puis **New project** (région la plus proche : Europe).
2. **SQL Editor → New query** : coller le contenu de `supabase/schema.sql`, puis **Run**.
3. **Authentication → Sign In / Providers → Email** : désactiver **Confirm email** (les camarades pourront se connecter tout de suite).
4. **Project Settings → API** : copier `Project URL` et la clé `anon` `public`.

Créer le fichier `.env.local` :

```bash
cp .env.example .env.local
nano .env.local
```

Relancer `npm run dev` : le bandeau « Mode démo » disparaît.

## 3. Déployer sur Vercel

### Option A — via GitHub (recommandée)

```bash
git init
git add .
git commit -m "StageTerrain v1"
git branch -M main
git remote add origin https://github.com/estie-glo/stageterrain.git
git push -u origin main
```

(Créer d'abord le dépôt vide `stageterrain` sur GitHub.)

Puis sur https://vercel.com → **Add New → Project** → importer `stageterrain` →
**Environment Variables** : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` → **Deploy**.

Chaque `git push` redéploie automatiquement.

### Option B — en ligne de commande

```bash
npm i -g vercel
vercel login
vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

## 4. Après le déploiement

- Partager le lien Vercel dans le groupe WhatsApp de la classe.
- Chaque étudiant crée son compte (nom, e-mail, mot de passe).
- Quand tout le monde est inscrit : Supabase → **Authentication → Sign In / Providers** → désactiver **Allow new users to sign up**.

## Structure

```
src/
  App.jsx              navigation (barre du bas) et état global
  lib/api.js           Supabase, mode démo, file d'attente hors ligne
  lib/constants.js     secteurs, filières, périodes, idées de services  ← à adapter
  lib/export.js        export Excel
  pages/               Connexion, Tableau, Entretiens, Nouveau, Fiche, Idees, Profil
public/                manifest, icônes, service worker
supabase/schema.sql    table + règles de sécurité
vercel.json            réécriture SPA
```
