import { Fragment, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { audio } from '../audio/engine'
import { directionById, type Direction } from '../content/directions'
import { voyageById } from '../content/voyages'
import { landedIn, useGame, type AeolusAnswer, type Landing, type LemnosAnswer, type OlympusAnswer, type Sign, type TroyAnswer } from '../store'
import { STOPS } from '../world/layout'
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
          {own ? '' : 'This demo ship comes with the basics filled in; check them and add the two insights.'}
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
          <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} />
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
  const order = useMemo(() => shuffleFor(d.id, d.quiz.options.length), [d])
  return (
    <div className="section">
      <h3>Quick check</h3>
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
                answerCheck(d.id, oi, right)
                if (right) (check?.wrong.length ? audio.success() : audio.laurel())
                else audio.wrong()
              }}
            >
              {d.quiz.options[oi]}
            </button>
          )
        })}
      </div>
      {check?.done && (
        <div className="why">
          {check.firstTry ? 'Right first time: one laurel. ' : 'Got there. '}
          {d.quiz.why}
        </div>
      )}
      {!check?.done && !!check?.wrong.length && <div className="why">Not quite. Reread the case above and try another answer.</div>}
    </div>
  )
}

const P_BOXES = ['P: what is offered', 'P: who it is for', 'P: price or how it is paid']
const A_BOXES = ['A: a value-chain step', 'A: a partner', 'A: a resource or competence']
const WHO = ['User', 'Decision-maker', 'Payer', 'Partner', 'Society']

function emptyLanding(): Landing {
  return {
    idea: '',
    who: '',
    whoText: '',
    pillars: [],
    knock: '',
    contrib: { financial: { sign: '', reason: '' }, environmental: { sign: '', reason: '' }, societal: { sign: '', reason: '' } },
    risk: '',
  }
}

