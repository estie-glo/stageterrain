// Couche d'accès aux données.
// - Mode normal : Supabase (base partagée par toute la classe).
// - Mode démo : si les variables VITE_SUPABASE_* ne sont pas définies,
//   tout est stocké dans le navigateur, pour tester sans rien configurer.
// - Hors ligne : un entretien qui ne peut pas être envoyé est mis en file
//   d'attente et renvoyé automatiquement au retour du réseau.
import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemo = !URL || !KEY
export const supabase = isDemo ? null : createClient(URL, KEY)

const TABLE = 'entretiens'
const K_QUEUE = 'st_queue'
const K_CACHE = 'st_cache'
const K_DEMO_USER = 'st_demo_user'
const K_DEMO_DATA = 'st_demo_data'
const K_USER = 'st_user' // dernier utilisateur connecté, pour ouvrir l'appli sans réseau
const K_REF = 'st_ref' // lien d'invitation d'un étudiant (?ref=...&n=...)

// ---------- stockage local tolérant aux erreurs ----------
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* stockage plein ou bloqué : on continue sans */
  }
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ---------- authentification ----------
export async function getUser() {
  if (isDemo) return load(K_DEMO_USER, null)
  try {
    const { data } = await supabase.auth.getSession()
    const user = toUser(data.session?.user)
    if (user) {
      save(K_USER, user)
      return user
    }
  } catch {
    /* pas de réseau : on tente l'utilisateur gardé ci-dessous */
  }
  // Sans réseau, Supabase ne peut pas renouveler la connexion (elle expire au bout d'1 h) :
  // on garde la personne connectée grâce au dernier utilisateur mémorisé.
  // La vraie session reste dans le navigateur et sera renouvelée au retour du réseau.
  return navigator.onLine ? null : load(K_USER, null)
}

function toUser(u) {
  if (!u) return null
  const m = u.user_metadata || {}
  return {
    id: u.id,
    email: u.email,
    nom: m.nom || u.email,
    // deux profils : l'étudiant enquêteur, ou le responsable d'entreprise invité par un étudiant
    role: m.role === 'responsable' ? 'responsable' : 'etudiant',
    ref: m.ref || null, // étudiant qui a invité le responsable
    ref_nom: m.ref_nom || null,
  }
}

// ---------- lien d'invitation ----------
// Un étudiant partage https://.../?ref=<son id>&n=<son nom>.
// Le responsable qui ouvre ce lien crée un compte « responsable » rattaché à cet étudiant.
export function lireInvitation() {
  try {
    const q = new URLSearchParams(window.location.search)
    const ref = q.get('ref')
    if (ref) {
      const inv = { ref, ref_nom: q.get('n') || 'un étudiant' }
      save(K_REF, inv)
      window.history.replaceState(null, '', window.location.pathname)
      return inv
    }
  } catch { /* ignore */ }
  return load(K_REF, null)
}

export function oublierInvitation() {
  try { localStorage.removeItem(K_REF) } catch { /* ignore */ }
}

export function lienInvitation(user) {
  return `${window.location.origin}/?ref=${encodeURIComponent(user.id)}&n=${encodeURIComponent(user.nom)}`
}

export function onAuthChange(cb) {
  if (isDemo) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    const user = toUser(session?.user)
    if (user) {
      save(K_USER, user)
      cb(user)
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem(K_USER)
      cb(null)
    } else if (!navigator.onLine && load(K_USER, null)) {
      cb(load(K_USER, null)) // hors ligne : on reste connecté
    } else {
      cb(null)
    }
  })
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password, nomDemo, extra = {}) {
  if (isDemo) {
    const resp = extra.role === 'responsable'
    const slug = (nomDemo || 'enqueteur').toLowerCase().replace(/\s+/g, '-')
    const user = { id: (resp ? 'resp-' : 'demo-') + slug, nom: nomDemo || 'Enquêteur démo', role: resp ? 'responsable' : 'etudiant', ref: extra.ref || null, ref_nom: extra.ref_nom || null }
    save(K_DEMO_USER, user)
    return user
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(traduire(error.message))
  save(K_USER, toUser(data.user))
  return toUser(data.user)
}

export async function signUp(nom, email, password, extra = {}) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nom, ...extra } } })
  if (error) throw new Error(traduire(error.message))
  if (!data.session) {
    throw new Error('Compte créé. Confirmez votre adresse e-mail (lien reçu par mail), puis connectez-vous.')
  }
  return toUser(data.user)
}

