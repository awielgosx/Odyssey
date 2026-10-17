import { Fragment, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { audio } from '../audio/engine'
import { DIRECTIONS, directionById, type Direction, type Step } from '../content/directions'
import { CONTRIBS, emptyLanding, flattenLanding, isNoFit, isOther, junkFields, missingFor, optionsFor, OTHER, stripOther, summaryOf, type Landing, type LandingValue, type NarrowsAnswer, type StepContext } from '../content/landing'
import { voyageById } from '../content/voyages'
import { freeTravel, landedIn, useGame, type AeolusAnswer, type LemnosAnswer, type OlympusAnswer, type TroyAnswer } from '../store'
import { Field, GradeView, SignToggle, wordCount } from './common'
import { useDraft, useGradedTask } from './useTask'
import { ValueCurveEditor } from './ValueCurve'

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
    a.attributes.length < 3 && 'Your value curve needs at least 3 attributes.',
    a.attributes.some((x) => !x.name.trim()) && `Name every value attribute (${a.attributes.map((x, i) => (x.name.trim() ? null : i + 1)).filter(Boolean).join(', ')} still empty; the grey text is only an example).`,
    wordCount(a.frustration) < 4 && 'Write the customer frustration (at least 4 words).',
    wordCount(a.orthodoxy) < 4 && 'Write the industry orthodoxy (at least 4 words).',
    junkFields([a.offer, a.user, a.decider, a.payer, a.price, a.frustration, a.orthodoxy, a.trend, ...a.attributes.map((x) => x.name)]) && 'Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.',
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
            <h3>
              <span className="badge p">P</span> The value curve today
            </h3>
            <p className="vc-intro">
              The course’s key tool for the value proposition. {own ? 'Name the attributes customers compare offers on (3 to 8), from their point of view, then drag' : 'Drag'} each point to rate Troy from 1 (weak) to 5 (strong) against what customers can get elsewhere. You will redraw this curve at the forge.
            </p>
            <ValueCurveEditor attributes={a.attributes} onChange={(attributes) => up({ attributes })} editableNames={own} currentLabel="Troy today" />
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
        Quick check <small className="count">1 point first try, 0.4 second try, then 0</small>
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
          <b>{check.wrong.length === 0 ? 'Right first time (+1). ' : check.wrong.length === 1 ? 'Second try (+0.4). ' : 'Found it, but no points this time. '}</b>
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
      const other = isOther(value)
      return (
        <div className="field">
          <div className="field-label">{label}</div>
          <div className="checks">
            {opts.map((o) => (
              <button key={o} type="button" className="pick" aria-pressed={value === o} onClick={() => onChange(o)}>
                {o}
              </button>
            ))}
            {step.other && (
              <button type="button" className="pick" aria-pressed={other} onClick={() => !other && onChange(OTHER)}>
                Something else…
              </button>
            )}
          </div>
          {other && <input type="text" className="other-input" autoFocus value={stripOther(String(value))} placeholder="Say what, in a few words" aria-label="Something else" onChange={(e) => onChange(OTHER + e.target.value)} />}
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
  const nofit = isNoFit(a)
  const missing = missingFor(d, a)
  const req = { kind: 'landing' as const, directionId: d.id, answer: flattenLanding(d, a), extra: a }
  return (
    <div className="section" id="landing">
      <h3>Apply direction {d.id} to Troy</h3>
      <div className="why-box">
        <b>Why these questions?</b> {d.why}
      </div>
      <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="seg fit-toggle" role="group" aria-label="Does this direction fit your business?">
          <button type="button" aria-pressed={!nofit} onClick={() => setA((x) => ({ ...x, _mode: 'fit' }))}>
            I have an idea
          </button>
          <button type="button" aria-pressed={nofit} onClick={() => setA((x) => ({ ...x, _mode: 'nofit' }))}>
            This direction doesn’t fit my business
          </button>
        </div>
        {nofit ? (
          <Field
            label="Why doesn’t it fit? And what would have to change for it to fit?"
            limit={60}
            rows={4}
            value={String(a.nofit ?? '')}
            onChange={(v) => setA((x) => ({ ...x, nofit: v }))}
            placeholder="Use the direction’s logic: what in your business makes it fail here, and what would have to be true for it to work?"
          />
        ) : (
          d.steps.map((st, i) => <StepInput key={st.id} step={st} n={d.steps.length > 1 ? `${i + 1}` : ''} value={a[st.id]} onChange={(v) => setA((x) => ({ ...x, [st.id]: v }))} />)
        )}
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

const STEP_IDEAS = ['Research and design', 'Source materials', 'Produce', 'Quality control', 'Market', 'Sell', 'Deliver', 'Install or set up', 'Support customers', 'Repair', 'Take back or recycle']
const RESOURCE_IDEAS = ['Brand', 'Patents', 'Know-how', 'Customer data', 'Partner network', 'Facilities', 'Licences', 'Talent']

// An editable list: add, rename, reorder and remove rows; quick-add chips for common entries.
function ListBuilder({ items, onChange, min, max, ideas, label, placeholder }: { items: string[]; onChange: (xs: string[]) => void; min: number; max: number; ideas: string[]; label: string; placeholder: (i: number) => string }) {
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = (text = '') => items.length < max && onChange([...items.filter((x, i) => x.trim() || i < min), text].slice(0, max))
  return (
    <>
      <ol className="list-builder">
        {items.map((x, i) => (
          <li key={i}>
            <span className="lb-n">{i + 1}</span>
            <input type="text" value={x} placeholder={placeholder(i)} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((y, j) => (j === i ? e.target.value : y)))} />
            <span className="lb-tools">
              <button type="button" aria-label={`Move ${label} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                {'↑'}
              </button>
              <button type="button" aria-label={`Move ${label} ${i + 1} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                {'↓'}
              </button>
              <button type="button" aria-label={`Remove ${label} ${i + 1}`} disabled={items.length <= min} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                {'×'}
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="lb-add">
        <button type="button" className="link-btn" disabled={items.length >= max} onClick={() => add()}>
          + Add {label} ({items.length}/{max})
        </button>
        <span className="count">Quick add:</span>
        {ideas
          .filter((idea) => !items.some((x) => x.trim().toLowerCase() === idea.toLowerCase()))
          .slice(0, 8)
          .map((idea) => (
            <button
              key={idea}
              type="button"
              className="pick small"
              disabled={items.length >= max && !items.some((x) => !x.trim())}
              onClick={() => {
                const empty = items.findIndex((x) => !x.trim())
                if (empty >= 0) onChange(items.map((y, j) => (j === empty ? idea : y)))
                else add(idea)
              }}
            >
              {idea}
            </button>
          ))}
      </div>
    </>
  )
}

export function NarrowsTask() {
  const narrows = useGame((s) => s.narrows)
  const saveNarrows = useGame((s) => s.saveNarrows)
  const [a, setA] = useDraft<NarrowsAnswer>('narrows', () => ({
    chain: padTo(narrows?.chain ?? [], 4),
    resources: padTo(narrows?.resources ?? [], 2),
    partners: narrows?.partners ?? '',
  }))
  const [editing, setEditing] = useState(!narrows)
  const [tried, setTried] = useState(false)
  const filled = (xs: string[]) => xs.filter((x) => x.trim()).length
  const missing = [
    filled(a.chain) < 4 && `Name at least 4 steps of the value chain (${filled(a.chain)} so far).`,
    filled(a.resources) < 2 && `Name at least 2 key resources or competences (${filled(a.resources)} so far).`,
    junkFields([...a.chain, ...a.resources, a.partners]) && 'Placeholder text like “test” is not a value chain. Name the real steps.',
  ].filter(Boolean) as string[]
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Passage</span> Between the two seas
        </p>
        <h2>The Narrows</h2>
        <p className="lede">
          You leave the Sea of the Value Proposition (what you offer, to whom, at what price) for the Sea of the Value Architecture (how you build and deliver it). Before Scylla and Charybdis, chart how Troy is built today: the next seven islands will ask you to change these very steps and resources.
        </p>
      </div>
      <div className="panel-body">
        {editing ? (
          <>
            <div className="section">
              <h3>
                <span className="badge a">A</span> Troy’s value chain, step by step
              </h3>
              <p className="lede" style={{ marginTop: 0 }}>
                Everything that happens from the first input to the customer and after, in order. Short verb phrases; 4 to 12 steps. Use the quick-add chips and rename them, and the arrows to reorder.
              </p>
              <ListBuilder items={a.chain} onChange={(chain) => setA((v) => ({ ...v, chain }))} min={4} max={12} ideas={STEP_IDEAS} label="step" placeholder={(i) => (i < 4 ? 'required' : 'optional')} />
            </div>
            <div className="section">
              <h3>Key resources and competences</h3>
              <p className="lede" style={{ marginTop: 0 }}>
                What Troy owns or masters that makes the model work: 2 to 6.
              </p>
              <ListBuilder items={a.resources} onChange={(resources) => setA((v) => ({ ...v, resources }))} min={2} max={6} ideas={RESOURCE_IDEAS} label="resource" placeholder={(i) => (i < 2 ? 'required' : 'optional')} />
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
                {narrows.chain.map((x, i) => (
                  <li key={i}>{x}</li>
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

const indicatorLabel = (key?: string) => {
  for (const g of INDICATORS) for (const [k, label] of g.items as readonly (readonly [string, string])[]) if (k === key) return label
  return ''
}

export function AeolusTask() {
  const landings = useGame((s) => s.landings)
  const aeolus = useGame((s) => s.aeolus)
  const saveAeolus = useGame((s) => s.saveAeolus)
  // only islands where the player had an idea can be combined; reasoned "doesn't fit" answers stay out
  // in demo voyages the teacher may jump straight here: drafted island answers count too
  const answerOf = (s: ReturnType<typeof useGame.getState>, id: number) => s.landings[id]?.answer ?? (freeTravel(s) ? (s.drafts[`land${id}`] as Landing | undefined) : undefined)
  const pool = (s: ReturnType<typeof useGame.getState>, sea: 'proposition' | 'architecture') =>
    (freeTravel(s) ? DIRECTIONS.filter((d) => d.pillar === sea && answerOf(s, d.id)).map((d) => d.id) : landedIn(s, sea)).filter((id) => !isNoFit(answerOf(s, id)))
  const pIds = useGame(useShallow((s) => pool(s, 'proposition')))
  const aIds = useGame(useShallow((s) => pool(s, 'architecture')))
  const [a, setA] = useDraft<AeolusAnswer>('aeolus', () => aeolus?.answer ?? { p: null, a: null, promise: '', enabler: '', link: '', who: '', gain: '', sentence: '' })
  const [advice, setAdvice] = useState('')
  const task = useGradedTask('aeolus', aeolus?.grades ?? [])
  const missingSea = pIds.length === 0 ? 'proposition' : aIds.length === 0 ? 'architecture' : null
  const idea = (id: number | null) => (id ? summaryOf(directionById(id), answerOf(useGame.getState(), id)).replace(/\.$/, '') : '')
  const score = (id: number) => landings[id]?.grades.at(-1)
  const gainLabel = indicatorLabel(a.gain)
  const assemble = (x: AeolusAnswer) =>
    x.enabler && x.promise ? `Because ${x.enabler.replace(/\.$/, '')}, we can promise ${x.promise.replace(/\.$/, '')}${x.who ? ` to ${x.who}` : ''}. It holds because ${x.link?.replace(/\.$/, '') || '…'}.${x.gain ? ` Biggest gain: ${indicatorLabel(x.gain).toLowerCase()}.` : ''}` : ''
  const up = (p: Partial<AeolusAnswer>) => setA((x) => ({ ...x, ...p, sentence: assemble({ ...x, ...p }) }))
  // choosing an idea prefills its text; the player then edits it into one coherent plan
  const pick = (side: 'p' | 'a', id: number) => up(side === 'p' ? { p: id, promise: idea(id) } : { a: id, enabler: idea(id) })

  const askAdvice = () => {
    audio.click()
    const best = (ids: number[]) => [...ids].sort((x, y) => (score(y)?.total ?? 0) - (score(x)?.total ?? 0))[0]
    const bp = best(pIds)
    const ba = best(aIds)
    setAdvice(
      `Your strongest-reviewed ideas are island ${bp} (${score(bp)?.total ?? 0}/6) for the proposition and island ${ba} (${score(ba)?.total ?? 0}/6) for the architecture. But a high score alone does not make a model: choose the architecture idea that actually makes your promise possible. Ask yourself: if island ${ba}’s change did not happen, could you still keep island ${bp}’s promise? If yes, look for a better pair.`,
    )
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
            <b>Aeolus says:</b> the winds need at least one real idea from each sea, and you marked every island in the Sea of the Value {missingSea === 'proposition' ? 'Proposition' : 'Architecture'} as not fitting. Sail back to the island that came closest (use the voyage ribbon at the top), switch it to “I have an idea”, and resubmit.
          </div>
        </div>
      </>
    )
  }

  const missing = [
    !a.p && 'Pick one idea from the west wind (value proposition).',
    !a.a && 'Pick one idea from the east wind (value architecture).',
    wordCount(a.promise ?? '') < 4 && 'Write the promise in at least 4 words.',
    wordCount(a.enabler ?? '') < 4 && 'Write what makes it possible in at least 4 words.',
    wordCount(a.link ?? '') < 8 && 'Explain the link in at least 8 words: why does the second make the first possible?',
    !a.gain && 'Choose the contribution that improves most.',
    junkFields([a.promise ?? '', a.enabler ?? '', a.link ?? '', a.who ?? '']) && 'Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.',
  ].filter(Boolean) as string[]
  const req = {
    kind: 'aeolus' as const,
    answer: [
      `Proposition idea (island ${a.p}, ${a.p ? directionById(a.p).name : ''}): ${a.promise}`,
      `Architecture idea (island ${a.a}, ${a.a ? directionById(a.a).name : ''}): ${a.enabler}`,
      `Why the architecture makes the promise possible: ${a.link}`,
      `For whom: ${a.who || '(not said)'}`,
      `Contribution that improves most: ${gainLabel}`,
    ].join('\n'),
    extra: { ...a, sentence: assemble(a) },
  }
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Test</span> Does it hold together?
        </p>
        <h2>Aeolus, keeper of the winds</h2>
        <p className="lede">
          A business model only works when what you promise (value proposition) and how you deliver it (value architecture) hold together. Choose one idea from each sea, then show how the second makes the first possible. Your plan becomes the core of the model you forge on Lemnos.
        </p>
      </div>
      <div className="panel-body">
        <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="section">
            <h3>
              <span className="badge p">P</span> West wind: the promise to customers
            </h3>
            <div className="idea-cards">
              {pIds.map((id) => (
                <button key={id} className="god" aria-pressed={a.p === id} onClick={() => pick('p', id)}>
                  <b>{id}.</b> {idea(id)} <small className="count">Athena {score(id)?.total ?? 0}/6</small>
                </button>
              ))}
            </div>
          </div>
          <div className="section">
            <h3>
              <span className="badge a">A</span> East wind: what makes it possible
            </h3>
            <div className="idea-cards">
              {aIds.map((id) => (
                <button key={id} className="god" aria-pressed={a.a === id} onClick={() => pick('a', id)}>
                  <b>{id}.</b> {idea(id)} <small className="count">Athena {score(id)?.total ?? 0}/6</small>
                </button>
              ))}
            </div>
          </div>
          <div className="submit-row">
            <button className="btn small" onClick={askAdvice}>
              Not sure which pair? Ask Athena for advice
            </button>
          </div>
          {advice && (
            <div className="hint">
              <b>Athena advises:</b> {advice}
            </div>
          )}
          {a.p && a.a && (
            <div className="section plan">
              <h3>Tie them into one plan</h3>
              <p className="count" style={{ marginTop: 0 }}>
                Your two ideas are filled in below: tighten the wording so they fit together, then write the link. The link is what Athena looks at most.
              </p>
              <Field label="The promise (from your proposition idea)" rows={2} value={a.promise ?? ''} onChange={(v) => up({ promise: v })} />
              <Field label="What makes it possible (from your architecture idea)" rows={2} value={a.enabler ?? ''} onChange={(v) => up({ enabler: v })} />
              <Field label="The link: why does the second make the first possible?" limit={35} rows={2} value={a.link ?? ''} onChange={(v) => up({ link: v })} placeholder="Without … we could not …, because …" />
              <div className="grid2">
                <Field single label="Who gains most (optional)" value={a.who ?? ''} onChange={(v) => up({ who: v })} placeholder="e.g. small fleets" />
                <label className="field">
                  <span>The contribution that improves most</span>
                  <select value={a.gain ?? ''} onChange={(e) => up({ gain: e.target.value })}>
                    <option value="">Choose…</option>
                    {INDICATORS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
              {assemble(a) && (
                <div className="case plan-preview">
                  <small className="count">Your plan, assembled</small>
                  <br />
                  {assemble(a)}
                </div>
              )}
            </div>
          )}
        </fieldset>
        <HintBox hints={task.hints} />
        {task.editing && (
          <SubmitRow
            busy={task.busy}
            missing={missing}
            onSubmit={() => task.submit(req, (g) => saveAeolus({ ...a, sentence: assemble(a) }, g))}
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
  const curve = troy.attributes.map((x, i) => a.curve[i] ?? x.level)
  const lowered = curve.some((v, i) => v < before[i])
  const lowered4 = useGame((s) => String(s.landings[4]?.answer.lower ?? '').replace(/^Other: /, ''))
  const missing = [
    !a.name.trim() && 'Give your business model a name.',
    wordCount(a.pitch) < 8 && 'Write a pitch of at least 8 words.',
    !a.zone && 'Choose a position on the perceived value versus price map.',
    !Object.values(a.indicators).every(Boolean) && 'Set all nine contribution indicators to +, 0 or \u2212.',
    wordCount(a.antagonism) < 5 && 'Name the main antagonism (at least 5 words).',
    junkFields([a.name, a.pitch, a.antagonism]) && 'Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.',
  ].filter(Boolean) as string[]
  const req = {
    kind: 'lemnos' as const,
    answer: [
      `Name: ${a.name}`,
      `Pitch: ${a.pitch}`,
      `Value curve (attribute: before -> after): ${troy.attributes.map((x, i) => `${x.name}: ${before[i]} -> ${curve[i]}`).join('; ')}`,
      `Positioning zone: ${a.zone}`,
      `Contributions: ${Object.entries(a.indicators).map(([k, v]) => `${k} ${v}`).join(', ')}`,
      `Main antagonism: ${a.antagonism}`,
    ].join('\n'),
    extra: { ...a, curve, before },
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
          <div className="section">
            <h3>
              <span className="badge p">P</span> Redraw your value curve
            </h3>
            <p className="vc-intro">
              Start here: the value curve shows your new model at a glance. The dashed line is Troy; drag the points to where your new offer stands. Raise what your islands added, and lower at least one attribute on purpose.
              {lowered4 ? ` On island 4 you chose to lower “${lowered4}”.` : ''}
            </p>
            <ValueCurveEditor
              attributes={troy.attributes.map((x, i) => ({ name: x.name, level: curve[i] }))}
              onChange={(attrs) => setA({ ...a, curve: attrs.map((x) => x.level) })}
              reference={before}
              editableNames={false}
              currentLabel="Your new model"
            />
            {!lowered && <div className="hint">Not everything can be better. Which attribute do you deliberately lower to afford the new ones?</div>}
          </div>
          <Field single label="A (fun) name for your new business model" value={a.name} onChange={(v) => setA({ ...a, name: v })} />
          <Field label="One-line pitch" limit={35} value={a.pitch} onChange={(v) => setA({ ...a, pitch: v })} placeholder="For [who], [name] offers [what], unlike Troy, because [how]." />
          <div className="section">
            <h3>Perceived value versus price</h3>
            <p className="count" style={{ marginTop: 0 }}>
              Your positioning against Troy: do customers get more or less value, and do they pay more or less? Pick the zone your curve and price really put you in.
            </p>
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
            <p className="count" style={{ marginTop: 0 }}>
              Compared with Troy: + better, 0 no change, {'−'} worse. Be honest: a model that is better on all nine is rarely credible.
            </p>
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
            onSubmit={() => task.submit(req, (g) => saveLemnos({ ...a, curve }, g))}
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
    wordCount(a.stake) < 3 && 'Say what users must commit, and how many of them.',
    junkFields([a.answer, a.assumption, a.mvp, a.stake]) && 'Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.',
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
            <div className="why-box">
              <b>Why this matters:</b> people say yes to an idea for free. Real evidence is when test users give something up: money (a deposit, a pre-order), time (a trial, an interview), data or their name on a letter of intent. Decide before the test what counts as success.
            </div>
            <Field label="Your success signal: what must test users commit, and how many of them?" limit={25} value={a.stake} onChange={(v) => setA({ ...a, stake: v })} placeholder="e.g. 20 of 100 fleet managers sign a paid 3-month pilot" />
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
