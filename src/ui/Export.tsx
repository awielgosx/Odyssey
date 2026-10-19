// The submittable assignment: the voyage's answers laid out like the course's business model
// description (title and tagline; context, business model innovation, results; value proposition
// with a value curve; value architecture; contributions), in the game's Greek style ("Contemporary")
// or a clean professional style ("Scholar"). Rendered outside the app root so the browser's
// "Save as PDF" prints only it. Every text block can be edited, and edits are kept in the voyage.
import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DIRECTIONS, directionById } from '../content/directions'
import { flattenLanding, ideaOf, isNoFit, midSentence, type Landing } from '../content/landing'
import { voyageById } from '../content/voyages'
import { bestGrade, finalGrade, useGame } from '../store'
import { GODS, INDICATORS, ZONES } from './Tasks'
import { useDraft } from './useTask'

export type DocStyle = 'pro' | 'greek'

const LIMIT = 1500
const strip = (s?: string) => (s ?? '').trim().replace(/\s+/g, ' ')
const sentence = (s?: string) => {
  const t = strip(s)
  return t && !/[.!?…]$/.test(t) ? `${t}.` : t
}
// "Label: text." with a capital after the label and a full stop at the end; empty when there is no text
const labelled = (label: string, s?: string) => (strip(s) ? `${label}: ${sentence(strip(s).replace(/^./, (c) => c.toUpperCase()))}` : '')

function gather() {
  const s = useGame.getState()
  const v = voyageById(s.voyageId)
  const t = s.troy?.answer
  const lem = s.lemnos?.answer
  const oly = s.olympus?.answer
  const aeo = s.aeolus?.answer
  const g = finalGrade(s)
  const startup = s.framing === 'startup'
  // in demo voyages the teacher may skip the islands: their drafted answers stand in
  const landing = (id: number) => (s.landings[id]?.answer ?? (s.voyageId !== 'own' ? (s.drafts[`land${id}`] as Landing | undefined) : undefined))
  const chosen = [aeo?.p, aeo?.a]
    .filter((id): id is number => !!id && !!landing(id) && !isNoFit(landing(id)))
    .map((id) => ({ d: directionById(id), text: ideaOf(directionById(id), landing(id)) }))
  const same = (a?: string, b?: string) => strip(a).toLowerCase().replace(/\s*\(.*\)$/, '') === strip(b).toLowerCase().replace(/\s*\(.*\)$/, '')
  const deal = s.landings[12] && !isNoFit(s.landings[12].answer) ? (s.landings[12].answer.deal as string[] | undefined) : undefined
  const zone = ZONES.find((z) => z.id === lem?.zone)
  const god = GODS.find((x) => x.id === oly?.god)
  const pillarName = { p: 'value proposition', a: 'value architecture', c: 'contributions' } as const
  const added = lem?.added ?? []
  const names = [...(t?.attributes.map((a) => a.name) ?? []), ...added.map((a) => a.name)]
  const before = [...(t?.attributes.map((a) => a.level) ?? []), ...added.map(() => 0)]
  const after = [...(lem?.curve ?? t?.attributes.map((a) => a.level) ?? []), ...added.map((a) => a.level)]
  // printed authors: never the crew name invented for a blank captain
  const people = [s.captainAuto ? '' : s.captain, ...(s.crew ?? [])].map(strip).filter(Boolean)
  return {
    s,
    v,
    g,
    startup,
    name: strip(lem?.name) || 'Untitled business model',
    tagline: strip(lem?.pitch),
    authors: people.join(', '),
    business: v.id === 'own' ? '' : v.title,
    context: [
      startup ? 'We are a startup entering this industry. The incumbents’ model works as follows.' : '',
      labelled('Offer today', t?.offer),
      t && (same(t.user, t.decider) && same(t.user, t.payer) ? `Users, deciders and payers: ${midSentence(t.payer)}.` : `Users: ${midSentence(t.user)}; decision-makers: ${midSentence(t.decider)}; payers: ${midSentence(t.payer)}.`),
      labelled('Price', t?.price),
      labelled('Customer frustration', t?.frustration),
      labelled('Industry orthodoxy', t?.orthodoxy),
      labelled('Threat', t?.trend),
    ]
      .filter(Boolean)
      .join(' '),
    innovation: [
      // the biggest contribution gain is shown in the contributions table, not repeated here
      sentence(strip(aeo?.sentence).replace(/\s*Biggest gain:[^.]*\.?$/, '')),
      aeo?.p && aeo?.a ? `It combines direction ${aeo.p} (${directionById(aeo.p).short.toLowerCase()}) with direction ${aeo.a} (${directionById(aeo.a).short.toLowerCase()}).` : '',
      labelled('Revenue model', lem?.price),
    ]
      .filter(Boolean)
      .join(' '),
    results: [
      zone && `Expected positioning: ${zone.label.toLowerCase()} (${zone.text.toLowerCase()}).`,
      oly?.assumption && `Riskiest hypothesis${oly.riskiest ? ` (${pillarName[oly.riskiest]})` : ''}: ${sentence(midSentence(oly.assumption))}`,
      labelled('First test', oly?.mvp),
      labelled('Success threshold', oly?.stake),
    ]
      .filter(Boolean)
      .join(' '),
    curve: { names, before, after },
    chain: lem?.chain?.length ? lem.chain : s.narrows?.chain ?? [],
    troyChain: s.narrows?.chain ?? [],
    newChain: !!lem?.chain?.length,
    changes: chosen,
    price: strip(lem?.price),
    partners: [strip(s.narrows?.partners), deal?.[0] && `${strip(deal[0])}${deal[1] ? ` (brings ${midSentence(deal[1])})` : ''}`].filter(Boolean) as string[],
    resources: [...(s.narrows?.resources ?? []), ...(s.landings[14] && !isNoFit(s.landings[14].answer) && s.landings[14].answer.resource ? [String(s.landings[14].answer.resource)] : [])].filter((x, i, a) => x && a.indexOf(x) === i),
    indicators: lem?.indicators ?? {},
    antagonism: strip(lem?.antagonism),
    god: god && oly ? { name: god.name, q: god.q, a: strip(oly.answer) } : null,
  }
}

