import { useEffect, useState } from 'react'
import { audio } from '../audio/engine'
import { directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { finalGrade, freeTravel, laurels, stopComplete, useGame } from '../store'
import { STOPS } from '../world/layout'
import { Athena, type Mood } from './Athena'

// The voyage ribbon: progress, legend and navigation in one strip.
export function Ribbon() {
  const s = useGame()
  const v = voyageById(s.voyageId)
  const free = freeTravel(s)
  const go = (i: number) => {
    if (i === s.stopIndex) return
    if (!free && i > s.furthest + 1) return
    if (!free && i === s.furthest + 1 && !stopComplete(s, s.furthest)) {
      s.say(`Finish the task at ${STOPS[s.furthest].label} before sailing on.`)
      return
    }
    audio.click()
    s.sailTo(i)
  }
  const btn = (i: number) => {
    const stop = STOPS[i]
    const state = i === s.stopIndex ? 'current' : i <= s.furthest ? 'passed' : i === s.furthest + 1 ? 'next' : 'locked'
    const d = stop.directionId ? directionById(stop.directionId) : null
    const landed = d && (s.landings[d.id]?.grades.length ?? 0) > 0
    const title = d ? `Direction ${d.id}: ${d.name} (${d.pillar === 'proposition' ? 'value proposition' : 'value architecture'})` : stop.label
    return (
      <button key={stop.key} className={`rb ${state} ${d ? '' : 'named'}`} title={title} aria-label={title} aria-current={state === 'current'} disabled={state === 'locked' && !free} onClick={() => go(i)}>
        {d ? d.id : stop.label === 'The Narrows' ? '≈' : stop.label}
        {landed && <span className="laurel">{'❦'}</span>}
      </button>
    )
  }
  const pStart = STOPS.findIndex((x) => x.directionId === 1)
  const aStart = STOPS.findIndex((x) => x.directionId === 8)
  return (
    <nav className="ribbon parchment" aria-label={`Voyage of ${v.ship}`}>
      {btn(0)}
      <span className="rb-sea p" title="Sea of the Value Proposition: directions 1 to 7">
        {STOPS.slice(pStart, pStart + 7).map((_, k) => btn(pStart + k))}
      </span>
      {btn(pStart + 7)}
      <span className="rb-sea a" title="Sea of the Value Architecture: directions 8 to 14">
        {STOPS.slice(aStart, aStart + 7).map((_, k) => btn(aStart + k))}
      </span>
      {STOPS.slice(aStart + 7).map((_, k) => btn(aStart + 7 + k))}
    </nav>
  )
}

export function TopRight() {
  const s = useGame()
  const [menu, setMenu] = useState(false)
  const n = laurels(s)
  const g = finalGrade(s)
  useEffect(() => {
    audio.setMuted(!s.sound)
    audio.setWax(s.wax)
  }, [s.sound, s.wax])
  return (
    <div className="hud-right">
      <span
        className="chip static"
        title={`Laurels earned: ${n}. Voyage score so far: ${g.outOf20}/20 (knowledge 10%: ${Math.round(g.knowledge * 100)}%, Troy 10%: ${Math.round(g.framing * 100)}%, exploration 20%: ${Math.round(g.application * 100)}%, focus 60%: ${Math.round(g.synthesis * 100)}%).`}
      >
        {'❦'} {n} <span className="score-mini">{g.outOf20}/20</span>
      </span>
      <span className="chip" style={{ gap: 8 }}>
        <button
          className="btn ghost"
          style={{ padding: 0, textDecoration: 'none', fontSize: 15 }}
          aria-pressed={s.sound}
          onClick={() => {
            s.set({ sound: !s.sound })
            if (!s.sound) audio.start()
          }}
        >
          {s.sound ? 'Sound on' : 'Sound off'}
        </button>
        <button
          className="wax"
          title="Beeswax"
          aria-label="Put beeswax in your ears (muffles the sound)"
          aria-pressed={s.wax}
          onClick={() => {
            s.set({ wax: !s.wax })
            if (!s.wax) s.findEgg('wax', 'Beeswax in your ears, like Odysseus’ crew. The Sirens can’t reach you now. Click again to take it out.')
          }}
        />
      </span>
      <button className="chip" aria-pressed={s.chart} onClick={() => s.set({ chart: !s.chart })}>
        {s.chart ? 'Back to ship' : 'Full map'}
      </button>
      <button className="chip" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        Menu
      </button>
      {menu && (
        <div className="menu parchment">
          <button className="btn small" onClick={() => (s.set({ phase: 'intro', introStep: 0 }), setMenu(false))}>
            How to play
          </button>
          <button className="btn small" onClick={() => s.set({ quality: s.quality === 'high' ? 'low' : 'high' })}>
            Graphics: {s.quality === 'high' ? 'cinematic' : 'fast'}
          </button>
          <button
            className="btn small"
            onClick={() => {
              if (confirm('Start a new voyage? This voyage will be cleared from this browser.')) {
                s.reset()
                setMenu(false)
              }
            }}
          >
            Start a new voyage
          </button>
          <small className="count">Progress is saved in this browser.</small>
        </div>
      )}
    </div>
  )
}

// Athena, always present: what to do now, a coaching tip for this stop, and her reaction to the
// latest review. She can be folded away to free the map.
export function Coach() {
  const s = useGame()
  const [folded, setFolded] = useState(false)
  const stop = STOPS[s.stopIndex]
  const g = (a: { grades: { total: number; max: number; feedback?: string }[] } | null | undefined) => (a?.grades.length ? a.grades[a.grades.length - 1] : null)
  const rec = stop.kind === 'troy' ? s.troy : stop.kind === 'island' ? s.landings[stop.directionId!] : stop.kind === 'aeolus' ? s.aeolus : stop.kind === 'lemnos' ? s.lemnos : stop.kind === 'olympus' ? s.olympus : null
  const last = g(rec)
  const ratio = last ? last.total / last.max : null
  let title = 'Athena'
  let line = ''
  let tip = ''
  let mood: Mood = 'neutral'
  if (s.sailing) {
    const dir = stop.directionId ? directionById(stop.directionId) : null
    line = dir ? `Next: island ${dir.id}, ${dir.name.toLowerCase()}.` : `Sailing to ${stop.label}.`
    tip = dir ? dir.tip : ''
  } else
    switch (stop.kind) {
      case 'troy':
        line = last ? 'Troy is charted. Set sail for island 1, the first of fourteen ways to reinvent it.' : 'Describe Troy, the business as it works today. No new ideas yet: this is the benchmark.'
        tip = last ? '' : 'The sharper your frustration and orthodoxy, the better every island will go.'
        break
      case 'island': {
        const dir = directionById(stop.directionId!)
        const c = s.checks[dir.id]
        title = `Athena · island ${dir.id}`
        if (!c?.done) {
          line = dir.id === 1 ? 'Each island: a real case, a question that tests the logic, then one or two questions about your business.' : `${dir.name}. Read the case, then answer the quick check: it tests the logic, not the wording.`
          tip = c?.wrong.length ? 'Not that one. Think about the mechanism of the direction, not the words of the case.' : ''
          if (c?.wrong.length) mood = 'stern'
        } else if (!last) {
          line = dir.id === 8 ? 'New sea. Use the value chain you charted: pick a step, then be specific.' : 'Now apply it to your business. Short and concrete beats long and vague.'
          tip = dir.tip
        }
        break
      }
      case 'narrows':
        line = s.narrows ? 'Course charted. The next seven islands will change these steps and resources.' : 'Halfway. Before you cross, chart how Troy is built and delivered: the second sea works on it.'
        tip = s.narrows ? '' : 'Use the quick-add chips, then rename them to fit your business.'
        break
      case 'aeolus':
        line = last ? 'Your plan holds. On to the forge.' : 'Pick the promise and what makes it possible, then explain the link between them.'
        tip = last ? '' : 'The best pair is not always your two highest scores: it is the pair where one makes the other possible.'
        break
      case 'lemnos':
        line = last ? 'Forged. The gods are waiting.' : 'Turn your plan into one business model, starting with the value curve.'
        tip = last ? '' : 'Lower at least one attribute on purpose: that trade-off is what makes a model sharp.'
        break
      case 'olympus':
        line = last ? 'The gods let you sail home.' : 'Answer one god, then design the cheapest test that could prove you wrong.'
        tip = last ? '' : 'A good test can fail. Set the success signal before you run it.'
        break
      case 'ithaca':
        line = 'Welcome home, captain. Export your assignment as a PDF and download your log.'
        mood = 'pleased'
        break
    }
  if (!s.sailing && last) {
    const fb = (last as { feedback?: string }).feedback?.split(/(?<=[.!?])\s/)[0] ?? ''
    if (last.total === 0) {
      mood = 'stern'
      line = 'Zero laurels. This would not survive a single customer: rewrite it before we sail on.'
    } else if (ratio !== null && ratio < 0.5) {
      mood = 'stern'
      line = `${last.total}/${last.max}. ${fb || 'This would not survive the council.'} Revise it, or take my question with you.`
    } else if (ratio !== null && ratio >= 0.75) {
      mood = 'pleased'
      line = `${last.total}/${last.max}. ${fb || 'Well argued.'} Sail on when you are ready.`
    } else line = `${last.total}/${last.max}. ${fb || 'Solid, with room to sharpen.'} Revise once if you like, then sail on.`
  }
  if (folded)
    return (
      <button className="coach-fold" onClick={() => setFolded(false)} aria-label="Show Athena">
        <Athena mood={mood} size={64} />
      </button>
    )
  return (
    <div className="coach" aria-live="polite">
      <Athena mood={mood} size={124} />
      <div className="bubble parchment" key={line}>
        <button className="coach-hide" aria-label="Fold Athena away" onClick={() => setFolded(true)}>
          {'–'}
        </button>
        <b>{title}</b>
        <span>{line}</span>
        {tip && <span className="coach-tip">{tip}</span>}
      </div>
    </div>
  )
}

export function Nav() {
  const s = useGame()
  if (s.sailing) return null
  const next = s.stopIndex + 1
  const canNext = next < STOPS.length && stopComplete(s, s.stopIndex)
  const nextStop = STOPS[next]
  const label = nextStop ? (nextStop.directionId ? `${nextStop.directionId} · ${directionById(nextStop.directionId).short}` : nextStop.label) : ''
  return (
    <div className="nav">
      {s.stopIndex > 0 && (
        <button className="btn" onClick={() => (audio.click(), s.sailTo(s.stopIndex - 1))}>
          {'←'} Previous stop
        </button>
      )}
      {/* once a stop is done, the "Sail on" button inside the panel takes over (except on the full map) */}
      {nextStop && (!canNext || s.chart) && (
        <button
          className={`btn primary ${canNext ? '' : 'waiting'}`}
          aria-disabled={!canNext}
          onClick={() => {
            if (!canNext) {
              const stop = STOPS[s.stopIndex]
              const rec = stop.kind === 'troy' ? s.troy : stop.kind === 'island' ? s.landings[stop.directionId!] : stop.kind === 'aeolus' ? s.aeolus : stop.kind === 'lemnos' ? s.lemnos : stop.kind === 'olympus' ? s.olympus : null
              const zero = !!rec?.grades.length && rec.grades[rec.grades.length - 1].total === 0
              s.say(
                zero
                  ? 'Athena gave this zero laurels. Rewrite your answer and resubmit it before you sail on.'
                  : stop.kind === 'troy'
                  ? 'First submit Troy to Athena: the button is at the bottom of the panel on the right.'
                  : stop.kind === 'island'
                    ? s.checks[stop.directionId!]?.done
                      ? 'Answer this island’s questions and submit them to Athena first (bottom of the panel on the right).'
                      : 'Answer the quick check in the panel first, then the island’s questions.'
                    : stop.kind === 'narrows'
                      ? 'Chart Troy’s value chain first (panel on the right). The next seven islands use it.'
                      : 'Submit your answer to Athena first (bottom of the panel on the right).',
              )
              audio.wrong()
              return
            }
            audio.click()
            s.sailTo(next)
          }}
        >
          Set sail to {label} {'\u2192'}
        </button>
      )}
    </div>
  )
}

export function Toast() {
  const toast = useGame((s) => s.toast)
  const set = useGame((s) => s.set)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => set({ toast: null }), 6500)
    return () => clearTimeout(t)
  }, [toast, set])
  if (!toast) return null
  return (
    <div className="toast parchment" role="status" key={toast.id} onClick={() => set({ toast: null })}>
      {toast.text}
    </div>
  )
}

// keyboard: N next, P previous, M chart
export function useKeys() {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const s = useGame.getState()
      if (s.phase !== 'play') return
      if (e.key === 'n' && stopComplete(s, s.stopIndex)) s.sailTo(s.stopIndex + 1)
      if (e.key === 'p') s.sailTo(s.stopIndex - 1)
      if (e.key === 'm') s.set({ chart: !s.chart })
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
}