function LandingForm({ d }: { d: Direction }) {
  const record = useGame((s) => s.landings[d.id])
  const saveLanding = useGame((s) => s.saveLanding)
  const [a, setA] = useDraft<Landing>(`land${d.id}`, () => record?.answer ?? emptyLanding())
  const task = useGradedTask(`land${d.id}`, record?.grades ?? [])
  const up = (p: Partial<Landing>) => setA((x) => ({ ...x, ...p }))
  const setC = (k: keyof Landing['contrib'], p: Partial<{ sign: Sign | ''; reason: string }>) =>
    setA((x) => ({ ...x, contrib: { ...x.contrib, [k]: { ...x.contrib[k], ...p } } }))
  const missing = [
    (wordCount(a.idea) < 4 || wordCount(a.idea) > 25) && '1. Write your idea in 4 to 25 words.',
    !a.who && '2. Pick who benefits (user, decision-maker, payer, partner or society).',
    wordCount(a.whoText) < 4 && '2. Say how they benefit (at least 4 words).',
    a.pillars.length === 0 && '3. Tick at least one pillar element that changes.',
    wordCount(a.knock) < 3 && '3. Describe the knock-on effect (at least 3 words).',
    !Object.values(a.contrib).every((c) => c.sign && wordCount(c.reason) >= 2) && '4. Give each contribution a sign and a short reason (2 words or more).',
  ].filter(Boolean) as string[]
  const req = { kind: 'landing' as const, directionId: d.id, answer: flatten({ ...a, contrib: Object.entries(a.contrib).map(([k, v]) => `${k} ${v.sign} (${v.reason})`).join('; ') }), extra: a }
  const toggle = (b: string) => up({ pillars: a.pillars.includes(b) ? a.pillars.filter((x) => x !== b) : [...a.pillars, b] })

  return (
    <div className="section" id="landing">
      <h3>Landing: apply direction {d.id} to Troy</h3>
      <div className="case">{d.prompt}</div>
      <fieldset disabled={!task.editing} style={{ border: 0, padding: 0, margin: 0 }}>
        <Field label="1. Your idea" limit={15} value={a.idea} onChange={(v) => up({ idea: v })} placeholder="For [who], we [change] so that [gain]." />
        <div className="field">
          <div className="field-label">2. Who benefits, and how</div>
          <div className="checks">
            {WHO.map((w) => (
              <button key={w} type="button" className="pick" aria-pressed={a.who === w} onClick={() => up({ who: w })}>
                {w}
              </button>
            ))}
          </div>
          <Field label="" limit={40} value={a.whoText} onChange={(v) => up({ whoText: v })} placeholder="Name a specific person or group and what they gain." />
        </div>
        <div className="field">
          <div className="field-label">
            3. Which pillar shifts <small>tick what changes</small>
          </div>
          <div className="checks">
            {[...P_BOXES, ...A_BOXES].map((b) => (
              <button key={b} type="button" className="pick" aria-pressed={a.pillars.includes(b)} onClick={() => toggle(b)}>
                {b}
              </button>
            ))}
          </div>
          <Field
            label="Knock-on effect on the other pillar"
            limit={25}
            value={a.knock}
            onChange={(v) => up({ knock: v })}
            placeholder={d.pillar === 'proposition' ? 'What must change in how you build and deliver it?' : 'What changes for the customer because of this?'}
          />
        </div>
        <div className="field">
          <div className="field-label">
            4. Contributions <small>+ better, 0 no change, {'−'} worse</small>
          </div>
          {(['financial', 'environmental', 'societal'] as const).map((k) => (
            <div className="contrib-row" key={k}>
              <span style={{ textTransform: 'capitalize' }}>
                <span className="badge c">C</span> {k}
              </span>
              <SignToggle label={k} value={a.contrib[k].sign} onChange={(sign) => setC(k, { sign })} />
              <input type="text" value={a.contrib[k].reason} placeholder="Why? (a few words)" aria-label={`${k} reason`} onChange={(e) => setC(k, { reason: e.target.value })} />
            </div>
          ))}
        </div>
        <Field label="5. Riskiest assumption (optional)" limit={20} value={a.risk} onChange={(v) => up({ risk: v })} placeholder="What must be true for this to work? You will test it on Olympus." />
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
      {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} />}
    </div>
  )
}

