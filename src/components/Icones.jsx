const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' }

export const IcAccueil = () => (
  <svg {...base}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
)
export const IcListe = () => (
  <svg {...base}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>
)
export const IcPlus = () => (
  <svg {...base} strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
)
export const IcIdees = () => (
  <svg {...base}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>
)
export const IcProfil = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
)
export const IcTelecharger = () => (
  <svg {...base} width="20" height="20"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
)
export const IcSync = () => (
  <svg {...base} width="20" height="20"><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" /></svg>
)
export const IcCheck = () => (
  <svg {...base} width="14" height="14" strokeWidth="3"><path d="M5 12l5 5 9-10" /></svg>
)
