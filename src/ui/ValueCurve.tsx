import type { Attribute } from '../content/voyages'

// The value curve: attributes from the customer's point of view, level 1-5.
export function CurveChart({ names, reference, next }: { names: string[]; reference: number[]; next?: number[] }) {
  const W = 460
  const H = 190
  const padL = 50
  const padB = 64
  const step = (W - padL - 50) / Math.max(1, names.length - 1)
  const y = (v: number) => 12 + (5 - v) * ((H - padB - 12) / 4)
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${padL + i * step},${y(v)}`).join(' ')
  return (
    <div className="curve">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Value curve">
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line x1={padL - 8} x2={W - 42} y1={y(v)} y2={y(v)} stroke="#5a4228" strokeOpacity="0.2" />
            <text x={padL - 22} y={y(v) + 4} fontSize="11" fill="#5a4228">
              {v}
            </text>
          </g>
        ))}
        <path d={path(reference)} fill="none" stroke="#2b1d0e" strokeWidth="2.5" strokeDasharray={next ? '6 5' : undefined} />
        {reference.map((v, i) => (
          <circle key={`r${i}`} cx={padL + i * step} cy={y(v)} r="4.5" fill="#2b1d0e" />
        ))}
        {next && <path d={path(next)} fill="none" stroke="#b44d24" strokeWidth="3" />}
        {next?.map((v, i) => <circle key={`n${i}`} cx={padL + i * step} cy={y(v)} r="5.5" fill="#b44d24" stroke="#2b1d0e" strokeWidth="1.5" />)}
        {names.map((n, i) => (
          <text key={i} x={padL + i * step} y={H - padB + 16} fontSize="12" fill="#2b1d0e" textAnchor="middle">
            {wrap(n || `Attribute ${i + 1}`).map((line, k) => (
              <tspan key={k} x={padL + i * step} dy={k ? 13 : 0}>
                {line}
              </tspan>
            ))}
          </text>
        ))}
      </svg>
      <div className="legend">
        <span>{next ? '- - Troy (today)' : '— Your offer today'}</span>
        {next && <span style={{ color: '#9a3f1c' }}>{'—'} Your new offer</span>}
      </div>
    </div>
  )
}

function wrap(s: string) {
  const words = s.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 14 && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 3)
}

export function AttributeEditor({ attributes, onChange, editableNames }: { attributes: Attribute[]; onChange: (a: Attribute[]) => void; editableNames: boolean }) {
  return (
    <div>
      {attributes.map((a, i) => (
        <div className="attr-row" key={i}>
          {editableNames ? (
            <input
              type="text"
              value={a.name}
              placeholder={['e.g. Price', 'e.g. Speed', 'e.g. Ease of use', 'e.g. Choice', 'e.g. Environmental footprint'][i]}
              aria-label={`Attribute ${i + 1} name`}
              onChange={(e) => onChange(attributes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
            />
          ) : (
            <span>{a.name}</span>
          )}
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={a.level}
            aria-label={`${a.name || `Attribute ${i + 1}`} level`}
            onChange={(e) => onChange(attributes.map((x, j) => (j === i ? { ...x, level: +e.target.value } : x)))}
          />
          <b>{a.level}</b>
        </div>
      ))}
    </div>
  )
}