type Doc = ReturnType<typeof gather>

// An editable block. Its text is kept in the voyage, so closing and reopening the export (or a
// reload) never loses an edit. Rendered once: the browser owns the text after that.
const Ed = memo(
  function Ed({ k, as = 'p', className, count, children }: { k: string; as?: 'p' | 'h1' | 'li' | 'span'; className?: string; count?: boolean; children: ReactNode }) {
    const saved = useGame.getState().drafts[`export:${k}`] as string | undefined
    const Tag = as
    return (
      <Tag className={className} data-k={k} data-count={count ? '' : undefined} contentEditable suppressContentEditableWarning spellCheck>
        {saved ?? children}
      </Tag>
    )
  },
  () => true,
)

function Curve({ doc }: { doc: Doc }) {
  const { names, before, after } = doc.curve
  const lo = Math.min(1, ...before, ...after) // 0 when an attribute was eliminated or created
  const W = 520
  const H = 300
  const padL = 96
  const padR = 20
  const padT = 20
  const padB = 108
  const step = (W - padL - padR) / Math.max(1, names.length - 1)
  const y = (v: number) => padT + (5 - v) * ((H - padT - padB) / (5 - lo))
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
          {n.length > 22 ? `${n.slice(0, 21)}…` : n}
        </text>
      ))}
      <g transform={`translate(${padL} ${H + 6})`} fontSize="12" style={{ fill: ink }}>
        <circle cx="6" cy="0" r="5" style={{ fill: c1 }} />
        <text x="16" y="4">
          {doc.startup ? 'Troy: the incumbents’ model' : 'Troy: the traditional model'}
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

function moves(doc: Doc) {
  const { names, before, after } = doc.curve
  const pick = (f: (b: number, a: number) => boolean) => names.filter((_, i) => f(before[i], after[i]))
  return [
    ['Created', pick((b, a) => b === 0 && a > 0)],
    ['Raised', pick((b, a) => b > 0 && a > b)],
    ['Reduced', pick((b, a) => a > 0 && a < b)],
    ['Eliminated', pick((b, a) => b > 0 && a === 0)],
  ].filter(([, xs]) => xs.length) as [string, string[]][]
}

