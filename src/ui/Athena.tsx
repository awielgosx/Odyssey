// Athena as Mentor: a low-poly coach in a Corinthian helmet pushed up on her head.
// Drawn as faceted SVG polygons, so it costs nothing to render and stays crisp.

export type Mood = 'neutral' | 'pleased' | 'stern'

export function Athena({ mood = 'neutral', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const brow = mood === 'stern' ? { l: 'M43 55 L55 58', r: 'M65 58 L77 55' } : mood === 'pleased' ? { l: 'M43 55 L55 53', r: 'M65 53 L77 55' } : { l: 'M43 55 L55 55', r: 'M65 55 L77 55' }
  const mouth = mood === 'stern' ? 'M53 79 L67 79' : mood === 'pleased' ? 'M52 77 L60 81 L68 77' : 'M53 78 L60 80 L67 78'
  return (
    <svg className={`athena ${mood} ${className}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Athena, your coach, looking ${mood}`}>
      {/* robe with a meander hem */}
      <polygon points="18,120 30,96 50,90 70,90 90,96 102,120" fill="#b44d24" />
      <polygon points="30,96 50,90 60,104 40,108" fill="#9a3f1c" />
      <polygon points="90,96 70,90 60,104 80,108" fill="#c95d30" />
      <polygon points="26,112 94,112 98,120 22,120" fill="#1d1714" />
      <path d="M30 116 h6 v-3 h-3 M42 116 h6 v-3 h-3 M54 116 h6 v-3 h-3 M66 116 h6 v-3 h-3 M78 116 h6 v-3 h-3" stroke="#e2894f" strokeWidth="1.2" fill="none" />
      {/* neck */}
      <polygon points="52,82 68,82 70,94 50,94" fill="#c48a63" />
      <polygon points="52,82 60,86 50,94" fill="#b07652" />
      {/* hair at the sides */}
      <polygon points="36,52 44,46 42,86 33,80" fill="#3b2516" />
      <polygon points="84,52 76,46 78,86 87,80" fill="#4a2f1c" />
      {/* face */}
      <polygon points="42,50 78,50 80,68 72,84 60,88 48,84 40,68" fill="#d9a27a" />
      <polygon points="42,50 60,50 60,88 48,84 40,68" fill="#e3b08a" />
      <polygon points="60,64 66,74 60,76" fill="#c48a63" />
      <polygon points="40,68 48,84 50,72" fill="#cf9670" />
      <polygon points="80,68 72,84 70,72" fill="#c48a63" />
      {/* eyes */}
      <polygon points="45,61 50,59 55,61 50,63" fill="#1d1714" />
      <polygon points="65,61 70,59 75,61 70,63" fill="#1d1714" />
      <path d={brow.l} stroke="#3b2516" strokeWidth="2.4" strokeLinecap="round" />
      <path d={brow.r} stroke="#3b2516" strokeWidth="2.4" strokeLinecap="round" />
      <path d={mouth} stroke="#8a3d24" strokeWidth="2.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* Corinthian helmet, pushed up */}
      <polygon points="34,50 40,30 60,22 80,30 86,50 78,48 72,40 48,40 42,48" fill="#c9952e" />
      <polygon points="40,30 60,22 60,40 48,40" fill="#e2b955" />
      <polygon points="60,22 80,30 72,40 60,40" fill="#a8741f" />
      <polygon points="46,40 56,40 55,46 47,46" fill="#1d1714" />
      <polygon points="64,40 74,40 73,46 65,46" fill="#1d1714" />
      <polygon points="57,40 63,40 62,49 58,49" fill="#b8841f" />
      <polygon points="34,50 42,48 40,56 33,56" fill="#a8741f" />
      <polygon points="86,50 78,48 80,56 87,56" fill="#8f611a" />
      {/* horsehair crest */}
      <polygon points="42,28 52,10 66,6 80,12 86,26 78,24 70,14 58,14 50,22" fill="#9a3f1c" />
      <polygon points="52,10 66,6 70,14 58,14" fill="#b44d24" />
      <polygon points="40,30 42,28 50,22 60,22" fill="#1d1714" opacity="0.35" />
      {/* the owl on her shoulder */}
      <g transform="translate(86 86)">
        <polygon points="0,10 6,0 12,10 10,20 2,20" fill="#1d1714" />
        <circle cx="4" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="8" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="4" cy="8" r="1" fill="#1d1714" />
        <circle cx="8" cy="8" r="1" fill="#1d1714" />
      </g>
    </svg>
  )
}
