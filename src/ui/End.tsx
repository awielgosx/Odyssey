import { useState } from 'react'
import { DIRECTIONS, directionById } from '../content/directions'
import { flattenLanding } from '../content/landing'
import { voyageById } from '../content/voyages'
import { bestGrade, finalGrade, pendingReviews, useGame } from '../store'
import { ExportDialog } from './Export'
import { GODS, INDICATORS, ZONES } from './Tasks'
import { reviewPending } from './useTask'

const fmt = (n: number) => `${Math.round(n * 100)}%`

export function buildLog(): string {
  const s = useGame.getState()
  const v = voyageById(s.voyageId)
  const g = finalGrade(s)
  const t = s.troy?.answer
  const lem = s.lemnos?.answer
  const oly = s.olympus?.answer
  const minutes = s.startedAt ? Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 60000) : 0
  const L: string[] = []
  L.push(`# Captain's Log: ${lem?.name || 'Untitled business model'}`)
  L.push('')
  L.push(`Captain: ${s.captain}${s.crew?.length ? ` | Crew: ${s.crew.join(', ')}` : ''} | Voyage: ${v.id === 'own' ? 'own project' : `practice (${v.title})`} | Rank: ${g.rank}${g.polytropos ? ' (Polytropos)' : ''} | Score: ${g.outOf20}/20 (${g.percent}%) | Time: ${minutes} min | ${new Date().toLocaleDateString()}`)
  L.push('')
  L.push('## 1. Context: Troy, the business today')
  if (t) {
    L.push(`- Offer: ${t.offer}`)
    L.push(`- User: ${t.user} | Decision-maker: ${t.decider} | Payer: ${t.payer} | Price: ${t.price}`)
    L.push(`- Customer frustration: ${t.frustration}`)
    L.push(`- Industry orthodoxy: ${t.orthodoxy}`)
    if (t.trend) L.push(`- Trend: ${t.trend}`)
  }
  L.push('')
  L.push('## 2. The innovation')
  L.push(`- ${lem?.name ?? ''}: ${lem?.pitch ?? ''}`)
  if (s.aeolus) L.push(`- Combined plan (Aeolus): ${s.aeolus.answer.sentence}`)
  if (lem?.price) L.push(`- Price and revenue model: ${lem.price}`)
  if (lem?.chain?.length) L.push(`- New value chain: ${lem.chain.join(' > ')}`)
  L.push('')
  L.push('## 3. Value architecture today (the Narrows)')
  if (s.narrows) {
    L.push(`- Value chain: ${s.narrows.chain.join(' > ')}`)
    L.push(`- Key resources: ${s.narrows.resources.join(', ')}`)
    if (s.narrows.partners) L.push(`- Partners: ${s.narrows.partners}`)
  }
  L.push('')
  L.push('## 4. Value proposition: value curve')
  L.push('| Attribute | Troy | New |')
  L.push('|---|---|---|')
  t?.attributes.forEach((a, i) => L.push(`| ${a.name} | ${a.level} | ${lem?.curve[i] === 0 ? 'eliminated' : lem?.curve[i] ?? ''} |`))
  lem?.added?.forEach((a) => L.push(`| ${a.name} (new) | - | ${a.level} |`))
  if (lem?.zone) L.push(`\nPosition: ${ZONES.find((z) => z.id === lem.zone)?.label}`)
  L.push('')
  L.push('## 5. The fourteen directions')
  DIRECTIONS.forEach((d) => {
    const c = s.checks[d.id]
    const l = s.landings[d.id]
    L.push(`- ${d.id}. ${d.name}: quick check ${c?.done ? (c.firstTry ? 'right first time' : 'answered') : 'not answered'}`)
    if (l) {
      const scores = l.grades.map((x) => `${x.total}/${x.max}${x.source === 'estimate' ? ' (estimate)' : ''}`).join(' -> ')
      flattenLanding(d, l.answer)
        .split('\n')
        .forEach((line) => L.push(line.startsWith('-') ? `    ${line}` : `  - ${line}`))
      L.push(`  - Athena's review: ${scores}; nudges used: ${s.hints[`land${d.id}`] ?? 0}`)
    }
  })
  L.push('')
  L.push('## 6. Contributions')
  INDICATORS.forEach((grp) => L.push(`- ${grp.group}: ${grp.items.map(([k, label]) => `${label} ${lem?.indicators[k] || '?'}`).join(', ')}`))
  if (lem?.antagonism) L.push(`- Main antagonism: ${lem.antagonism}`)
  L.push('')
  L.push('## 7. Test plan (Olympus)')
  if (oly) {
    const god = GODS.find((x) => x.id === oly.god)
    L.push(`- ${god?.name} asked: ${god?.q}`)
    L.push(`- Answer: ${oly.answer}`)
    if (oly.hypotheses) L.push(`- Hypotheses: proposition: ${oly.hypotheses.p} | architecture: ${oly.hypotheses.a} | contributions: ${oly.hypotheses.c}`)
    L.push(`- Riskiest assumption: ${oly.assumption}`)
    L.push(`- MVP: ${oly.mvp}`)
    L.push(`- What users put at stake: ${oly.stake}`)
  }
  L.push('')
  L.push('## 8. Scores')
  L.push(`- Knowledge, 10% (quick checks: 1 first try, 0.4 second, then 0): ${fmt(g.knowledge)}`)
  L.push(`- Framing, 10% (Troy): ${fmt(g.framing)}`)
  L.push(`- Exploration, 20% (the fourteen islands, including reasoned 'does not fit' answers): ${fmt(g.application)}`)
  L.push(`- Focus, 60% (the two ideas chosen at Aeolus, Aeolus, Lemnos, Olympus): ${fmt(g.synthesis)}`)
  if (g.pending) L.push(`- Provisional: ${g.pending} answers were scored by simple checks while Athena was unreachable (counted at most half marks).`)
  if (v.reveal) {
    L.push('')
    L.push(`## 9. Tiresias' reveal: ${v.reveal.company}`)
    L.push(v.reveal.text)
    L.push(`Directions the real company used: ${v.reveal.directions.map((id) => `${id}. ${directionById(id).name}`).join('; ')}`)
  }
  L.push('')
  L.push('## Reflection prompts')
  L.push('1. Which of your ideas surprised you most, and why?')
  L.push('2. How do your ideas differ from those the official Odyssey 3.14 webapp would generate?')
  L.push('3. What would you test first in real life, and what result would make you stop?')
  L.push('')
  L.push(`_Every idea in this log was written by the captain. Athena only asked questions. The gods saw you notice ${s.eggs.length} hidden things._`)
  return L.join('\n')
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function IthacaEnd() {
  const s = useGame()
  const v = voyageById(s.voyageId)
  const g = finalGrade(s)
  const [exporting, setExporting] = useState(false)
  const [reviewing, setReviewing] = useState<string>('')
  const complete = !!bestGrade(s.olympus)
  const pending = pendingReviews(s)
  const sendPending = async () => {
    setReviewing('Athena is reading…')
    const r = await reviewPending((done, total) => setReviewing(`Athena is reading ${done} of ${total}…`))
    setReviewing(r.reviewed === r.total ? '' : r.reviewed ? `Athena reviewed ${r.reviewed} of ${r.total}, then went quiet again. Try the rest in a minute.` : 'Athena still cannot be reached. Try again in a minute.')
  }
  const slug = (s.lemnos?.answer.name || 'voyage').replace(/[^\w]+/g, '-').toLowerCase()
  const minutes = s.startedAt ? Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 60000) : 0
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Home</span> Your reinvented business model
        </p>
        <h2 tabIndex={-1}>Ithaca</h2>
        <p className="lede">You are home. Argos lifts his head. Penelope has woven your voyage into a Captain's Log.</p>
      </div>
      <div className="panel-body">
        {!complete && <div className="hint">Finish the council on Olympus first to see your final score.</div>}
        {pending.length > 0 && (
          <div className="estimate">
            <p>
              <b>
                {pending.length} answer{pending.length > 1 ? 's' : ''} still wait{pending.length > 1 ? '' : 's'} for Athena’s review
              </b>{' '}
              ({pending.map((p) => p.label).join(', ')}). She was unreachable when you submitted, so simple checks gave a provisional score, counted at most half marks. Send them now to get her real review.
            </p>
            <div className="submit-row">
              <button className="btn small primary" disabled={!!reviewing && reviewing.startsWith('Athena is')} onClick={sendPending}>
                Send pending answers to Athena
              </button>
              {reviewing && <small className="count">{reviewing}</small>}
            </div>
          </div>
        )}
        <div className="scorecard">
          <div className="big">{g.outOf20}/20</div>
          <div className="count">Voyage score</div>
          <div className="rank">
            {g.polytropos ? 'Polytropos, the man of many turns' : g.rank} ({g.percent}%){g.pending ? ', provisional' : ''}
          </div>
        </div>
        {[
          ['Knowledge', g.knowledge, 'Quick checks: 1 point first try, 0.4 second, then 0 (10%)'],
          ['Framing', g.framing, 'Troy (10%)'],
          ['Exploration', g.application, 'The fourteen islands, lightly weighted (20%)'],
          ['Focus', g.synthesis, 'Your two chosen ideas, Aeolus, Lemnos and Olympus (60%)'],
        ].map(([label, val, sub]) => (
          <div className="bar-row" key={label as string} title={sub as string}>
            <span>{label as string}</span>
            <span className="bar">
              <i style={{ width: fmt(val as number) }} />
            </span>
            <span>{fmt(val as number)}</span>
          </div>
        ))}
        <p className="count" style={{ marginTop: 10 }}>
          {Object.values(s.checks).filter((c) => c.firstTry).length} of 14 quick checks right first time. Voyage time: {minutes} minutes.
          {Object.values(s.landings).filter((l) => (l.grades.at(-1)?.total ?? 0) >= 5).length >= 7 ? ' Badge: Explorer (seven islands scored 5 or 6).' : ''}
          {Object.values(s.checks).filter((c) => c.firstTry).length === 14 ? ' Badge: Cartographer.' : ''}
          {minutes > 0 && minutes <= 30 && g.percent >= 70 && !g.pending ? ' Badge: Swift keel (fast and well argued).' : ''}
        </p>
        {v.reveal && complete && (
          <div className="section">
            <h3>Tiresias reveals: {v.reveal.company}</h3>
            <div className="case">{v.reveal.text}</div>
            <p className="lede">
              Directions the real company used: {v.reveal.directions.map((id) => id).join(', ')}. Your Aeolus plan combined islands {s.aeolus?.answer.p} and {s.aeolus?.answer.a}. Where did your path differ, and is your model better or worse for it?
            </p>
          </div>
        )}
        <div className="section">
          <h3>Your assignment, ready to submit</h3>
          <p className="lede" style={{ marginTop: 0 }}>
            Your answers laid out like the course’s business model description: title and tagline, context, innovation and results, value curve, value architecture and contributions, with an appendix of all fourteen directions. Choose the Contemporary (Greek) or Scholar (clean) style, add your full names and group, edit any text, then save it as a PDF.
          </p>
          <div className="submit-row">
            <button className="btn primary" disabled={!complete} onClick={() => setExporting(true)}>
              Export as PDF
            </button>
            <button className="btn small" onClick={() => download(`captains-log-${slug}.md`, buildLog(), 'text/markdown')}>
              Download the full log (text)
            </button>
            <button className="btn small" onClick={() => download(`voyage-${slug}.json`, JSON.stringify(useGame.getState(), null, 2), 'application/json')}>
              Save voyage file
            </button>
          </div>
          {!complete && <p className="count">The PDF unlocks once the gods on Olympus have reviewed your model.</p>}
        </div>
        <div className="section">
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm('Start a new voyage? This voyage will be cleared from this browser.')) s.reset()
            }}
          >
            Start a new voyage
          </button>
        </div>
        {exporting && <ExportDialog onClose={() => setExporting(false)} />}
      </div>
    </>
  )
}
