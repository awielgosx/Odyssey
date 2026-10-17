import { useRef } from 'react'
import type { Attribute } from '../content/voyages'

// The value curve, the course's core tool for the value proposition: the attributes customers
// compare offers on, each rated from 1 (weak) to 5 (strong). Drawn as a large interactive chart:
// drag a point up or down (or click a level, or use the arrow keys); attribute names sit under
// their column and, for the player's own business, can be renamed, added (up to 8) or removed.

const W = 520
const H = 250
const PAD_L = 38
const PAD_R = 26
const PAD_T = 16
const PAD_B = 20

export function ValueCurveEditor({
  attributes,
  onChange,
  reference,
  editableNames,
  min = 3,
  max = 8,
  referenceLabel = 'Troy today',
  currentLabel = 'Your offer today',
}: {
  attributes: Attribute[]
  onChange: (a: Attribute[]) => void
  reference?: number[]
  editableNames: boolean
  min?: number
  max?: number
  referenceLabel?: string
  currentLabel?: string
}) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null)
  const n = attributes.length
  const step = (W - PAD_L - PAD_R) / Math.max(1, n - 1)
  const x = (i: number) => (n === 1 ? (W - PAD_L - PAD_R) / 2 + PAD_L : PAD_L + i * step)
  const y = (v: number) => PAD_T + (5 - v) * ((H - PAD_T - PAD_B) / 4)
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  const setLevel = (i: number, level: number) => {
    const l = Math.max(1, Math.min(5, Math.round(level)))
    if (attributes[i].level !== l) onChange(attributes.map((a, j) => (j === i ? { ...a, level: l } : a)))
  }
  const levelAt = (clientY: number) => {
    const r = svg.current!.getBoundingClientRect()
    const py = ((clientY - r.top) / r.height) * H
    return 5 - ((py - PAD_T) / (H - PAD_T - PAD_B)) * 4
  }
  const levels = attributes.map((a) => a.level)
  return (
    <div className="vc">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="Value curve: drag each point to set the level"
        onPointerMove={(e) => drag.current !== null && setLevel(drag.current, levelAt(e.clientY))}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <text x={8} y={PAD_T + 5} className="vc-axis">
          5
        </text>
        <text x={8} y={H - PAD_B + 4} className="vc-axis">
          1
        </text>
        {[1, 2, 3, 4, 5].map((v) => (
          <line key={v} x1={PAD_L - 14} x2={W - PAD_R + 14} y1={y(v)} y2={y(v)} className="vc-grid" />
        ))}
        {attributes.map((_, i) => (
          <line key={`c${i}`} x1={x(i)} x2={x(i)} y1={PAD_T} y2={H - PAD_B} className="vc-col" />
        ))}
        {/* click targets: one per level per column */}
        {attributes.map((_, i) =>
          [1, 2, 3, 4, 5].map((v) => <rect key={`${i}-${v}`} x={x(i) - step / 2} y={y(v) - (H - PAD_T - PAD_B) / 8} width={Math.max(30, step)} height={(H - PAD_T - PAD_B) / 4} className="vc-hit" onClick={() => setLevel(i, v)} />),
        )}
        {reference && <path d={path(reference)} className="vc-ref" />}
        {reference?.map((v, i) => <circle key={`r${i}`} cx={x(i)} cy={y(v)} r="5" className="vc-ref-dot" />)}
        <path d={path(levels)} className="vc-line" />
        {levels.map((v, i) => (
          <g key={`p${i}`}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r="11"
              className="vc-dot"
              tabIndex={0}
              role="slider"
              aria-label={attributes[i].name || `Attribute ${i + 1}`}
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={v}
              onPointerDown={(e) => {
                drag.current = i
                ;(e.target as Element).setPointerCapture?.(e.pointerId)
              }}
              onPointerMove={(e) => drag.current === i && setLevel(i, levelAt(e.clientY))}
              onPointerUp={() => (drag.current = null)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowRight') (e.preventDefault(), setLevel(i, v + 1))
                if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') (e.preventDefault(), setLevel(i, v - 1))
              }}
            />
            <text x={x(i)} y={y(v) + 4} className="vc-dot-label">
              {v}
            </text>
          </g>
        ))}
      </svg>
      <div className={`vc-names ${editableNames ? 'edit' : ''}`}>
        {attributes.map((a, i) => {
          const pos = { left: `${(x(i) / W) * 100}%`, width: `${(Math.min(n > 1 ? step - 6 : 160, 150) / W) * 100}%` }
          return editableNames ? (
            <span key={i} className="vc-name-edit" style={pos}>
              <textarea
                rows={2}
                value={a.name}
                placeholder={['e.g. Price', 'e.g. Speed', 'e.g. Ease of use', 'e.g. Choice', 'e.g. Footprint', 'e.g. Design', 'e.g. Service', 'e.g. Status'][i]}
                aria-label={`Attribute ${i + 1} name`}
                onChange={(e) => onChange(attributes.map((x2, j) => (j === i ? { ...x2, name: e.target.value } : x2)))}
              />
              {n > min && (
                <button type="button" aria-label={`Remove attribute ${i + 1}`} onClick={() => onChange(attributes.filter((_, j) => j !== i))}>
                  {'×'}
                </button>
              )}
            </span>
          ) : (
            <span key={i} className="vc-name" style={pos}>
              {a.name || `Attribute ${i + 1}`}
            </span>
          )
        })}
      </div>
      <div className="vc-foot">
        <span className="legend">
          {reference && <span className="vc-key ref">{referenceLabel}</span>}
          <span className="vc-key cur">{currentLabel}</span>
        </span>
        {editableNames && n < max && (
          <button type="button" className="link-btn" onClick={() => onChange([...attributes, { name: '', level: 3 }])}>
            + Add an attribute ({n}/{max})
          </button>
        )}
      </div>
    </div>
  )
}
