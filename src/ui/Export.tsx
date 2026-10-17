// The submittable assignment: the voyage's answers laid out like the course's business model
// description (title and tagline; context, business model innovation, results; value proposition
// with a value curve; value architecture; contributions), in a clean professional style or in the
// game's Greek style. Rendered outside the app root so the browser's "Save as PDF" prints only it.
import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DIRECTIONS, directionById } from '../content/directions'
import { flattenLanding, summaryOf } from '../content/landing'
import { voyageById } from '../content/voyages'
import { bestGrade, finalGrade, useGame } from '../store'
import { GODS, INDICATORS, ZONES } from './Tasks'

export type DocStyle = 'pro' | 'greek'

const strip = (s?: string) => (s ?? '').trim().replace(/\s+/g, ' ')
// lower-case a leading capital mid-sentence ("Truck drivers" -> "truck drivers"), but keep acronyms and names like "BMW"
const lower = (s?: string) => {
  const t = strip(s)
  return /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t
}
const sentence = (s?: string) => {
  const t = strip(s)
  return t && !/[.!?]$/.test(t) ? `${t}.` : t
}

function gather() {
  const s = useGame.getState()
  const v = voyageById(s.voyageId)
  const t = s.troy?.answer
  const lem = s.lemnos?.answer
  const oly = s.olympus?.answer
  const aeo = s.aeolus?.answer
  const g = finalGrade(s)
  const idea = (id: number | null | undefined) => (id && s.landings[id] ? summaryOf(directionById(id), s.landings[id].answer) : '')
  const archIdeas = DIRECTIONS.filter((d) => d.pillar === 'architecture' && s.landings[d.id])
    .map((d) => ({ d, score: bestGrade(s.landings[d.id])?.total ?? 0, text: idea(d.id) }))
    .sort((a, b) => (a.d.id === aeo?.a ? -1 : b.d.id === aeo?.a ? 1 : b.score - a.score))
    .slice(0, 3)
  const deal = s.landings[12]?.answer.deal as string[] | undefined
  const zone = ZONES.find((z) => z.id === lem?.zone)
  const god = GODS.find((x) => x.id === oly?.god)
  return {
    s,
    v,
    g,
    name: strip(lem?.name) || 'Untitled business model',
    tagline: strip(lem?.pitch),
    authors: [s.captain, ...(s.crew ?? [])].filter(Boolean).join(', '),
    business: v.id === 'own' ? '' : v.title,
    context: [
      t && sentence(`Today the industry offers ${strip(t.offer).replace(/^./, (c) => c.toLowerCase())}, used by ${lower(t.user)}, chosen by ${lower(t.decider)} and paid for by ${lower(t.payer)} (${lower(t.price)})`),
      t?.frustration && sentence(`Customers live with a frustration: ${strip(t.frustration).replace(/^./, (c) => c.toLowerCase())}`),
      t?.orthodoxy && sentence(`Every incumbent assumes that ${strip(t.orthodoxy).replace(/^./, (c) => c.toLowerCase())}`),
      t?.trend && sentence(`Meanwhile, ${strip(t.trend).replace(/^./, (c) => c.toLowerCase())} threatens this model`),
    ]
      .filter(Boolean)
      .join(' '),
    innovation: [
      sentence(lem?.pitch),
      sentence(aeo?.sentence),
      aeo?.p && aeo?.a ? `It combines direction ${aeo.p} (${directionById(aeo.p).name.toLowerCase()}) with direction ${aeo.a} (${directionById(aeo.a).name.toLowerCase()}).` : '',
    ]
      .filter(Boolean)
      .join(' '),
    results: [
      zone && `Expected positioning: ${zone.label.toLowerCase()} (${zone.text.toLowerCase()}).`,
      oly?.assumption && sentence(`Riskiest assumption: ${strip(oly.assumption)}`),
      oly?.mvp && sentence(`First test: ${strip(oly.mvp)}`),
      oly?.stake && sentence(`Success threshold: ${strip(oly.stake)}`),
    ]
      .filter(Boolean)
      .join(' '),
    curve: {
      names: t?.attributes.map((a) => a.name) ?? [],
      before: t?.attributes.map((a) => a.level) ?? [],
      after: lem?.curve ?? t?.attributes.map((a) => a.level) ?? [],
    },
    chain: s.narrows?.chain ?? [],
    changes: archIdeas,
    partners: [strip(s.narrows?.partners), deal?.[0] && `${strip(deal[0])}${deal[1] ? ` (brings ${strip(deal[1]).replace(/^./, (c) => c.toLowerCase())})` : ''}`].filter(Boolean) as string[],
    resources: [...(s.narrows?.resources ?? []), ...(s.landings[14]?.answer.resource ? [String(s.landings[14].answer.resource)] : [])].filter((x, i, a) => x && a.indexOf(x) === i),
    indicators: lem?.indicators ?? {},
    antagonism: strip(lem?.antagonism),
    god: god && oly ? { name: god.name, q: god.q, a: strip(oly.answer) } : null,
  }
}

