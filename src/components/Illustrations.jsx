// Small hand-built line-art illustrations (no external assets, no emoji)
// used to soften empty states and alert banners across the app.

export function IllustrationAllClear({ className = 'w-32 h-32' }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className}>
      <circle cx="80" cy="80" r="62" stroke="#CFEBE1" strokeWidth="2" />
      <circle cx="80" cy="80" r="40" fill="#EAF6F2" />
      <path d="M62 82l12 12 24-26" stroke="#1F8A70" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="46" r="3" fill="#E2A73E" />
      <circle cx="128" cy="118" r="3" fill="#E2A73E" />
      <circle cx="130" cy="40" r="2" fill="#1F8A70" />
    </svg>
  )
}

export function IllustrationDueAlert({ className = 'w-28 h-28' }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className}>
      <rect x="30" y="34" width="100" height="92" rx="10" stroke="#F7E2B8" strokeWidth="2" />
      <rect x="30" y="34" width="100" height="24" rx="10" fill="#FCF3E3" />
      <line x1="46" y1="46" x2="70" y2="46" stroke="#CE8F22" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="76" x2="114" y2="76" stroke="#EFE7D4" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="90" x2="98" y2="90" stroke="#EFE7D4" strokeWidth="3" strokeLinecap="round" />
      <circle cx="112" cy="108" r="20" fill="#FCF3E3" stroke="#E2A73E" strokeWidth="2" />
      <line x1="112" y1="99" x2="112" y2="110" stroke="#CE8F22" strokeWidth="3" strokeLinecap="round" />
      <circle cx="112" cy="117" r="1.6" fill="#CE8F22" />
    </svg>
  )
}

export function IllustrationEmpty({ className = 'w-28 h-28' }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className}>
      <ellipse cx="80" cy="128" rx="46" ry="6" fill="#F1EFE6" />
      <rect x="46" y="52" width="68" height="64" rx="8" stroke="#E7E5DD" strokeWidth="2" fill="#FFFFFF" />
      <line x1="58" y1="70" x2="102" y2="70" stroke="#E7E5DD" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="84" x2="94" y2="84" stroke="#E7E5DD" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="98" x2="86" y2="98" stroke="#E7E5DD" strokeWidth="3" strokeLinecap="round" />
      <circle cx="112" cy="46" r="12" fill="#EAF6F2" stroke="#CFEBE1" strokeWidth="2" />
    </svg>
  )
}

export function IllustrationWelcome({ className = 'w-40 h-40' }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="86" fill="#F4F2EA" />
      <rect x="60" y="70" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#E7E5DD" strokeWidth="2" />
      <line x1="72" y1="88" x2="112" y2="88" stroke="#1F8A70" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="100" x2="128" y2="100" stroke="#E7E5DD" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="112" x2="120" y2="112" stroke="#E7E5DD" strokeWidth="3" strokeLinecap="round" />
      <circle cx="132" cy="66" r="14" fill="#FCF3E3" stroke="#E2A73E" strokeWidth="2" />
      <path d="M126 66l4 4 8-9" stroke="#CE8F22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
