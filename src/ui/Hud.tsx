import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio/engine'
import { directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { finalGrade, freeTravel, laurels, revisingHere, stopComplete, useGame } from '../store'
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
      const at = STOPS[s.furthest]
      s.say(`Finish ${at.directionId ? `island ${at.directionId} (${directionById(at.directionId).short.toLowerCase()})` : at.label} before sailing on.`)
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
  const nav = useRef<HTMLElement>(null)
  // on narrow screens the ribbon scrolls: keep the current stop in view
  useEffect(() => {
    nav.current?.querySelector<HTMLElement>('.rb.current')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [s.stopIndex])
  return (
    <nav className="ribbon parchment" aria-label={`Voyage of ${v.ship}`} ref={nav}>
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
  const menuRef = useRef<HTMLDivElement>(null)
  const n = laurels(s)
  const g = finalGrade(s)
  useEffect(() => {
    if (!menu) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    const click = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.menu-btn') && setMenu(false)
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', click)
    menuRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('pointerdown', click)
    }
  }, [menu])
  useEffect(() => {
    audio.setMuted(!s.sound)
    audio.setWax(s.wax)
  }, [s.sound, s.wax])
  return (
    <div className="hud-right">
      <span
        className="chip static"
        tabIndex={0}
        aria-label={`Voyage score so far ${g.outOf20} out of 20. ${n} laurels earned.${g.pending ? ` ${g.pending} answers wait for Athena's review.` : ''}`}
        title={`Voyage score so far: ${g.outOf20}/20 (knowledge 10%: ${Math.round(g.knowledge * 100)}%, Troy 10%: ${Math.round(g.framing * 100)}%, exploration 20%: ${Math.round(g.application * 100)}%, focus 60%: ${Math.round(g.synthesis * 100)}%). Laurels: ${n}, one per point Athena gives and per quick check right first time.${g.pending ? ` ${g.pending} answers have a provisional estimate and wait for Athena's review.` : ''}`}
      >
        <span className="score-mini">{g.outOf20}/20</span>
        {g.pending > 0 && <span className="pending-dot" aria-hidden="true">{g.pending} pending</span>}
        <span className="laurel-mini" aria-hidden="true">
          {'❦'} {n}
        </span>
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
      <button className="chip menu-btn" aria-expanded={menu} aria-haspopup="true" onClick={() => setMenu(!menu)}>
        Menu
      </button>
      {menu && (
        <div className="menu parchment" ref={menuRef}>
          <button className="btn small" onClick={() => (s.set({ phase: 'intro', introStep: 0 }), setMenu(false))}>
            How to play
          </button>
          <button className="btn small" aria-pressed={s.quality === 'high'} onClick={() => s.set({ quality: s.quality === 'high' ? 'low' : 'high' })}>
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
          <small className="count">Progress is saved in this browser. Shortcuts (outside text boxes): N next stop, P previous stop, M full map.</small>
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
        tip = last ? '' : 'The best pair is not always your two favourite ideas: it is the pair where one makes the other possible.'
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
    const estimate = (last as { source?: string }).source === 'estimate'
    if (estimate) {
      line = `${last.total}/${last.max}, provisional: I could not read it properly just now. Ask me again, improve it, or sail on and send it from Ithaca.`
    } else if (last.total === 0) {
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
      <button className="coach-fold" onClick={() => setFolded(false)} aria-label="Show Athena" title="Show Athena">
        <Athena mood={mood} size={64} />
      </button>
    )
  return (
    <div className="coach">
      <span aria-hidden="true">
        <Athena mood={mood} size={124} />
      </span>
      <div className="bubble parchment" key={line}>
        <button
          className="coach-hide"
          aria-label="Hide Athena"
          onClick={() => {
            setFolded(true)
            requestAnimationFrame(() => document.querySelector<HTMLElement>('.coach-fold')?.focus())
          }}
        >
          {'–'}
        </button>
        <b>{title}</b>
        <span aria-live="polite">{line}</span>
        {tip && <span className="coach-tip">{tip}</span>}
      </div>
    </div>
  )
}

export function Nav() {
  const s = useGame()
  if (s.sailing) return null
  const next = s.stopIndex + 1
  const revising = revisingHere(s)
  const canNext = next < STOPS.length && stopComplete(s, s.stopIndex) && !revising
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
                revising
                  ? 'You are revising this answer: submit it to Athena, or cancel the revision, before sailing on.'
                  : zero
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
    const t = setTimeout(() => set({ toast: null }), Math.max(8000, toast.text.length * 90))
    return () => clearTimeout(t)
  }, [toast, set])
  if (!toast) return null
  return (
    <div className="toast parchment" role="status" key={toast.id}>
      <span>{toast.text}</span>
      <button type="button" className="toast-x" aria-label="Dismiss message" onClick={() => set({ toast: null })}>
        {'×'}
      </button>
    </div>
  )
}

// keyboard: N next, P previous, M chart. Never while the player is typing or reading a dialog:
// a stray "m" or "p" in the export's editable text used to close it and lose the edits.
let lastTyped = 0
export function useKeys() {
  useEffect(() => {
    const typed = () => (lastTyped = Date.now())
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable || el?.getAttribute?.('role') === 'slider') return
      // a field that was just disabled (after submitting) drops focus to the page: ignore keys for a moment
      if (Date.now() - lastTyped < 2500) return
      if (document.querySelector('.export-root, [role="dialog"], .celebrate, .overlay')) return
      const s = useGame.getState()
      if (s.phase !== 'play') return
      const k = e.key.toLowerCase()
      if (k === 'n') {
        if (revisingHere(s)) s.say('Finish or cancel your revision first.')
        else if (stopComplete(s, s.stopIndex)) s.sailTo(s.stopIndex + 1)
        else s.say('Finish this stop first: the task is in the panel.')
      }
      if (k === 'p') s.sailTo(s.stopIndex - 1)
      if (k === 'm') s.set({ chart: !s.chart })
    }
    window.addEventListener('keydown', on)
    window.addEventListener('input', typed, true)
    return () => {
      window.removeEventListener('keydown', on)
      window.removeEventListener('input', typed, true)
    }
  }, [])
}