type Doc = ReturnType<typeof gather>

function Curve({ doc }: { doc: Doc }) {
  const { names, before, after } = doc.curve
  const W = 520
  const H = 300
  const padL = 76
  const padR = 20
  const padT = 20
  const padB = 92
  const step = (W - padL - padR) / Math.max(1, names.length - 1)
  const y = (v: number) => padT + (5 - v) * ((H - padT - padB) / 4)
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${padL + i * step},${y(v)}`).join(' ')
  // colours come from the document style (CSS variables), so switching style needs no re-render
  const c1 = 'var(--doc-c1)'
  const c2 = 'var(--doc-c2)'
  const ink = 'var(--doc-ink-soft)'
  return (
    <svg viewBox={`0 0 ${W} ${H + 34}`} className="doc-curve" role="img" aria-label="Value curve">
      <text x={14} y={padT + 8} fontSize="18" style={{ fill: ink }}>
        +
      </text>
      <text x={16} y={H - padB + 4} fontSize="20" style={{ fill: ink }}>
        {'−'}
      </text>
      <text transform={`translate(30 ${(H - padB + padT) / 2 + 30}) rotate(-90)`} fontSize="11" style={{ fill: ink }}>
        Relative level
      </text>
      {names.map((_, i) => (
        <line key={i} x1={padL + i * step} x2={padL + i * step} y1={padT} y2={H - padB} style={{ stroke: ink }} strokeOpacity="0.18" strokeDasharray="2 3" />
      ))}
      <path d={path(before)} fill="none" className="doc-before" style={{ stroke: c1 }} strokeWidth="3.5" strokeLinejoin="round" />
      <path d={path(after)} fill="none" style={{ stroke: c2 }} strokeWidth="3.5" strokeLinejoin="round" />
      {before.map((v, i) => (
        <circle key={`b${i}`} cx={padL + i * step} cy={y(v)} r="5" style={{ fill: c1 }} />
      ))}
      {after.map((v, i) => (
        <circle key={`a${i}`} cx={padL + i * step} cy={y(v)} r="5" style={{ fill: c2 }} />
      ))}
      {names.map((n, i) => (
        <text key={n + i} transform={`translate(${padL + i * step - 4} ${H - padB + 16}) rotate(-35)`} textAnchor="end" fontSize="12" style={{ fill: ink }}>
          {n.length > 26 ? `${n.slice(0, 25)}…` : n}
        </text>
      ))}
      <g transform={`translate(${padL} ${H + 6})`} fontSize="12" style={{ fill: ink }}>
        <circle cx="6" cy="0" r="5" style={{ fill: c1 }} />
        <text x="16" y="4">
          Troy: the traditional model
        </text>
        <circle cx="216" cy="0" r="5" style={{ fill: c2 }} />
        <text x="226" y="4">
          {doc.name.length > 34 ? `${doc.name.slice(0, 33)}…` : doc.name}
        </text>
      </g>
    </svg>
  )
}

function SignBoxes({ v }: { v: string }) {
  return (
    <span className="doc-signs" aria-label={v ? `rated ${v}` : 'not rated'}>
      {(['+', '0', '-'] as const).map((k) => (
        <span key={k} className={v === k ? 'on' : ''}>
          {k === '-' ? '−' : k}
        </span>
      ))}
    </span>
  )
}

const AssignmentDoc = memo(function AssignmentDoc({ doc, appendix, authors, group }: { doc: Doc; appendix: boolean; authors: string; group: string }) {
  const { s, v, g } = doc
  return (
    <>
      <section className="doc-page">
        <header className="doc-title">
          <h1 contentEditable suppressContentEditableWarning>
            {doc.name}
          </h1>
          {doc.tagline && (
            <p className="doc-tagline" contentEditable suppressContentEditableWarning>
              {doc.tagline}
            </p>
          )}
          <p className="doc-meta">
            {authors || doc.authors}
            {group ? ` · Group ${group}` : ''}
            {doc.business ? ` · Demo case: ${doc.business}` : ''} · Odyssey 3.14 business model description · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>
        <div className="doc-cols">
          <div className="doc-panel">
            <h2>Context</h2>
            <p data-count contentEditable suppressContentEditableWarning>
              {doc.context || 'Describe the context.'}
            </p>
            <h2>Business Model Innovation</h2>
            <p data-count contentEditable suppressContentEditableWarning>
              {doc.innovation || 'Describe the innovation.'}
            </p>
            <h2>Expected results</h2>
            <p data-count contentEditable suppressContentEditableWarning>
              {doc.results || 'Describe the expected results and how you will test them.'}
            </p>
          </div>
          <div>
            <h2 className="doc-tag">Value proposition</h2>
            <div className="doc-box">
              <Curve doc={doc} />
              <p className="doc-moves" contentEditable suppressContentEditableWarning>
                {(() => {
                  const { names, before, after } = doc.curve
                  const up = names.filter((_, i) => after[i] > before[i])
                  const down = names.filter((_, i) => after[i] < before[i])
                  return (
                    <>
                      <b>Raised:</b> {up.join(', ') || 'nothing'}. <b>Lowered:</b> {down.join(', ') || 'nothing'}.
                    </>
                  )
                })()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="doc-page">
        <div className="doc-cols">
          <div>
            <h2 className="doc-tag">Value architecture</h2>
            <div className="doc-box">
              <h3>Value chain</h3>
              <ol className="doc-chain">
                {doc.chain.map((c, i) => (
                  <li key={i} contentEditable suppressContentEditableWarning>
                    {c}
                  </li>
                ))}
              </ol>
              {doc.changes.length > 0 && (
                <>
                  <h3>What changes</h3>
                  <ul className="doc-list">
                    {doc.changes.map((c) => (
                      <li key={c.d.id} contentEditable suppressContentEditableWarning>
                        <b>{c.d.name}.</b> {c.text}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="doc-two">
                <div>
                  <h3>Partners</h3>
                  <p contentEditable suppressContentEditableWarning>
                    {doc.partners.join('; ') || '—'}
                  </p>
                </div>
                <div>
                  <h3>Resources and competencies</h3>
                  <p contentEditable suppressContentEditableWarning>
                    {doc.resources.join('; ') || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="doc-tag">Contributions</h2>
            <div className="doc-box">
              <table className="doc-contrib">
                <tbody>
                  {INDICATORS.map((grp) => (
                    <tr key={grp.group}>
                      <th>{grp.group}</th>
                      {grp.items.map(([k, label]) => (
                        <td key={k}>
                          <span>{label}</span>
                          <SignBoxes v={doc.indicators[k] ?? ''} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>Main antagonism</h3>
              <p contentEditable suppressContentEditableWarning>
                {doc.antagonism || '—'}
              </p>
              {doc.god && (
                <>
                  <h3>Stakeholder challenge: {doc.god.name}</h3>
                  <p contentEditable suppressContentEditableWarning>
                    <i>{doc.god.q}</i> {doc.god.a}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {appendix && (
        <section className="doc-page doc-appendix">
          <h2 className="doc-tag">Appendix: the fourteen directions explored</h2>
          <div className="doc-appx">
            {DIRECTIONS.map((d) => {
              const l = s.landings[d.id]
              const gr = bestGrade(l)
              return (
                <div key={d.id} className="doc-appx-item">
                  <h3>
                    {d.id}. {d.name}
                    {gr ? <small> · Athena {gr.total}/{gr.max}</small> : null}
                  </h3>
                  {l ? (
                    flattenLanding(d, l.answer)
                      .split('\n')
                      .map((line, i) => (line.startsWith('-') ? <p key={i}>{line.slice(2)}</p> : <p key={i} className="q">{line}</p>))
                  ) : (
                    <p className="q">Not explored.</p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="doc-foot">
            Voyage score {g.outOf20}/20 ({g.percent}%): knowledge {Math.round(g.knowledge * 100)}%, framing {Math.round(g.framing * 100)}%, exploration {Math.round(g.application * 100)}%, focus {Math.round(g.synthesis * 100)}%. {v.id === 'own' ? '' : `Demo voyage based on ${v.title.toLowerCase()}.`} Every idea was written by the authors; the coach only asked questions.
          </p>
        </section>
      )}
    </>
  )
})

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const [style, setStyle] = useState<DocStyle>('greek')
  const [authors, setAuthors] = useState(() => {
    const st = useGame.getState()
    return [st.captain, ...(st.crew ?? [])].filter(Boolean).join(', ')
  })
  const [group, setGroup] = useState('')
  const [appendix, setAppendix] = useState(true)
  const [doc] = useState(gather)
  const [chars, setChars] = useState(0)
  const [overflow, setOverflow] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const count = () => {
    const n = [...(ref.current?.querySelectorAll('[data-count]') ?? [])].reduce((m, el) => m + (el.textContent ?? '').length, 0)
    setChars(n)
    // pages 1 and 2 print on one sheet each: flag any that runs past the bottom
    const pages = [...(ref.current?.querySelectorAll('.doc-page:not(.doc-appendix)') ?? [])] as HTMLElement[]
    setOverflow(pages.map((p, i) => (p.scrollHeight > p.clientHeight + 2 ? i + 1 : 0)).filter(Boolean))
  }
  useEffect(() => {
    const t = setTimeout(count, 100)
    const prev = document.title
    document.title = doc.name
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      clearTimeout(t)
      document.title = prev
      window.removeEventListener('keydown', esc)
    }
  }, [doc.name, onClose])
  return createPortal(
    <div className={`export-root doc-${style}`}>
      <div className="export-bar no-print">
        <b>Your assignment</b>
        <span className="seg" role="group" aria-label="Document style">
          <button aria-pressed={style === 'greek'} onClick={() => setStyle('greek')} title="Parchment, meander borders and Greek lettering, like the game">
            Contemporary
          </button>
          <button aria-pressed={style === 'pro'} onClick={() => setStyle('pro')} title="Clean layout modelled on the course’s book examples">
            Scholar
          </button>
        </span>
        <label className="bar-field">
          Full names
          <input type="text" value={authors} placeholder="First and last name of every author" onChange={(e) => setAuthors(e.target.value)} />
        </label>
        <label className="bar-field small">
          Group <small>(optional)</small>
          <input type="text" value={group} placeholder="e.g. 7" onChange={(e) => setGroup(e.target.value)} />
        </label>
        <label className="chk">
          <input type="checkbox" checked={appendix} onChange={(e) => setAppendix(e.target.checked)} /> Appendix with all fourteen directions
        </label>
        <span className={`chars ${chars > 1500 ? 'over' : ''}`} title="The course template allows 1,500 characters for Context, Innovation and Results together">
          {chars}/1500 characters
        </span>
        {overflow.length > 0 && <span className="chars over">Page {overflow.join(' and ')} is too long: shorten some text.</span>}
        <span className="grow" />
        <button className="btn primary small" onClick={() => window.print()}>
          Save as PDF
        </button>
        <button className="btn small" onClick={onClose}>
          Close
        </button>
        <small className="hint-line">Click any text in the document to edit it before saving. In the print window, choose “Save as PDF”.</small>
      </div>
      <div className="export-pages" ref={ref} onInput={count}>
        <AssignmentDoc doc={doc} appendix={appendix} authors={authors} group={group} />
      </div>
    </div>,
    document.body,
  )
}
