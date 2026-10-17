// Athena, the player's mentor: a low-poly coach with a nod to the course's own professor (short
// ash-blonde hair, tortoiseshell glasses), armed as the goddess of strategy is on Greek vases:
// a great crested bronze helmet worn on her head, a bronze cuirass, the scaly aegis with the
// Gorgon's head and a red cloak. Faceted SVG: costs nothing to render.

export type Mood = 'neutral' | 'pleased' | 'stern'

const SKIN = { light: '#f3d0b8', mid: '#e9bfa3', shade: '#d9a888', deep: '#c99376' }
const HAIR = { light: '#e2cba0', mid: '#cdb284', shade: '#ae935f', root: '#8c7148' }
const BRONZE = { light: '#e6bd5c', mid: '#c9952e', shade: '#a8741f', deep: '#7f5516' }
const CLOAK = { light: '#c4562c', mid: '#a8431f', shade: '#7f2f14' }
const AEGIS = { light: '#a7a35a', mid: '#868443', shade: '#5f5d2c' }
const FRAME = '#7a4524'

export function Athena({ mood = 'neutral', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const brow =
    mood === 'stern'
      ? { l: 'M44 53.5 L55 56.5', r: 'M65 56.5 L76 53.5' }
      : mood === 'pleased'
        ? { l: 'M44 54 Q49.5 51.5 55 53.5', r: 'M65 53.5 Q70.5 51.5 76 54' }
        : { l: 'M44 54.5 Q49.5 53 55 54.5', r: 'M65 54.5 Q70.5 53 76 54.5' }
  return (
    <svg className={`athena ${mood} ${className}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Athena, your coach, looking ${mood}`}>
      <defs>
        <pattern id="aegis-scales" width="5" height="4" patternUnits="userSpaceOnUse">
          <rect width="5" height="4" fill={AEGIS.mid} />
          <path d="M0 0 Q2.5 4 5 0" fill="none" stroke={AEGIS.shade} strokeWidth="0.8" />
          <path d="M-2.5 2 Q0 6 2.5 2 M2.5 2 Q5 6 7.5 2" fill="none" stroke={AEGIS.light} strokeWidth="0.5" opacity="0.7" />
        </pattern>
      </defs>

      {/* red cloak over the shoulders */}
      <polygon points="4,120 14,96 40,86 80,86 106,96 116,120" fill={CLOAK.mid} />
      <polygon points="4,120 14,96 40,86 34,120" fill={CLOAK.light} />
      <polygon points="116,120 106,96 80,86 86,120" fill={CLOAK.shade} />

      {/* bronze muscle cuirass */}
      <polygon points="34,120 32,100 44,90 76,90 88,100 86,120" fill={BRONZE.mid} />
      <polygon points="34,120 32,100 44,90 60,92 60,120" fill={BRONZE.light} />
      <path d="M44 106 Q52 112 60 106 Q68 112 76 106 M60 96 L60 120" stroke={BRONZE.deep} strokeWidth="1.1" fill="none" opacity="0.8" />
      <path d="M48 116 Q60 120 72 116" stroke={BRONZE.deep} strokeWidth="1" fill="none" opacity="0.6" />

      {/* the aegis: a scaly cape over the shoulders, edged with snakes, the Gorgon at its centre */}
      <polygon points="20,98 40,86 80,86 100,98 84,104 72,98 60,103 48,98 36,104" fill="url(#aegis-scales)" stroke={AEGIS.shade} strokeWidth="0.8" />
      <path d="M20 98 q2 4 5 2 q2 5 5 3 M100 98 q-2 4 -5 2 q-2 5 -5 3 M36 104 q1 4 4 3 M84 104 q-1 4 -4 3" stroke={AEGIS.shade} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="104" r="6.5" fill={BRONZE.light} stroke={BRONZE.deep} strokeWidth="1" />
      <circle cx="60" cy="104" r="4.6" fill={SKIN.mid} />
      <path d="M54.4 101 q-2 -2 -1 -4 M65.6 101 q2 -2 1 -4 M56 99 q-1 -3 1 -4.5 M64 99 q1 -3 -1 -4.5" stroke={AEGIS.shade} strokeWidth="1" fill="none" />
      <circle cx="58.3" cy="103.2" r="0.8" fill="#1d1714" />
      <circle cx="61.7" cy="103.2" r="0.8" fill="#1d1714" />
      <path d="M57.6 105.6 Q60 104.6 62.4 105.6 L61 107.8 L60 107 L59 107.8 Z" fill="#7f2f14" />
      <path d="M56.6 102 L59.2 102.8 M63.4 102 L60.8 102.8" stroke="#1d1714" strokeWidth="0.7" />

      {/* neck */}
      <polygon points="53,80 67,80 69,90 51,90" fill={SKIN.shade} />
      <polygon points="53,80 60,82 60,90 51,90" fill={SKIN.mid} />

      {/* ears with pearl studs */}
      <polygon points="36,61 39,59 40,72 37,73" fill={SKIN.shade} />
      <polygon points="84,61 81,59 80,72 83,73" fill={SKIN.deep} />
      <circle cx="37.8" cy="74.4" r="1.5" fill="#f6f1e7" />
      <circle cx="82.2" cy="74.4" r="1.5" fill="#e9e2d5" />

      {/* face */}
      <polygon points="40,48 80,48 82.5,64 79,78 69,87 51,87 41,78 37.5,64" fill={SKIN.mid} />
      <polygon points="40,48 60,48 60,87 51,87 41,78 37.5,64" fill={SKIN.light} />
      <polygon points="37.5,64 41,78 45,71" fill={SKIN.shade} />
      <polygon points="82.5,64 79,78 75,71" fill={SKIN.deep} />
      <polygon points="51,87 60,84 69,87" fill={SKIN.shade} />
      {/* cheeks: rounder when she smiles */}
      {mood === 'pleased' && (
        <>
          <ellipse cx="47" cy="74" rx="3.6" ry="2.2" fill="#e8a58c" opacity="0.55" />
          <ellipse cx="73" cy="74" rx="3.6" ry="2.2" fill="#e09a80" opacity="0.5" />
        </>
      )}
      {/* nose */}
      <polygon points="60,61 63.5,72 60,73.5 57.5,72" fill={SKIN.shade} />
      <polygon points="60,61 60,73.5 57.5,72" fill={SKIN.mid} />

      {/* eyes */}
      <polygon points="46,63.5 50,61.5 54,63.5 50,65" fill="#2f3438" />
      <polygon points="66,63.5 70,61.5 74,63.5 70,65" fill="#2f3438" />
      <circle cx="50.6" cy="63.2" r="0.7" fill="#dfe8ee" />
      <circle cx="70.6" cy="63.2" r="0.7" fill="#dfe8ee" />
      {mood === 'pleased' && (
        <path d="M45.5 67 q4.5 1.8 9 0 M65.5 67 q4.5 1.8 9 0" stroke={SKIN.deep} strokeWidth="0.9" fill="none" />
      )}

      {/* brows */}
      <path d={brow.l} stroke={HAIR.root} strokeWidth="1.9" strokeLinecap="round" fill="none" />
      <path d={brow.r} stroke={HAIR.root} strokeWidth="1.9" strokeLinecap="round" fill="none" />

      {/* large tortoiseshell glasses */}
      <rect x="42" y="56.5" width="16.5" height="13.5" rx="4.5" fill="#dfeaf0" fillOpacity="0.16" stroke={FRAME} strokeWidth="2.3" />
      <rect x="61.5" y="56.5" width="16.5" height="13.5" rx="4.5" fill="#dfeaf0" fillOpacity="0.16" stroke={FRAME} strokeWidth="2.3" />
      <path d="M58.5 61 Q60 59.4 61.5 61" stroke={FRAME} strokeWidth="2" fill="none" />
      <path d="M42 60 L38.5 61.5 M78 60 L81.5 61.5" stroke={FRAME} strokeWidth="1.8" />
      <path d="M44 57.6 l3 0 M53 69 l3 0 M64 57.6 l2.5 0 M73 69 l3 0 M77 62 l0 3 M43 64 l0 3" stroke="#c07a43" strokeWidth="1.1" strokeLinecap="round" />
      <polygon points="44,58.5 48,58.5 45,63" fill="#fff" opacity="0.28" />
      <polygon points="63.5,58.5 67.5,58.5 64.5,63" fill="#fff" opacity="0.28" />

      {/* mouth: a warm smile by default */}
      {mood === 'pleased' ? (
        <>
          <path d="M51 77 Q60 87.5 69 77 Q60 79.5 51 77 Z" fill="#8e3c2e" />
          <path d="M52.6 77.7 Q60 80 67.4 77.7 Q66.5 80.4 60 81.2 Q53.5 80.4 52.6 77.7 Z" fill="#f7efe6" />
        </>
      ) : mood === 'stern' ? (
        <path d="M54 80 L66 80" stroke="#9c4a3a" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M53 78.6 Q60 83 67 78.6" stroke="#a34d3c" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {mood !== 'stern' && <path d="M50.5 76.5 q0.8 2.4 2.4 3.4 M69.5 76.5 q-0.8 2.4 -2.4 3.4" stroke={SKIN.deep} strokeWidth="0.8" fill="none" />}

      {/* short ash-blonde hair with volume at the sides and a side-swept fringe */}
      <polygon points="34,60 35,44 44,34 60,31 76,34 85,44 86,60 83,68 81,50 39,50 37,68" fill={HAIR.shade} />
      <polygon points="35,44 44,34 60,31 60,42 43,47 37,56" fill={HAIR.mid} />
      <polygon points="60,31 76,34 85,44 84,55 77,47 60,42" fill={HAIR.shade} />
      <polygon points="34,60 37,52 40,62 37,68" fill={HAIR.mid} />
      <polygon points="86,60 83,52 80,62 83,68" fill={HAIR.root} />
      {/* the fringe sweeps from her right to her left across the forehead */}
      <polygon points="38,52 43,40 57,35 73,37 82,45 83,53 75,48 66,51 56,48 46,55" fill={HAIR.mid} />
      <polygon points="43,40 57,35 66,40 56,48 46,55 40,51" fill={HAIR.light} />
      <polygon points="57,35 73,37 79,43 70,45 66,40" fill={HAIR.light} opacity="0.8" />
      <polygon points="46,55 56,48 54,52 48,56.5" fill={HAIR.shade} />
      <polygon points="75,48 82,45 83,53 80,55" fill={HAIR.mid} />
      <path d="M45 44 L54 40 M50 48 L61 42 M62 45 L72 42 M40 50 L45 45" stroke={HAIR.root} strokeWidth="0.8" opacity="0.6" />

      {/* a great bronze helmet worn on the head: the bowl covers the crown, the fringe shows under the brim */}
      <polygon points="31,47 32,33 38,22 48,15 60,13 72,15 82,22 88,33 89,47 84,45 83,40 76,38 60,37 44,38 37,40 36,45" fill={BRONZE.mid} />
      <polygon points="32,33 38,22 48,15 60,13 60,37 44,38 37,40 36,45 31,47" fill={BRONZE.light} />
      <polygon points="60,13 72,15 82,22 88,33 89,47 84,45 83,40 76,38 60,37" fill={BRONZE.shade} />
      <polygon points="48,15 60,13 72,15 66,20 54,20" fill="#f0d27a" opacity="0.55" />
      {/* brim band */}
      <polygon points="36,45 37,40 44,38 60,37 76,38 83,40 84,45 76,43 60,42 44,43" fill={BRONZE.deep} />
      <path d="M38 41.5 Q60 37.5 82 41.5" stroke={BRONZE.light} strokeWidth="0.9" fill="none" opacity="0.8" />
      {/* cheek pieces, raised, framing the face over the ears */}
      <polygon points="31,47 36,45 39,56 35,62 31,58" fill={BRONZE.shade} />
      <polygon points="89,47 84,45 81,56 85,62 89,58" fill={BRONZE.deep} />
      <path d="M40 30 Q60 22 80 30" stroke={BRONZE.deep} strokeWidth="1" fill="none" opacity="0.6" />
      {/* crest holder and tall horsehair crest, sweeping back */}
      <polygon points="56,14 64,14 63,10 57,10" fill={BRONZE.deep} />
      <polygon points="40,14 46,3 60,0 80,2 96,10 104,26 96,23 86,13 72,9 58,9 48,12" fill="#9a3f1c" />
      <polygon points="46,3 60,0 80,2 72,9 58,9" fill="#c4562c" />
      <polygon points="96,10 104,26 106,36 99,29 96,23" fill="#7f2f14" />
      <path d="M50 7 L50 12 M58 3 L57 9 M66 1.5 L66 8 M74 3 L75 9 M82 5 L84 11 M90 9 L93 15 M97 15 L100 22" stroke="#6b260f" strokeWidth="0.9" opacity="0.75" />

      {/* the owl on her shoulder */}
      <g transform="translate(90 80)">
        <polygon points="0,10 6,0 12,10 10,20 2,20" fill="#1d1714" />
        <circle cx="4" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="8" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="4" cy="8" r="1" fill="#1d1714" />
        <circle cx="8" cy="8" r="1" fill="#1d1714" />
      </g>
    </svg>
  )
}
