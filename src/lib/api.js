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
  const { data } = await supabase.auth.getSession()
  return toUser(data.session?.user)
}

function toUser(u) {
  if (!u) return null
  return { id: u.id, email: u.email, nom: u.user_metadata?.nom || u.email }
}

export function onAuthChange(cb) {
  if (isDemo) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)))
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password, nomDemo) {
  if (isDemo) {
    const user = { id: 'demo-' + (nomDemo || 'enqueteur').toLowerCase().replace(/\s+/g, '-'), nom: nomDemo || 'Enquêteur démo' }
    save(K_DEMO_USER, user)
    return user
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(traduire(error.message))
  return toUser(data.user)
}

export async function signUp(nom, email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nom } } })
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
export async function listEntretiens() {
  if (isDemo) return load(K_DEMO_DATA, [])
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
  const entry = {
    ...row,
    client_id: row.client_id || newId(),
    enqueteur_id: user.id,
    enqueteur_nom: user.nom,
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
  // eslint-disable-next-line no-unused-vars
  const { enqueteur_id, ...rest } = entry
  const { error } = await supabase.from(TABLE).upsert(rest, { onConflict: 'client_id', ignoreDuplicates: true })
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