function AppendixPage({ doc, sea, scores, foot }: { doc: Doc; sea: 'proposition' | 'architecture'; scores: boolean; foot: boolean }) {
  const { s, g, v } = doc
  return (
    <section className="doc-page doc-appendix">
      <h2 className="doc-tag">
        Appendix: {sea === 'proposition' ? 'the Sea of the Value Proposition (directions 1 to 7)' : 'the Sea of the Value Architecture (directions 8 to 14)'}
      </h2>
      <div className="doc-appx">
        {DIRECTIONS.filter((d) => d.pillar === sea).map((d) => {
          const l = s.landings[d.id]
          const gr = bestGrade(l)
          return (
            <div key={d.id} className="doc-appx-item">
              <h3>
                {d.id}. {d.name}
                {scores && gr ? (
                  <small>
                    {' '}
                    · Athena {gr.total}/{gr.max}
                    {gr.source === 'estimate' ? ' (provisional)' : ''}
                  </small>
                ) : null}
              </h3>
              {!l ? (
                <p className="q">Not explored.</p>
              ) : isNoFit(l.answer) ? (
                <>
                  <p className="q">Does not fit our business. Why, and what would have to change for it to fit:</p>
                  <p>{strip(String(l.answer.nofit ?? ''))}</p>
                </>
              ) : (
                flattenLanding(d, l.answer)
                  .split('\n')
                  .map((line, i) => (line.startsWith('-') ? <p key={i}>{line.slice(2)}</p> : <p key={i} className="q">{line}</p>))
              )}
            </div>
          )
        })}
      </div>
      {foot && (
        <p className="doc-foot">
          {scores
            ? `Voyage score ${g.outOf20}/20 (${g.percent}%): knowledge ${Math.round(g.knowledge * 100)}%, framing ${Math.round(g.framing * 100)}%, exploration ${Math.round(g.application * 100)}%, focus ${Math.round(g.synthesis * 100)}%${g.pending ? `, with ${g.pending} provisional reviews` : ''}. `
            : ''}
          {v.id === 'own' ? '' : `Demo voyage based on ${v.title.toLowerCase()}. `}Every idea was written by the authors; the coach only asked questions.
        </p>
      )}
    </section>
  )
}

const AssignmentDoc = memo(function AssignmentDoc({ doc, appendix, scores, authors, group }: { doc: Doc; appendix: boolean; scores: boolean; authors: string; group: string }) {
  const meta = [authors.trim(), group.trim() && `Group ${group.trim()}`, doc.business && `Demo case: ${doc.business}`, 'Odyssey 3.14 business model description', new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })].filter(Boolean)
  const mv = moves(doc)
  return (
    <>
      <section className="doc-page">
        <header className="doc-title">
          <Ed k="name" as="h1">
            {doc.name}
          </Ed>
          {doc.tagline && (
            <Ed k="tagline" className="doc-tagline">
              {doc.tagline}
            </Ed>
          )}
          <p className="doc-meta">{meta.join(' · ')}</p>
        </header>
        <div className="doc-cols">
          <div className="doc-panel">
            <h2>Context</h2>
            <Ed k="context" count>
              {doc.context || 'Describe the context.'}
            </Ed>
            <h2>Business Model Innovation</h2>
            <Ed k="innovation" count>
              {doc.innovation || 'Describe the innovation.'}
            </Ed>
          </div>
          <div>
            <h2 className="doc-tag">Value proposition</h2>
            <div className="doc-box">
              <Curve doc={doc} />
              <Ed k="moves" className="doc-moves">
                {mv.length ? (
                  mv.map(([label, xs], i) => (
                    <span key={label}>
                      {i ? ' ' : ''}
                      <b>{label}:</b> {xs.join(', ')}.
                    </span>
                  ))
                ) : (
                  <>The curve is unchanged.</>
                )}
              </Ed>
            </div>
            <div className="doc-panel doc-results">
              <h2>Expected results</h2>
              <Ed k="results" count>
                {doc.results || 'Describe the expected results and how you will test them.'}
              </Ed>
            </div>
          </div>
        </div>
      </section>

      <section className="doc-page">
        <div className="doc-cols">
          <div>
            <h2 className="doc-tag">Value architecture</h2>
            <div className="doc-box">
              <h3>{doc.newChain ? 'New value chain' : 'Value chain'}</h3>
              <ol className="doc-chain">
                {doc.chain.map((c, i) => (
                  <Ed key={i} k={`chain${i}`} as="li">
                    {c}
                  </Ed>
                ))}
              </ol>
              {doc.newChain && doc.troyChain.length > 0 && (
                <p className="doc-small">
                  <b>Troy’s chain:</b> {doc.troyChain.join(' → ')}
                </p>
              )}
              {doc.changes.length > 0 && (
                <>
                  <h3>The two ideas behind it</h3>
                  <ul className="doc-list">
                    {doc.changes.map((c) => (
                      <Ed key={c.d.id} k={`change${c.d.id}`} as="li">
                        <b>{c.d.name}.</b> {sentence(c.text)}
                      </Ed>
                    ))}
                  </ul>
                </>
              )}
              <div className="doc-two">
                <div>
                  <h3>Partners</h3>
                  <Ed k="partners">{doc.partners.join('; ') || '—'}</Ed>
                </div>
                <div>
                  <h3>Resources and competencies</h3>
                  <Ed k="resources">{doc.resources.join('; ') || '—'}</Ed>
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
              <p className="doc-small">+ improves, 0 no change, − worsens, compared with Troy.</p>
              <h3>Main antagonism</h3>
              <Ed k="antagonism">{doc.antagonism || '—'}</Ed>
              {doc.god && (
                <>
                  <h3>Stakeholder challenge: {doc.god.name}</h3>
                  <Ed k="god">
                    <i>{doc.god.q}</i> {doc.god.a}
                  </Ed>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {appendix && (
        <>
          <AppendixPage doc={doc} sea="proposition" scores={scores} foot={false} />
          <AppendixPage doc={doc} sea="architecture" scores={scores} foot />
        </>
      )}
    </>
  )
})

