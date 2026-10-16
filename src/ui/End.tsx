import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DIRECTIONS, directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { bestGrade, finalGrade, landedIn, useGame } from '../store'
import { GODS, INDICATORS, ZONES } from './Tasks'

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
  L.push(`Captain: ${s.captain} | Voyage: ${v.id === 'own' ? 'own project' : `practice (${v.title})`} | Rank: ${g.rank}${g.polytropos ? ' (Polytropos)' : ''} | Score: ${g.outOf20}/20 (${g.percent}%) | Time: ${minutes} min | ${new Date().toLocaleDateString()}`)
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
  L.push('')
  L.push('## 3. Value proposition: value curve')
  L.push('| Attribute | Troy | New |')
  L.push('|---|---|---|')
  t?.attributes.forEach((a, i) => L.push(`| ${a.name} | ${a.level} | ${lem?.curve[i] ?? ''} |`))
  if (lem?.zone) L.push(`\nPosition: ${ZONES.find((z) => z.id === lem.zone)?.label}`)
  L.push('')
  L.push('## 4. Directions explored')
  DIRECTIONS.forEach((d) => {
    const c = s.checks[d.id]
    const l = s.landings[d.id]
    L.push(`- ${d.id}. ${d.name}: quick check ${c?.done ? (c.firstTry ? 'right first time' : 'answered') : 'not answered'}${l ? ', landed' : ''}`)
    if (l) {
      const scores = l.grades.map((x) => `${x.total}/${x.max}${x.source === 'estimate' ? ' (estimate)' : ''}`).join(' -> ')
      L.push(`  - Idea: ${l.answer.idea}`)
      L.push(`  - Who benefits: ${l.answer.who}: ${l.answer.whoText}`)
      L.push(`  - Pillar shift: ${l.answer.pillars.join(', ')}. Knock-on: ${l.answer.knock}`)
      L.push(`  - Contributions: ${Object.entries(l.answer.contrib).map(([k, x]) => `${k} ${x.sign} (${x.reason})`).join('; ')}`)
      L.push(`  - Athena's review: ${scores}; hints used: ${s.hints[`land${d.id}`] ?? 0}`)
    }
  })
  L.push('')
  L.push('## 5. Contributions')
  INDICATORS.forEach((grp) => L.push(`- ${grp.group}: ${grp.items.map(([k, label]) => `${label} ${lem?.indicators[k] || '?'}`).join(', ')}`))
  if (lem?.antagonism) L.push(`- Main antagonism: ${lem.antagonism}`)
  L.push('')
  L.push('## 6. Test plan (Olympus)')
  if (oly) {
    const god = GODS.find((x) => x.id === oly.god)
    L.push(`- ${god?.name} asked: ${god?.q}`)
    L.push(`- Answer: ${oly.answer}`)
    L.push(`- Riskiest assumption: ${oly.assumption}`)
    L.push(`- MVP: ${oly.mvp}`)
    L.push(`- What users put at stake: ${oly.stake}`)
  }
  L.push('')
  L.push('## 7. Scores')
  L.push(`- Knowledge (quick checks right first time): ${fmt(g.knowledge)}`)
  L.push(`- Framing (Troy): ${fmt(g.framing)}`)
  L.push(`- Application (best landing per sea): ${fmt(g.application)}`)
  L.push(`- Synthesis (Aeolus, Lemnos, Olympus): ${fmt(g.synthesis)}`)
  if (v.reveal) {
    L.push('')
    L.push(`## 8. Tiresias' reveal: ${v.reveal.company}`)
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
  const [print, setPrint] = useState('')
  const complete = !!bestGrade(s.olympus)
  const slug = (s.lemnos?.answer.name || 'voyage').replace(/[^\w]+/g, '-').toLowerCase()
  const minutes = s.startedAt ? Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 60000) : 0
  return (
    <>
      <div className="panel-head">
        <p className="kicker">
          <span className="badge ink">Home</span> Your reinvented business model
        </p>
        <h2>Ithaca</h2>
        <p className="lede">You are home. Argos lifts his head. Penelope has woven your voyage into a Captain's Log.</p>
      </div>
      <div className="panel-body">
        {!complete && <div className="hint">Finish the council on Olympus first to see your final score.</div>}
        <div className="scorecard">
          <div className="big">{g.outOf20}/20</div>
          <div className="count">Voyage score</div>
          <div className="rank">
            {g.polytropos ? 'Polytropos, the man of many turns' : g.rank} ({g.percent}%)
          </div>
        </div>
        {[
          ['Knowledge', g.knowledge, 'Quick checks right first time (15%)'],
          ['Framing', g.framing, 'Troy (10%)'],
          ['Application', g.application, 'Best landing in each sea (40%)'],
          ['Synthesis', g.synthesis, 'Aeolus, Lemnos, Olympus (35%)'],
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
          {Object.keys(s.landings).length} landings, {landedIn(s, 'proposition').length} in the first sea and {landedIn(s, 'architecture').length} in the second. Voyage time: {minutes} minutes.
          {Object.keys(s.landings).length >= 6 ? ' Badge: Explorer.' : ''}
          {Object.values(s.checks).filter((c) => c.firstTry).length === 14 ? ' Badge: Cartographer.' : ''}
          {minutes > 0 && minutes <= 20 ? ' Badge: Swift keel.' : ''}
        </p>
        {v.reveal && complete && (
          <div className="section">
            <h3>Tiresias reveals: {v.reveal.company}</h3>
            <div className="case">{v.reveal.text}</div>
            <p className="lede">
              Directions the real company used: {v.reveal.directions.map((id) => id).join(', ')}. You landed on: {Object.keys(s.landings).join(', ') || 'none'}. Where did your path differ, and is your model better or worse for it?
            </p>
          </div>
        )}
        <div className="section">
          <h3>Your Captain's Log</h3>
          <p className="lede" style={{ marginTop: 0 }}>
            Structured like the course's business model description: context, innovation, value proposition, value architecture, contributions and test plan, plus every review Athena gave.
          </p>
          <div className="submit-row">
            <button className="btn primary" onClick={() => download(`captains-log-${slug}.md`, buildLog(), 'text/markdown')}>
              Download the log
            </button>
            <button
              className="btn"
              onClick={() => {
                setPrint(buildLog())
                setTimeout(() => window.print(), 100)
              }}
            >
              Print or save as PDF
            </button>
            <button className="btn small" onClick={() => download(`voyage-${slug}.json`, JSON.stringify(useGame.getState(), null, 2), 'application/json')}>
              Save voyage file
            </button>
          </div>
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
        {print && <PrintLog text={print} />}
      </div>
    </>
  )
}

function PrintLog({ text }: { text: string }) {
  return createPortal(
    <div className="print-log">
      {text.split('\n').map((line, i) =>
        line.startsWith('# ') ? (
          <h1 key={i}>{line.slice(2)}</h1>
        ) : line.startsWith('## ') ? (
          <h2 key={i}>{line.slice(3)}</h2>
        ) : (
          <p key={i} style={{ margin: '2px 0' }}>
            {line}
          </p>
        ),
      )}
    </div>,
    document.body,
  )
}
