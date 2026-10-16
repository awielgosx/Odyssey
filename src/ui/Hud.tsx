import { useEffect, useState } from 'react'
import { audio } from '../audio/engine'
import { directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { landedIn, laurels, stopComplete, useGame } from '../store'
import { STOPS } from '../world/layout'
import { Owl } from './common'

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
  useEffect(() => {
    audio.setMuted(!s.sound)
    audio.setWax(s.wax)
  }, [s.sound, s.wax])
  return (
    <div className="hud-right">
      <span className="chip static" title="Laurels earned">
        {'❦'} {n}
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
        if (!c?.done) line = 'Read the case, then answer the quick check to unlock the next island.'
        else if (s.landingOpen === id && !l?.grades.length) line = 'Apply this direction to Troy. Short and concrete beats long and vague.'
        else if (l?.grades.length) line = 'Landing reviewed. Revise once if you like, then sail on.'
        else {
          const sea = id <= 7 ? 'proposition' : 'architecture'
          line = landedIn(s, sea).length ? 'Land here too, or sail on to the next island.' : 'Land here to apply it, or sail on. You need at least one landing in each sea.'
        }
        break
      }
      case 'narrows':
        line = 'Halfway. Next: how you build and deliver your offer.'
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
  return (
    <div className="coach" aria-live="polite">
      <Owl />
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
        <button className="btn primary" disabled={!canNext} title={canNext ? '' : 'Finish this stop first'} onClick={() => (audio.click(), s.sailTo(next))}>
          Set sail to {label} {'→'}
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
