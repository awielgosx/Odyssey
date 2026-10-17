// Athena as Mentor: a low-poly coach with a nod to the course's own professor (short ash-blonde
// hair, tortoiseshell glasses, grey tweed coat over a black turtleneck), wearing an archaic Greek
// Corinthian helmet pushed up on her head, the way Athena is shown on Greek vases and statues.
// Faceted SVG polygons: costs nothing to render and stays crisp.

export type Mood = 'neutral' | 'pleased' | 'stern'

const SKIN = { light: '#f3d0b8', mid: '#e9bfa3', shade: '#d9a888', deep: '#c99376' }
const HAIR = { light: '#e2cba0', mid: '#cdb284', shade: '#ae935f', root: '#8c7148' }
const BRONZE = { light: '#e6bd5c', mid: '#c9952e', shade: '#a8741f', deep: '#7f5516' }
const TWEED = { light: '#8d8882', mid: '#77726c', shade: '#5f5a55', deep: '#4b4743' }
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
        <pattern id="tweed" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="none" />
          <rect x="0" y="0" width="1" height="1" fill="#b7b1aa" opacity="0.45" />
          <rect x="2" y="1" width="1" height="1" fill="#3e3a37" opacity="0.4" />
          <rect x="1" y="2" width="1" height="1" fill="#d2ccc4" opacity="0.3" />
        </pattern>
      </defs>

      {/* grey tweed coat */}
      <polygon points="12,120 22,99 44,91 76,91 98,99 108,120" fill={TWEED.mid} />
      <polygon points="22,99 44,91 50,120 12,120" fill={TWEED.light} />
      <polygon points="98,99 76,91 70,120 108,120" fill={TWEED.shade} />
      {/* lapels */}
      <polygon points="43,91 49,88 57,106 53,120 38,106" fill={TWEED.shade} />
      <polygon points="77,91 71,88 63,106 67,120 82,106" fill={TWEED.deep} />
      <polygon points="43,91 49,88 57,106 53,120 38,106" fill="url(#tweed)" />
      <polygon points="77,91 71,88 63,106 67,120 82,106" fill="url(#tweed)" />
      <polygon points="12,120 22,99 44,91 76,91 98,99 108,120" fill="url(#tweed)" />

      {/* black turtleneck with a ruffled edge */}
      <polygon points="47,85 73,85 74,94 66,120 54,120 46,94" fill="#1f1b1b" />
      <polygon points="47,85 60,88 60,120 54,120 46,94" fill="#2a2525" />
      <path d="M46.5 86.5 q2.2 -2.6 4.4 0 q2.2 -2.6 4.4 0 q2.2 -2.6 4.4 0 q2.2 -2.6 4.4 0 q2.2 -2.6 4.4 0 q2.2 -2.6 4.4 0" stroke="#3a3333" strokeWidth="1.6" fill="#1f1b1b" />

      {/* neck */}
      <polygon points="53,80 67,80 68,87 52,87" fill={SKIN.shade} />

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

      {/* Corinthian helmet pushed up on the head */}
      <polygon points="38,36 43,20 60,13 77,20 82,36 75,34 69,29 51,29 45,34" fill={BRONZE.mid} />
      <polygon points="43,20 60,13 60,29 51,29" fill={BRONZE.light} />
      <polygon points="60,13 77,20 69,29 60,29" fill={BRONZE.shade} />
      <polygon points="47,29 56,29 55,34 48,34" fill="#1d1714" />
      <polygon points="64,29 73,29 72,34 65,34" fill="#1d1714" />
      <polygon points="57,29 63,29 62,36 58,36" fill={BRONZE.shade} />
      <polygon points="38,36 45,34 43,41 37,41" fill={BRONZE.shade} />
      <polygon points="82,36 75,34 77,41 83,41" fill={BRONZE.deep} />
      <path d="M43 21 Q60 15.5 77 21" stroke={BRONZE.deep} strokeWidth="1" fill="none" opacity="0.7" />
      {/* horsehair crest */}
      <polygon points="44,18 53,4 66,1 78,6 84,16 77,15 70,8 58,8 51,13" fill="#9a3f1c" />
      <polygon points="53,4 66,1 70,8 58,8" fill="#b44d24" />
      <polygon points="43,20 44,18 51,13 60,13" fill="#1d1714" opacity="0.35" />
      <path d="M55 6 L53 13 M60 4 L59 11 M66 3 L66 10 M72 6 L74 12" stroke="#7d3014" strokeWidth="0.9" opacity="0.7" />

      {/* the owl on her shoulder */}
      <g transform="translate(88 86)">
        <polygon points="0,10 6,0 12,10 10,20 2,20" fill="#1d1714" />
        <circle cx="4" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="8" cy="8" r="2.4" fill="#e2894f" />
        <circle cx="4" cy="8" r="1" fill="#1d1714" />
        <circle cx="8" cy="8" r="1" fill="#1d1714" />
      </g>
    </svg>
  )
}