const SECTIONS = [
  ['context', 'Context'],
  ['innovation', 'Innovation'],
  ['results', 'Results'],
] as const

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const [style, setStyle] = useDraft<DocStyle>('export-style', () => 'greek')
  const [authors, setAuthors] = useDraft<string>('export-authors', () => gather().authors)
  const [group, setGroup] = useDraft<string>('export-group', () => '')
  const [appendix, setAppendix] = useDraft<boolean>('export-appendix', () => true)
  const [scores, setScores] = useDraft<boolean>('export-scores', () => false)
  const [doc] = useState(gather)
  const [version, setVersion] = useState(0) // bumped to rebuild the document from the voyage
  const [chars, setChars] = useState<Record<string, number>>({})
  const [overflow, setOverflow] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const count = () => {
    const m: Record<string, number> = {}
    ref.current?.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (m[el.dataset.k ?? ''] = (el.textContent ?? '').length))
    setChars(m)
    // every page prints on one sheet: flag any that runs past the bottom
    const pages = [...(ref.current?.querySelectorAll('.doc-page') ?? [])] as HTMLElement[]
    setOverflow(pages.map((p, i) => (p.scrollHeight > p.clientHeight + 2 ? i + 1 : 0)).filter(Boolean))
  }
  const total = Object.values(chars).reduce((m, n) => m + n, 0)
  // keep each edit in the voyage (debounced by the store's storage)
  const onInput = (e: React.FormEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-k]')
    if (el?.dataset.k) useGame.getState().setDraft(`export:${el.dataset.k}`, el.innerText.replace(/\n{2,}/g, '\n').trim())
    count()
  }
  const resetEdits = () => {
    if (!confirm('Rebuild the document from your voyage answers? Your edits in the document will be lost.')) return
    const st = useGame.getState()
    useGame.setState({ drafts: Object.fromEntries(Object.entries(st.drafts).filter(([k]) => !k.startsWith('export:'))) })
    setVersion((n) => n + 1)
  }
  useEffect(() => {
    const t = setTimeout(count, 120)
    return () => clearTimeout(t)
  }, [appendix, scores, style, version])
  // the parent re-renders on every store change (each saved edit), so keep its callback in a ref:
  // re-running this effect would pull focus out of the text being edited
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.title
    document.title = doc.name
    // Escape closes the export, except while editing text (edits are kept either way)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !(e.target as HTMLElement)?.isContentEditable && closeRef.current()
    window.addEventListener('keydown', esc)
    ref.current?.closest<HTMLElement>('.export-root')?.focus()
    return () => {
      document.title = prev
      window.removeEventListener('keydown', esc)
    }
  }, [doc.name])
  const print = () => {
    if (overflow.length && !confirm(`Page ${overflow.join(' and ')} is too long and will be cut off in the PDF. Save anyway?`)) return
    window.print()
  }
  return createPortal(
    <div className={`export-root doc-${style}`} role="dialog" aria-modal="true" aria-label="Your assignment" tabIndex={-1}>
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
          <input type="checkbox" checked={appendix} onChange={(e) => setAppendix(e.target.checked)} /> Appendix: all fourteen directions
        </label>
        {appendix && (
          <label className="chk">
            <input type="checkbox" checked={scores} onChange={(e) => setScores(e.target.checked)} /> Show Athena’s scores
          </label>
        )}
        <span className={`chars ${total > LIMIT ? 'over' : ''}`} title="The course template allows 1,500 characters for Context, Innovation and Results together">
          {SECTIONS.map(([k, label]) => `${label} ${chars[k] ?? 0}`).join(' · ')} = {total}/{LIMIT} characters
        </span>
        {overflow.length > 0 && <span className="chars over">Page {overflow.join(' and ')} is too long: shorten some text.</span>}
        <span className="grow" />
        <button className="btn small" onClick={resetEdits} title="Start the document again from your voyage answers">
          Rebuild from answers
        </button>
        <button className="btn primary small" onClick={print}>
          Save as PDF
        </button>
        <button className="btn small" onClick={onClose}>
          Close
        </button>
        <small className="hint-line">
          Click any text to edit it; your edits are kept. In the print window choose “Save as PDF”, landscape, margins “None”, and tick “Background graphics”.
        </small>
      </div>
      <div className="export-pages" ref={ref} onInput={onInput}>
        <AssignmentDoc key={version} doc={doc} appendix={appendix} scores={scores} authors={authors} group={group} />
      </div>
    </div>,
    document.body,
  )
}