export function IslandTask({ id }: { id: number }) {
  const d = directionById(id)
  const check = useGame((s) => s.checks[id])
  const landed = useGame((s) => !!s.landings[id])
  const open = useGame((s) => s.landingOpen === id)
  const set = useGame((s) => s.set)
  const recommended = voyageById(useGame((s) => s.voyageId)).recommended.includes(id)
  const showLanding = open || landed
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
        {check?.done && !showLanding && (
          <div className="fork">
            <button
              className={`btn ${recommended ? 'primary' : ''}`}
              onClick={() => {
                set({ landingOpen: id })
                audio.click()
                setTimeout(() => document.getElementById('landing')?.scrollIntoView({ behavior: 'smooth' }), 50)
              }}
            >
              Land here and apply it to Troy (about 2 min, up to 8 laurels)
            </button>
            <small className="count">
              {recommended ? 'Athena recommends landing here for your ship. ' : ''}Land on at least one island in each sea. Or sail on with the button below.
            </small>
          </div>
        )}
        {check?.done && showLanding && <LandingForm d={d} />}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Narrows

export function NarrowsCard() {
  const landedP = useGame(useShallow((s) => landedIn(s, 'proposition')))
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Passage</span> Between the two seas
        </p>
        <h2>The Narrows</h2>
        <p className="lede">
          You leave the Sea of the Value Proposition (what you offer, to whom, at what price) and enter the Sea of the Value Architecture (how you build and deliver it: value chain, partners, resources).
        </p>
      </div>
      <div className="panel-body">
        <div className="section">
          <div className="case">
            Scylla’s cliff on one side, Charybdis on the other, and the Sirens singing nearby. Odysseus kept to his course. So will you: a strong proposition needs an architecture that can deliver it.
          </div>
        </div>
        {landedP.length === 0 && (
          <div className="hint">
            <b>Athena notes:</b> you have not landed in the first sea yet. You will need one landing per sea before Aeolus. You can sail back to any passed island from the voyage ribbon.
          </div>
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
  const sailTo = useGame((s) => s.sailTo)
  const pIds = useGame(useShallow((s) => landedIn(s, 'proposition')))
  const aIds = useGame(useShallow((s) => landedIn(s, 'architecture')))
  const [a, setA] = useDraft<AeolusAnswer>('aeolus', () => aeolus?.answer ?? { p: pIds[0] ?? null, a: aIds[0] ?? null, sentence: '' })
  const [rolling, setRolling] = useState(false)
  const task = useGradedTask('aeolus', aeolus?.grades ?? [])
  const missingSea = pIds.length === 0 ? 'proposition' : aIds.length === 0 ? 'architecture' : null

  const template = (p: number | null, x: number | null) =>
    p && x ? `Because we ${landings[x]?.answer.idea.replace(/\.$/, '') ?? '[architecture change]'}, we can offer ${landings[p]?.answer.idea.replace(/\.$/, '') ?? '[proposition change]'} to [who], which makes [one contribution] go [+ or −].` : ''

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
    const s = useGame.getState()
    const rec = voyageById(s.voyageId).recommended.filter((id) => (missingSea === 'proposition' ? id <= 7 : id >= 8))
    const target = rec[0] ?? (missingSea === 'proposition' ? 1 : 8)
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
            <b>Aeolus says:</b> the winds need one idea from each sea. You have not landed in the Sea of the Value {missingSea === 'proposition' ? 'Proposition' : 'Architecture'} yet.
          </div>
          <div className="submit-row">
            <button className="btn primary" onClick={() => sailTo(STOPS.findIndex((x) => x.directionId === target))}>
              Sail back to island {target}
            </button>
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
    answer: `Proposition idea (direction ${a.p}): ${landings[a.p!]?.answer.idea}\nArchitecture idea (direction ${a.a}): ${landings[a.a!]?.answer.idea}\nCombined sentence: ${a.sentence}`,
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
          A business model only works when what you promise (value proposition) and how you deliver it (value architecture) hold together. Tie one idea from each sea into one plan, or the winds will blow you off course.
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
                  <b>{id}.</b> {landings[id].answer.idea}
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
                  <b>{id}.</b> {landings[id].answer.idea}
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
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} />}
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
  const landings = useGame((s) => s.landings)
  const aeolus = useGame((s) => s.aeolus?.answer)
  const saveLemnos = useGame((s) => s.saveLemnos)
  const [a, setA] = useDraft<LemnosAnswer>('lemnos', () => {
    if (lemnos) return lemnos.answer
    const first = Object.values(landings)[0]?.answer
    return {
      name: '',
      pitch: aeolus?.sentence ?? '',
      curve: troy.attributes.map((x) => x.level),
      zone: '',
      indicators: {
        revenue: first?.contrib.financial.sign ?? '',
        costs: '',
        capital: '',
        ghg: first?.contrib.environmental.sign ?? '',
        pollutants: '',
        resources: '',
        employability: '',
        quality: first?.contrib.societal.sign ?? '',
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
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} />}
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
  const landings = useGame((s) => s.landings)
  const lemnos = useGame((s) => s.lemnos?.answer)
  const saveOlympus = useGame((s) => s.saveOlympus)
  const risk = Object.values(landings).find((l) => l.answer.risk)?.answer.risk ?? ''
  const [a, setA] = useDraft<OlympusAnswer>('olympus', () => olympus?.answer ?? { god: '', answer: '', assumption: risk, mvp: '', stake: '' })
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
        {task.last && !task.editing && <GradeView grade={task.last} attempt={task.attempt} canRevise={task.canRevise} onRevise={() => task.setEditing(true)} />}
      </div>
    </>
  )
}
