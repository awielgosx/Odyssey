import { useEffect, useState } from 'react'
import { audio } from '../audio/engine'
import { directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { finalGrade, laurels, stopComplete, useGame } from '../store'
import { STOPS } from '../world/layout'
import { Athena, type Mood } from './Athena'

// The voyage ribbon: progress, legend and navigation in one strip.
export function Ribbon() {
  const s = useGame()
  const v = voyageById(s.voyageId)
  const go = (i: number) => {
    if (i > s.furthest + 1) return
    if (i === s.furthest + 1 && !stopComplete(s, s.furthest)) {
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
      <button key={stop.key} className={`rb ${state} ${d ? '' : 'named'}`} title={title} aria-label={title} aria-current={state === 'current'} disabled={state === 'locked'} onClick={() => go(i)}>
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
        title={`Laurels earned: ${n}. Voyage score so far: ${g.outOf20}/20 (knowledge ${Math.round(g.knowledge * 100)}%, Troy ${Math.round(g.framing * 100)}%, islands ${Math.round(g.application * 100)}%, synthesis ${Math.round(g.synthesis * 100)}%).`}
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
        {s.chart ? 'Back to ship' : 'Chart'}
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

// One line telling the player what to do right now.
export function Coach() {
  const s = useGame()
  const stop = STOPS[s.stopIndex]
  let line = ''
  if (s.sailing) line = `Sailing to ${stop.label}${stop.directionId ? `, direction ${stop.directionId}` : ''}.`
  else
    switch (stop.kind) {
      case 'troy':
        line = s.troy?.grades.length ? 'Good. Now set sail for island 1, the first of fourteen directions.' : 'Describe Troy, your business today, then submit it. I will ask questions, never give answers.'
        break
      case 'island': {
        const id = stop.directionId!
        const c = s.checks[id]
        const l = s.landings[id]
        if (!c?.done) line = id === 1 ? 'Each island: a real case, one question that tests the logic, then two short questions about your business. Start with the case.' : 'Read the case, then answer the quick check. It tests the logic, not the wording.'
        else if (!l?.grades.length) line = id === 8 ? 'New sea. Use the value chain you charted: pick a step, then be specific.' : 'Now apply it to Troy. Short and concrete beats long and vague.'
        else line = 'Reviewed. Revise once if you like, then sail on.'
        break
      }
      case 'narrows':
        line = s.narrows ? 'Course charted. Next: how you build and deliver your offer.' : 'Halfway. Chart how Troy is built and delivered before you cross.'
        break
      case 'aeolus':
        line = s.aeolus?.grades.length ? 'Your plan holds. On to the forge.' : 'Pick one idea from each sea and tie them together in one sentence.'
        break
      case 'lemnos':
        line = s.lemnos?.grades.length ? 'Forged. The gods are waiting.' : 'Turn your ideas into one business model. Lower at least one attribute.'
        break
      case 'olympus':
        line = s.olympus?.grades.length ? 'The gods let you sail home.' : 'Answer one god, then design the cheapest test.'
        break
      case 'ithaca':
        line = 'Welcome home, captain. Download your log.'
        break
    }
  // Athena reacts to the latest review at this stop: stern when it is weak, pleased when it is strong
  const g = (a: { grades: { total: number; max: number }[] } | null | undefined) => (a?.grades.length ? a.grades[a.grades.length - 1] : null)
  const last =
    stop.kind === 'troy' ? g(s.troy) : stop.kind === 'island' ? g(s.landings[stop.directionId!]) : stop.kind === 'aeolus' ? g(s.aeolus) : stop.kind === 'lemnos' ? g(s.lemnos) : stop.kind === 'olympus' ? g(s.olympus) : null
  const ratio = last ? last.total / last.max : null
  const wrongQuiz = stop.kind === 'island' && !s.checks[stop.directionId!]?.done && (s.checks[stop.directionId!]?.wrong.length ?? 0) > 0
  let mood: Mood = 'neutral'
  if (!s.sailing && ratio !== null && ratio < 0.5) {
    mood = 'stern'
    const revised = (last && (stop.kind === 'troy' ? s.troy : stop.kind === 'island' ? s.landings[stop.directionId!] : stop.kind === 'aeolus' ? s.aeolus : stop.kind === 'lemnos' ? s.lemnos : s.olympus)?.grades.length === 2) ?? false
    line = revised
      ? 'Still thin. Remember why: vague ideas die in front of real customers. Take my question with you and sail on.'
      : 'This would not survive the council. Answer my question in the review, then revise. Be concrete: who, what, how much.'
  } else if (!s.sailing && ratio !== null && ratio >= 0.75) mood = 'pleased'
  else if (wrongQuiz) {
    mood = 'stern'
    line = 'Read the case again, slowly. The answer is in it.'
  }
  return (
    <div className="coach" aria-live="polite">
      <Athena mood={mood} size={92} />
      <div className="bubble parchment">
        <b>Athena</b>
        {line}
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
      {nextStop && (
        <button
          className={`btn primary ${canNext ? '' : 'waiting'}`}
          aria-disabled={!canNext}
          onClick={() => {
            if (!canNext) {
              const stop = STOPS[s.stopIndex]
              s.say(
                stop.kind === 'troy'
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