export async function signOut() {
  if (isDemo) {
    localStorage.removeItem(K_DEMO_USER)
    return
  }
  localStorage.removeItem(K_USER)
  await supabase.auth.signOut()
}

function traduire(msg) {
  if (/invalid login/i.test(msg)) return 'E-mail ou mot de passe incorrect.'
  if (/already registered/i.test(msg)) return 'Un compte existe déjà avec cet e-mail.'
  if (/at least 6/i.test(msg)) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (/fetch|network/i.test(msg)) return 'Pas de connexion internet.'
  if (/signups not allowed/i.test(msg)) return 'Les inscriptions sont fermées. Demandez un compte au responsable.'
  return msg
}

// ---------- entretiens ----------
export async function listEntretiens(user) {
  if (isDemo) {
    const all = load(K_DEMO_DATA, [])
    // en démo on reproduit la règle de sécurité : un responsable ne voit que sa propre fiche
    return user?.role === 'responsable' ? all.filter((r) => r.responsable_id === user.id) : all
  }
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (error) throw error
    save(K_CACHE, data)
    return data
  } catch {
    return load(K_CACHE, []) // hors ligne : dernière liste connue
  }
}

export async function createEntretien(user, row) {
  const resp = user.role === 'responsable'
  const entry = {
    ...row,
    client_id: row.client_id || newId(),
    // une fiche remplie par un responsable compte dans les 100 de l'étudiant qui l'a invité
    enqueteur_id: resp ? user.ref : user.id,
    enqueteur_nom: resp ? user.ref_nom : user.nom,
    responsable_id: resp ? user.id : null,
    created_at: new Date().toISOString(),
  }
  if (isDemo) {
    const all = load(K_DEMO_DATA, [])
    save(K_DEMO_DATA, [{ ...entry, id: entry.client_id }, ...all])
    return { status: 'saved' }
  }
  if (!navigator.onLine) {
    enqueue(entry)
    return { status: 'queued' }
  }
  try {
    await push(entry)
    return { status: 'saved' }
  } catch (e) {
    if (isNetworkError(e)) {
      enqueue(entry)
      return { status: 'queued' }
    }
    throw e
  }
}

export async function updateEntretien(id, patch) {
  if (isDemo) {
    save(K_DEMO_DATA, load(K_DEMO_DATA, []).map((r) => (r.id === id ? { ...r, ...patch } : r)))
    return
  }
  const { error } = await supabase.from(TABLE).update(patch).eq('id', id)
  if (error) throw new Error(isNetworkError(error) ? 'Pas de connexion : réessayez plus tard.' : error.message)
}

export async function deleteEntretien(id) {
  if (isDemo) {
    save(K_DEMO_DATA, load(K_DEMO_DATA, []).filter((r) => r.id !== id))
    return
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function push(entry) {
  // upsert sur client_id : un renvoi après coupure ne crée jamais de doublon
  // Fiche d'étudiant : enqueteur_id est rempli par la base (auth.uid()), on ne l'envoie pas.
  // Fiche de responsable : on envoie enqueteur_id (l'étudiant qui a invité) et responsable_id.
  let envoi = entry
  if (!entry.responsable_id) {
    // eslint-disable-next-line no-unused-vars
    const { enqueteur_id, responsable_id, ...rest } = entry
    envoi = rest
  }
  const { error } = await supabase.from(TABLE).upsert(envoi, { onConflict: 'client_id', ignoreDuplicates: true })
  if (error) throw error
}

function isNetworkError(e) {
  return !navigator.onLine || /fetch|network|timeout/i.test(e?.message || '')
}

// ---------- file d'attente hors ligne ----------
export const getQueue = () => load(K_QUEUE, [])

function enqueue(entry) {
  save(K_QUEUE, [...getQueue().filter((e) => e.client_id !== entry.client_id), entry])
}

export async function flushQueue() {
  if (isDemo || !navigator.onLine) return 0
  const queue = getQueue()
  let sent = 0
  for (const entry of queue) {
    try {
      await push(entry)
      sent++
      save(K_QUEUE, getQueue().filter((e) => e.client_id !== entry.client_id))
    } catch {
      break // on réessaiera au prochain retour du réseau
    }
  }
  return sent
}

// ---------- outils ----------
export function normaliser(nom) {
  return (nom || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}
