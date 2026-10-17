import { Fragment, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { audio } from '../audio/engine'
import { directionById, type Direction, type Step } from '../content/directions'
import { CONTRIBS, emptyLanding, flattenLanding, missingFor, optionsFor, summaryOf, type Landing, type LandingValue, type NarrowsAnswer, type StepContext } from '../content/landing'
import { voyageById } from '../content/voyages'
import { landedIn, useGame, type AeolusAnswer, type LemnosAnswer, type OlympusAnswer, type TroyAnswer } from '../store'
import { Field, GradeView, SignToggle, wordCount } from './common'
import { useDraft, useGradedTask } from './useTask'
import { AttributeEditor, CurveChart } from './ValueCurve'

// ---------------------------------------------------------------- shared bits

function HintBox({ hints }: { hints: string[] }) {
  if (!hints.length) return null
  return (
    <>
      {hints.map((h, i) => (
        <div className="hint" key={i}>
          <b>Athena asks:</b> {h}
        </div>
      ))}
    </>
  )
}

function SubmitRow({
  busy,
  missing,
  onSubmit,
  onHint,
  hintsLeft,
  hintBusy,
  label = 'Submit to Athena',
}: {
  busy: boolean
  missing: string[]
  onSubmit: () => void
  onHint?: () => void
  hintsLeft: number
  hintBusy: boolean
  label?: string
}) {
  const [tried, setTried] = useState(false)
  return (
    <>
      <div className="submit-row">
        <button
          className="btn primary"
          disabled={busy}
          onClick={() => {
            if (missing.length) {
              setTried(true)
              audio.wrong()
              return
            }
            onSubmit()
          }}
        >
          {busy ? 'Athena is reading\u2026' : label}
        </button>
        {onHint && (
          <button className="btn small" disabled={hintBusy || hintsLeft <= 0} onClick={onHint} title="Athena reads your draft and asks about its weakest point">
            {hintBusy ? 'Athena is reading your draft\u2026' : hintsLeft > 0 ? `Ask Athena for a nudge (${hintsLeft} left)` : 'No nudges left'}
          </button>
        )}
      </div>
      {tried && missing.length > 0 && (
        <div className="hint" role="alert">
          <b>Before Athena can review it:</b>
          <ul className="missing">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

const flatten = (o: Record<string, unknown>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n')

// ---------------------------------------------------------------- Troy

export function TroyTask() {
  const voyage = voyageById(useGame((s) => s.voyageId))
  const troy = useGame((s) => s.troy)
  const saveTroy = useGame((s) => s.saveTroy)
  const [a, setA] = useDraft<TroyAnswer>('troy', () => troy!.answer)
  const task = useGradedTask('troy', troy?.grades ?? [])
  const own = voyage.id === 'own'
  const up = (p: Partial<TroyAnswer>) => setA((x) => ({ ...x, ...p }))
  const missing = [
    wordCount(a.offer) < 3 && 'Describe what is offered (at least 3 words).',
    a.attributes.some((x) => !x.name.trim()) && `Name every value attribute (${a.attributes.map((x, i) => (x.name.trim() ? null : i + 1)).filter(Boolean).join(', ')} still empty; the grey text is only an example).`,
    wordCount(a.frustration) < 4 && 'Write the customer frustration (at least 4 words).',
    wordCount(a.orthodoxy) < 4 && 'Write the industry orthodoxy (at least 4 words).',
  ].filter(Boolean) as string[]
  const req = { kind: 'troy' as const, answer: flatten({ ...a, attributes: a.attributes.map((x) => `${x.name} ${x.level}/5`).join(', ') }), extra: a }

  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Step 1</span> The benchmark, not your new idea
        </p>
        <h2>Troy: the traditional model</h2>
        <p className="lede">
          Describe the business model <b>as it works today</b>, the way most of the industry does it. No new ideas yet: this is the benchmark you will reinvent on the islands and compare against at the forge.{' '}
          {own ? '' : 'This demo ship comes with Troy filled in, insights included: read it, adjust anything you disagree with, then submit.'}
        </p>
      </div>
      <div className="panel-body">
        <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="section">
            <h3>
              <span className="badge p">P</span> Value proposition today
            </h3>
            <Field single label="What is offered" value={a.offer} onChange={(v) => up({ offer: v })} placeholder="e.g. Premium bikes sold in city stores" />
            <div className="grid2">
              <Field single label="Who uses it" value={a.user} onChange={(v) => up({ user: v })} />
              <Field single label="Who decides to buy" value={a.decider} onChange={(v) => up({ decider: v })} />
              <Field single label="Who pays" value={a.payer} onChange={(v) => up({ payer: v })} />
              <Field single label="At what price" value={a.price} onChange={(v) => up({ price: v })} />
            </div>
          </div>
          <div className="section">
            <h3>The value curve today</h3>
            <p className="lede" style={{ marginTop: 0 }}>
              Five attributes customers compare offers on, each rated 1 (weak) to 5 (strong).
            </p>
            <CurveChart names={a.attributes.map((x) => x.name)} reference={a.attributes.map((x) => x.level)} />
            <AttributeEditor attributes={a.attributes} onChange={(attributes) => up({ attributes })} editableNames={own} />
          </div>
          <div className="section">
            <h3>Two insights</h3>
            <Field
              label="A customer frustration"
              limit={25}
              value={a.frustration}
              onChange={(v) => up({ frustration: v })}
              placeholder="Start with a problem, not a solution. What annoys or costs customers today?"
            />
            <Field
              label="An industry orthodoxy"
              limit={25}
              value={a.orthodoxy}
              onChange={(v) => up({ orthodoxy: v })}
              placeholder="A belief every company in this industry takes for granted."
            />
            <Field label="A trend that threatens Troy (optional)" limit={20} value={a.trend} onChange={(v) => up({ trend: v })} />
          </div>
        </fieldset>
        <HintBox hints={task.hints} />
        {task.editing && (
          <SubmitRow
            busy={task.busy}
            missing={missing}
            onSubmit={() => task.submit(req, (g) => saveTroy(a, g))}
            onHint={() => task.ask(req)}
            hintsLeft={task.hintsLeft}
            hintBusy={task.hintBusy}
          />
        )}
        {task.last && !task.editing && (
          <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} onRetry={task.retry} busy={task.busy} />
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- islands

function shuffleFor(id: number, n: number) {
  const order = Array.from({ length: n }, (_, i) => i)
  let s = id * 9301 + 49297
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

function Quiz({ d }: { d: Direction }) {
  const check = useGame((s) => s.checks[d.id])
  const answerCheck = useGame((s) => s.answerCheck)
  const say = useGame((s) => s.say)
  const order = useMemo(() => shuffleFor(d.id, d.quiz.options.length), [d])
  return (
    <div className="section">
      <h3>
        Quick check <small className="count">1 point first try, 0.4 after</small>
      </h3>
      <p className="lede" style={{ marginTop: 0 }}>
        {d.quiz.question}
      </p>
      <div className="quiz">
        {order.map((oi) => {
          const right = oi === 0
          const isWrong = check?.wrong.includes(oi)
          const reveal = check?.done && right
          return (
            <button
              key={oi}
              className={`opt ${reveal ? 'right' : ''} ${isWrong ? 'wrong' : ''}`}
              disabled={check?.done || isWrong}
              onClick={() => {
                const first = !check?.wrong.length
                answerCheck(d.id, oi, right)
                if (right) {
                  if (first) {
                    audio.laurel()
                    say('Right first time: +1 laurel and a full Knowledge point.')
                  } else audio.success()
                } else audio.wrong()
              }}
            >
              {d.quiz.options[oi]}
            </button>
          )
        })}
      </div>
      {check?.done && (
        <div className="why">
          <b>{check.firstTry ? 'Right first time (+1). ' : 'Found it (+0.4). '}</b>
          {d.quiz.why}
        </div>
      )}
      {!check?.done && !!check?.wrong.length && <div className="why">Not quite. Think about the mechanism of the direction, not just the words of the case, and try again.</div>}
    </div>
  )
}

function stepContext(): StepContext {
  const s = useGame.getState()
  return {
    attributes: s.troy?.answer.attributes.map((x) => x.name) ?? [],
    chain: s.narrows?.chain ?? [],
    resources: s.narrows?.resources ?? [],
  }
}

function StepInput({ step, n, value, onChange }: { step: Step; n: string; value: LandingValue | undefined; onChange: (v: LandingValue) => void }) {
  const label = (
    <>
      {n && <b className="step-n">{n}</b>}
      {step.label}
    </>
  )
  switch (step.kind) {
    case 'pick': {
      const opts = optionsFor(step, stepContext())
      if (!opts.length) return <Field single label={label} value={String(value ?? '')} onChange={onChange} />
      return (
        <div className="field">
          <div className="field-label">{label}</div>
          <div className="checks">
            {opts.map((o) => (
              <button key={o} type="button" className="pick" aria-pressed={value === o} onClick={() => onChange(o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )
    }
    case 'text':
      return <Field single={step.short} label={label} limit={step.short ? undefined : step.max} rows={3} value={String(value ?? '')} onChange={onChange} placeholder={step.placeholder} />
    case 'slots': {
      const arr = (value as string[]) ?? step.slots.map(() => '')
      return (
        <div className="field">
          <div className="field-label">{label}</div>
          <div className={`slots n${step.slots.length}`}>
            {step.slots.map((sl, j) => (
              <label key={sl.label} className="slot">
                <small>{sl.label}</small>
                <textarea rows={2} value={arr[j] ?? ''} placeholder={sl.placeholder} onChange={(e) => onChange(arr.map((x, k) => (k === j ? e.target.value : x)))} />
              </label>
            ))}
          </div>
        </div>
      )
    }
    case 'signs': {
      const r = (value as Record<string, string>) ?? {}
      return (
        <div className="field">
          <div className="field-label stack">
            <span>{label}</span>
            <small className="legend">+ better, 0 no change, {'−'} worse</small>
          </div>
          {CONTRIBS.map((k) => (
            <div className="contrib-row" key={k}>
              <span style={{ textTransform: 'capitalize' }}>
                <span className="badge c">C</span> {k}
              </span>
              <SignToggle label={k} value={r[k] ?? ''} onChange={(sign) => onChange({ ...r, [k]: sign })} />
            </div>
          ))}
        </div>
      )
    }
    case 'checks': {
      const arr = (value as string[]) ?? []
      return (
        <div className="field">
          <div className="field-label">{label}</div>
          <div className="checks">
            {step.options.map((o) => (
              <button key={o} type="button" className="pick" aria-pressed={arr.includes(o)} onClick={() => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )
    }
  }
}

function IslandWork({ d }: { d: Direction }) {
  const record = useGame((s) => s.landings[d.id])
  const saveLanding = useGame((s) => s.saveLanding)
  const [a, setA] = useDraft<Landing>(`land${d.id}`, () => record?.answer ?? emptyLanding(d))
  const task = useGradedTask(`land${d.id}`, record?.grades ?? [])
  const missing = missingFor(d, a)
  const req = { kind: 'landing' as const, directionId: d.id, answer: flattenLanding(d, a), extra: a }
  return (
    <div className="section" id="landing">
      <h3>Apply direction {d.id} to Troy</h3>
      <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
        {d.steps.map((st, i) => (
          <StepInput key={st.id} step={st} n={d.steps.length > 1 ? `${i + 1}` : ''} value={a[st.id]} onChange={(v) => setA((x) => ({ ...x, [st.id]: v }))} />
        ))}
      </fieldset>
      <HintBox hints={task.hints} />
      {task.editing && (
        <SubmitRow
          busy={task.busy}
          missing={missing}
          onSubmit={() => task.submit(req, (g) => saveLanding(d.id, a, g))}
          onHint={() => task.ask(req)}
          hintsLeft={task.hintsLeft}
          hintBusy={task.hintBusy}
        />
      )}
      {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} onRetry={task.retry} busy={task.busy} />}
    </div>
  )
}

export function IslandTask({ id }: { id: number }) {
  const d = directionById(id)
  const check = useGame((s) => s.checks[id])
  const sea = d.pillar === 'proposition' ? 'Sea of the Value Proposition' : 'Sea of the Value Architecture'
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className={`badge ${d.pillar === 'proposition' ? 'p' : 'a'}`}>{d.pillar === 'proposition' ? 'P' : 'A'}</span>
          Direction {d.id} of 14, {sea}
        </p>
        <h2>{d.name}</h2>
        <p className="lede">{d.definition}</p>
      </div>
      <div className="panel-body">
        <div className="section">
          <h3>From the course</h3>
          <div className="case">
            <b>{d.caseTitle}.</b> {d.caseText}
          </div>
        </div>
        <Quiz d={d} />
        {check?.done ? (
          <IslandWork d={d} />
        ) : (
          <p className="count locked-note">Answer the quick check to unlock this island’s {d.steps.length === 1 ? 'question' : `${d.steps.length} questions`} about your business.</p>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Narrows

const padTo = (xs: string[], n: number) => [...xs, ...Array(Math.max(0, n - xs.length)).fill('')].slice(0, Math.max(n, xs.length))

export function NarrowsTask() {
  const narrows = useGame((s) => s.narrows)
  const saveNarrows = useGame((s) => s.saveNarrows)
  const [a, setA] = useDraft<NarrowsAnswer>('narrows', () => ({
    chain: padTo(narrows?.chain ?? [], 6),
    resources: padTo(narrows?.resources ?? [], 3),
    partners: narrows?.partners ?? '',
  }))
  const [editing, setEditing] = useState(!narrows)
  const [tried, setTried] = useState(false)
  const filled = (xs: string[]) => xs.filter((x) => x.trim()).length
  const missing = [
    filled(a.chain) < 4 && `Name at least 4 steps of the value chain (${filled(a.chain)} so far).`,
    filled(a.resources) < 2 && `Name at least 2 key resources or competences (${filled(a.resources)} so far).`,
  ].filter(Boolean) as string[]
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Passage</span> Between the two seas
        </p>
        <h2>The Narrows</h2>
        <p className="lede">
          You leave the Sea of the Value Proposition (what you offer, to whom, at what price) for the Sea of the Value Architecture (how you build and deliver it). Before Scylla and Charybdis, chart how Troy is built today: the next seven islands work on these steps and resources.
        </p>
      </div>
      <div className="panel-body">
        {editing ? (
          <>
            <div className="section">
              <h3>
                <span className="badge a">A</span> Troy’s value chain, in 4 to 6 steps
              </h3>
              <p className="lede" style={{ marginTop: 0 }}>
                From raw input to the customer and after: short verb phrases, e.g. “Design”, “Source materials”, “Make”, “Sell”, “Deliver”, “Support”.
              </p>
              <ol className="chain-list">
                {a.chain.map((x, i) => (
                  <li key={i}>
                    <input type="text" value={x} placeholder={i < 4 ? 'required' : 'optional'} aria-label={`Value chain step ${i + 1}`} onChange={(e) => setA((v) => ({ ...v, chain: v.chain.map((y, j) => (j === i ? e.target.value : y)) }))} />
                  </li>
                ))}
              </ol>
            </div>
            <div className="section">
              <h3>Key resources and competences</h3>
              <div className="grid2">
                {a.resources.map((x, i) => (
                  <input key={i} type="text" value={x} placeholder={['e.g. brand', 'e.g. a patent or know-how', 'e.g. a network (optional)'][i]} aria-label={`Resource ${i + 1}`} onChange={(e) => setA((v) => ({ ...v, resources: v.resources.map((y, j) => (j === i ? e.target.value : y)) }))} />
                ))}
              </div>
              <Field single label="Key partners today (optional)" value={a.partners} onChange={(v) => setA((x) => ({ ...x, partners: v }))} placeholder="e.g. suppliers, distributors, installers" />
            </div>
            <div className="submit-row">
              <button
                className="btn primary"
                onClick={() => {
                  if (missing.length) {
                    setTried(true)
                    audio.wrong()
                    return
                  }
                  saveNarrows({ chain: a.chain.map((x) => x.trim()).filter(Boolean), resources: a.resources.map((x) => x.trim()).filter(Boolean), partners: a.partners.trim() })
                  setEditing(false)
                  audio.success()
                }}
              >
                Chart the course
              </button>
            </div>
            {tried && missing.length > 0 && (
              <div className="hint" role="alert">
                <ul className="missing">
                  {missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          narrows && (
            <div className="section">
              <h3>
                <span className="badge a">A</span> Troy’s value chain
              </h3>
              <ol className="chain-view">
                {narrows.chain.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <p className="lede">
                <b>Resources:</b> {narrows.resources.join(', ')}
                {narrows.partners ? (
                  <>
                    <br />
                    <b>Partners:</b> {narrows.partners}
                  </>
                ) : null}
              </p>
              <button className="btn small" onClick={() => setEditing(true)}>
                Edit the chart
              </button>
            </div>
          )
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Aeolus

export function AeolusTask() {
  const landings = useGame((s) => s.landings)
  const aeolus = useGame((s) => s.aeolus)
  const saveAeolus = useGame((s) => s.saveAeolus)
  const pIds = useGame(useShallow((s) => landedIn(s, 'proposition')))
  const aIds = useGame(useShallow((s) => landedIn(s, 'architecture')))
  const [a, setA] = useDraft<AeolusAnswer>('aeolus', () => aeolus?.answer ?? { p: null, a: null, sentence: '' })
  const idea = (id: number | null) => (id ? summaryOf(directionById(id), landings[id]?.answer).replace(/\.$/, '') : '')
  const [rolling, setRolling] = useState(false)
  const task = useGradedTask('aeolus', aeolus?.grades ?? [])
  const missingSea = pIds.length === 0 ? 'proposition' : aIds.length === 0 ? 'architecture' : null

  const template = (p: number | null, x: number | null) =>
    p && x ? `Because [architecture change: ${idea(x).slice(0, 60)}], we can offer [proposition change: ${idea(p).slice(0, 60)}] to [who], which makes [one contribution] go [+ or −].` : ''

  const choose = (p: number | null, x: number | null) => setA((s) => ({ p, a: x, sentence: !s.sentence || s.sentence === template(s.p, s.a) ? template(p, x) : s.sentence }))

  const letAeolus = () => {
    setRolling(true)
    audio.bones()
    audio.storm(true)
    setTimeout(() => {
      choose(pIds[Math.floor(Math.random() * pIds.length)], aIds[Math.floor(Math.random() * aIds.length)])
      setRolling(false)
      audio.storm(false)
    }, 700)
  }

  if (missingSea) {
    return (
      <>
        <div className="panel-head">
          <p className="kicker">
            <span className="badge ink">Test</span> Does it hold together?
          </p>
          <h2>Aeolus, keeper of the winds</h2>
        </div>
        <div className="panel-body">
          <div className="hint">
            <b>Aeolus says:</b> the winds need your ideas from both seas. Use the voyage ribbon at the top to return to any island you have not finished.
          </div>
        </div>
      </>
    )
  }

  const missing = [
    !a.p && 'Pick one idea from the west wind (value proposition).',
    !a.a && 'Pick one idea from the east wind (value architecture).',
    a.sentence.includes('[') && 'Replace every [bracket] in the sentence with your own words.',
    wordCount(a.sentence) < 12 && 'Write the combined plan in at least 12 words.',
  ].filter(Boolean) as string[]
  const req = {
    kind: 'aeolus' as const,
    answer: `Proposition idea (direction ${a.p}): ${idea(a.p)}\nArchitecture idea (direction ${a.a}): ${idea(a.a)}\nCombined sentence: ${a.sentence}`,
    extra: a,
  }
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Test</span> Does it hold together?
        </p>
        <h2>Aeolus, keeper of the winds</h2>
        <p className="lede">
          A business model only works when what you promise (value proposition) and how you deliver it (value architecture) hold together. Pick the strongest idea from each sea and tie them into one plan, or the winds will blow you off course. Your plan becomes the core of the business model you forge on Lemnos.
        </p>
      </div>
      <div className="panel-body">
        <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="section">
            <h3>
              <span className="badge p">P</span> West wind: your proposition ideas
            </h3>
            <div className="idea-cards">
              {pIds.map((id) => (
                <button key={id} className="god" aria-pressed={a.p === id} onClick={() => choose(id, a.a)}>
                  <b>{id}.</b> {idea(id)}
                </button>
              ))}
            </div>
          </div>
          <div className="section">
            <h3>
              <span className="badge a">A</span> East wind: your architecture ideas
            </h3>
            <div className="idea-cards">
              {aIds.map((id) => (
                <button key={id} className="god" aria-pressed={a.a === id} onClick={() => choose(a.p, id)}>
                  <b>{id}.</b> {idea(id)}
                </button>
              ))}
            </div>
          </div>
          <div className="submit-row">
            <button className="btn small" onClick={letAeolus} disabled={rolling}>
              Can't choose? Let Aeolus throw the knucklebones
            </button>
            <span className={`bones ${rolling ? 'roll' : ''}`} aria-hidden="true">
              <span>{'⚄'}</span>
              <span>{'⚂'}</span>
            </span>
          </div>
          <Field
            label="Your combined plan, in one sentence"
            limit={45}
            rows={4}
            value={a.sentence}
            onChange={(v) => setA((s) => ({ ...s, sentence: v }))}
            placeholder="Because we [architecture change], we can offer [proposition change] to [who], which makes [contribution] go [+/-]."
          />
        </fieldset>
        <HintBox hints={task.hints} />
        {task.editing && (
          <SubmitRow
            busy={task.busy}
            missing={missing}
            onSubmit={() => task.submit(req, (g) => saveAeolus(a, g))}
            onHint={() => task.ask(req)}
            hintsLeft={task.hintsLeft}
            hintBusy={task.hintBusy}
          />
        )}
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} onRetry={task.retry} busy={task.busy} />}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Lemnos

export const ZONES = [
  { id: 'game-changing', label: 'Game-changing', text: 'More value, lower price' },
  { id: 'high-end', label: 'High-end differentiation', text: 'More value, higher price' },
  { id: 'low-end', label: 'Low-end differentiation', text: 'Less value, much lower price' },
  { id: 'cost-leadership', label: 'Cost leadership', text: 'Same value, lower cost and price' },
  { id: 'non-viable', label: 'Non-viable', text: 'Less value, higher price' },
]

export const INDICATORS = [
  { group: 'Financial', items: [['revenue', 'Revenue'], ['costs', 'Costs'], ['capital', 'Capital employed']] },
  { group: 'Environmental', items: [['ghg', 'GHG emissions'], ['pollutants', 'Release of pollutants'], ['resources', 'Use of scarce resources']] },
  { group: 'Societal', items: [['employability', 'Employability'], ['quality', 'Quality of life'], ['fairness', 'Fair value sharing']] },
] as const

export function LemnosTask() {
  const troy = useGame((s) => s.troy!.answer)
  const lemnos = useGame((s) => s.lemnos)
  const island10 = useGame((s) => s.landings[10]?.answer.contrib) as Record<string, string> | undefined
  const aeolus = useGame((s) => s.aeolus?.answer)
  const saveLemnos = useGame((s) => s.saveLemnos)
  const [a, setA] = useDraft<LemnosAnswer>('lemnos', () => {
    if (lemnos) return lemnos.answer
    return {
      name: '',
      pitch: aeolus?.sentence ?? '',
      curve: troy.attributes.map((x) => x.level),
      zone: '',
      indicators: {
        revenue: '',
        costs: '',
        capital: '',
        ghg: '',
        pollutants: '',
        resources: '',
        employability: '',
        quality: '',
        fairness: '',
      },
      antagonism: '',
    }
  })
  const task = useGradedTask('lemnos', lemnos?.grades ?? [])
  const before = troy.attributes.map((x) => x.level)
  const lowered = a.curve.some((v, i) => v < before[i])
  const missing = [
    !a.name.trim() && 'Give your business model a name.',
    wordCount(a.pitch) < 8 && 'Write a pitch of at least 8 words.',
    !a.zone && 'Choose a position on the perceived value versus price map.',
    !Object.values(a.indicators).every(Boolean) && 'Set all nine contribution indicators to +, 0 or \u2212.',
    wordCount(a.antagonism) < 5 && 'Name the main antagonism (at least 5 words).',
  ].filter(Boolean) as string[]
  const req = {
    kind: 'lemnos' as const,
    answer: [
      `Name: ${a.name}`,
      `Pitch: ${a.pitch}`,
      `Value curve (attribute: before -> after): ${troy.attributes.map((x, i) => `${x.name}: ${before[i]} -> ${a.curve[i]}`).join('; ')}`,
      `Positioning zone: ${a.zone}`,
      `Contributions: ${Object.entries(a.indicators).map(([k, v]) => `${k} ${v}`).join(', ')}`,
      `Main antagonism: ${a.antagonism}`,
    ].join('\n'),
    extra: { ...a, before },
  }
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Forge</span> Crystallise your new business model
        </p>
        <h2>Lemnos, Hephaestus' forge</h2>
        <p className="lede">Hammer your ideas into one business model: a name, a pitch, a new value curve, a position on the market and its contributions.</p>
      </div>
      <div className="panel-body">
        <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
          <Field single label="A (fun) name for your new business model" value={a.name} onChange={(v) => setA({ ...a, name: v })} />
          <Field label="One-line pitch" limit={35} value={a.pitch} onChange={(v) => setA({ ...a, pitch: v })} placeholder="For [who], [name] offers [what], unlike Troy, because [how]." />
          <div className="section">
            <h3>
              <span className="badge p">P</span> New value curve
            </h3>
            <CurveChart names={troy.attributes.map((x) => x.name)} reference={before} next={a.curve} />
            <AttributeEditor
              attributes={troy.attributes.map((x, i) => ({ name: x.name, level: a.curve[i] }))}
              onChange={(attrs) => setA({ ...a, curve: attrs.map((x) => x.level) })}
              editableNames={false}
            />
            {!lowered && <div className="hint">Not everything can be better. Which attribute do you deliberately lower to afford the new ones?</div>}
          </div>
          <div className="section">
            <h3>Perceived value versus price</h3>
            <div className="zones">
              {ZONES.map((z) => (
                <button key={z.id} className="zone" aria-pressed={a.zone === z.id} onClick={() => setA({ ...a, zone: z.id })}>
                  <b>{z.label}</b>
                  {z.text}
                </button>
              ))}
            </div>
          </div>
          <div className="section">
            <h3>
              <span className="badge c">C</span> Contributions, nine indicators
            </h3>
            {island10 && (
              <p className="count" style={{ marginTop: 0 }}>
                On island 10 you rated one step change: financial {island10.financial}, environmental {island10.environmental}, societal {island10.societal}. Now rate the whole model.
              </p>
            )}
            <table className="ind-table">
              <tbody>
                {INDICATORS.map((g) => (
                  <Fragment key={g.group}>
                    <tr>
                      <th colSpan={2}>{g.group}</th>
                    </tr>
                    {g.items.map(([k, label]) => (
                      <tr key={k}>
                        <td>{label}</td>
                        <td>
                          <SignToggle label={label} value={a.indicators[k] ?? ''} onChange={(v) => setA({ ...a, indicators: { ...a.indicators, [k]: v } })} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <Field label="The main antagonism" limit={30} value={a.antagonism} onChange={(v) => setA({ ...a, antagonism: v })} placeholder="Where do financial, environmental and societal contributions pull against each other?" />
          </div>
        </fieldset>
        <HintBox hints={task.hints} />
        {task.editing && (
          <SubmitRow
            busy={task.busy}
            missing={missing}
            onSubmit={() => task.submit(req, (g) => saveLemnos(a, g))}
            onHint={() => task.ask(req)}
            hintsLeft={task.hintsLeft}
            hintBusy={task.hintBusy}
          />
        )}
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} onRetry={task.retry} busy={task.busy} />}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Olympus

export const GODS = [
  { id: 'hermes', name: 'Hermes, god of trade', q: 'Why would the payer switch from what they use today? What do they give up?' },
  { id: 'poseidon', name: 'Poseidon, the incumbent', q: 'When Troy’s champion copies you next year, what makes you hard to imitate?' },
  { id: 'demeter', name: 'Demeter, the earth', q: 'Which environmental indicator gets worse because of your model, and what will you do about it?' },
  { id: 'hestia', name: 'Hestia, the hearth', q: 'Who in society loses out (employees, suppliers, communities), and is the value shared fairly?' },
]

export function OlympusTask() {
  const olympus = useGame((s) => s.olympus)
  const lemnos = useGame((s) => s.lemnos?.answer)
  const saveOlympus = useGame((s) => s.saveOlympus)
  const [a, setA] = useDraft<OlympusAnswer>('olympus', () => olympus?.answer ?? { god: '', answer: '', assumption: '', mvp: '', stake: '' })
  const task = useGradedTask('olympus', olympus?.grades ?? [])
  const god = GODS.find((g) => g.id === a.god)
  const missing = [
    !god && 'Choose one god to answer.',
    god && wordCount(a.answer) < 8 && 'Answer the god in at least 8 words.',
    wordCount(a.assumption) < 4 && 'State your riskiest assumption (at least 4 words).',
    wordCount(a.mvp) < 5 && 'Describe your cheapest test (at least 5 words).',
    wordCount(a.stake) < 3 && 'Say what users put at stake and your threshold.',
  ].filter(Boolean) as string[]
  const req = {
    kind: 'olympus' as const,
    answer: [
      `Business model: ${lemnos?.name}: ${lemnos?.pitch}`,
      `God's challenge (${god?.name}): ${god?.q}`,
      `Answer: ${a.answer}`,
      `Riskiest assumption: ${a.assumption}`,
      `MVP: ${a.mvp}`,
      `What users put at stake, and the threshold: ${a.stake}`,
    ].join('\n'),
    extra: a,
  }
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Council</span> Pressure-test, then design the test
        </p>
        <h2>The council on Olympus</h2>
        <p className="lede">
          In the Odyssey, the gods meet on Olympus to decide whether Odysseus may go home. Here they question {lemnos?.name ? `“${lemnos.name}”` : 'your model'}. Answer one of them, then tell Zeus how you would test it cheaply.
        </p>
      </div>
      <div className="panel-body">
        <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="section">
            <h3>Choose a god to answer</h3>
            <div className="gods">
              {GODS.map((g) => (
                <button key={g.id} className="god" aria-pressed={a.god === g.id} onClick={() => setA({ ...a, god: g.id })}>
                  <b>{g.name}</b>
                  <br />
                  {g.q}
                </button>
              ))}
            </div>
            {god && <Field label={`Your answer to ${god.name.split(',')[0]}`} limit={50} rows={3} value={a.answer} onChange={(v) => setA({ ...a, answer: v })} />}
          </div>
          <div className="section">
            <h3>Zeus asks for a test</h3>
            <p className="lede" style={{ marginTop: 0 }}>
              Fail fast, fail small, learn big. A minimum viable product is low-tech, low-scale and low-risk, and tests one hypothesis at a time.
            </p>
            <Field label="Your riskiest assumption" limit={20} value={a.assumption} onChange={(v) => setA({ ...a, assumption: v })} />
            <Field label="The cheapest test (your MVP)" limit={30} value={a.mvp} onChange={(v) => setA({ ...a, mvp: v })} placeholder="e.g. a landing page, a manual pilot with 10 customers, a fake door" />
            <Field label="What users put at stake, and the number that convinces you" limit={20} value={a.stake} onChange={(v) => setA({ ...a, stake: v })} placeholder="e.g. 30 of 100 visitors pay a €10 deposit" />
          </div>
        </fieldset>
        <HintBox hints={task.hints} />
        {task.editing && (
          <SubmitRow
            busy={task.busy}
            missing={missing}
            onSubmit={() => task.submit(req, (g) => saveOlympus(a, g))}
            onHint={() => task.ask(req)}
            hintsLeft={task.hintsLeft}
            hintBusy={task.hintBusy}
          />
        )}
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} onRetry={task.retry} busy={task.busy} />}
      </div>
    </>
  )
}
