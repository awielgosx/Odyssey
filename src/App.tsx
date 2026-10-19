import { useEffect } from 'react'
import { audio } from './audio/engine'
import { directionById } from './content/directions'
import { revisingHere, stopComplete, useGame } from './store'
import { Briefing } from './ui/Briefing'
import { Celebration } from './ui/Celebration'
import { IthacaEnd } from './ui/End'
import { Coach, Nav, Ribbon, Toast, TopRight, useKeys } from './ui/Hud'
import { Intro, Setup, Title } from './ui/Overlays'
import { AeolusTask, IslandTask, LemnosTask, NarrowsTask, OlympusTask, TroyTask } from './ui/Tasks'
import { STOPS } from './world/layout'
import { World } from './world/World'

function Panel() {
  const stopIndex = useGame((s) => s.stopIndex)
  const sailing = useGame((s) => s.sailing)
  const chart = useGame((s) => s.chart)
  if (sailing || chart) return null
  const stop = STOPS[stopIndex]
  return (
    <aside className="panel parchment" key={stop.key} aria-label={stop.label} id="task">
      {/* title and task scroll together, so the task gets the height on small laptops */}
      <div className="panel-scroll">
        {stop.kind === 'troy' && <TroyTask />}
        {stop.kind === 'island' && <IslandTask id={stop.directionId!} />}
        {stop.kind === 'narrows' && <NarrowsTask />}
        {stop.kind === 'aeolus' && <AeolusTask />}
        {stop.kind === 'lemnos' && <LemnosTask />}
        {stop.kind === 'olympus' && <OlympusTask />}
        {stop.kind === 'ithaca' && <IthacaEnd />}
      </div>
      <PanelNext />
    </aside>
  )
}

// Once a stop is done, the way on is right where the player's eyes already are.
function PanelNext() {
  const s = useGame()
  const next = STOPS[s.stopIndex + 1]
  if (!next || !stopComplete(s, s.stopIndex) || revisingHere(s)) return null
  const label = next.directionId ? `island ${next.directionId} · ${directionById(next.directionId).short}` : next.label
  return (
    <div className="panel-foot">
      <button className="btn primary" onClick={() => (audio.click(), s.sailTo(s.stopIndex + 1))}>
        Sail on to {label} {'\u2192'}
      </button>
    </div>
  )
}

// Dev-only switch for automated UI testing on machines without a GPU: ?no3d=1 skips the 3D scene.
const NO3D = import.meta.env.DEV && new URLSearchParams(location.search).has('no3d')

export default function App() {
  const phase = useGame((s) => s.phase)
  const chart = useGame((s) => s.chart)
  // only a finished voyage is celebrated (a demo can jump to Ithaca straight from Troy)
  const celebrate = useGame((s) => s.phase === 'play' && !s.sailing && s.stopIndex === STOPS.length - 1 && !s.celebrated && (s.olympus?.grades.length ?? 0) > 0)
  const brief = useGame((s) => s.phase === 'play' && !s.sailing && s.stopIndex === 1 && !s.briefed)
  useKeys()
  useEffect(() => {
    // a reload lands back in the voyage (sound starts on the next click); a reload mid-sail counts as arrived
    useGame.setState((s) => ({ sailing: false, furthest: Math.max(s.furthest, s.stopIndex) }))
    audio.setMuted(!useGame.getState().sound)
  }, [])
  // arriving at a stop: put keyboard focus on its title so the next Tab lands in the task
  const stopIndex = useGame((s) => s.stopIndex)
  const sailing = useGame((s) => s.sailing)
  useEffect(() => {
    if (sailing) return
    const t = setTimeout(() => {
      if (document.activeElement === document.body) document.querySelector<HTMLElement>('.panel h2')?.focus({ preventScroll: true })
    }, 60)
    return () => clearTimeout(t)
  }, [stopIndex, sailing])
  return (
    <div className={`app ${chart ? 'charting' : ''}`}>
      {NO3D ? <div className="no3d" /> : <World />}
      {phase === 'play' && (
        <>
          <a
            className="skip-link"
            href="#task"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector<HTMLElement>('.panel h2')?.focus()
            }}
          >
            Skip to the task
          </a>
          <header className="topbar">
            <Ribbon />
            <TopRight />
          </header>
          <Panel />
          <Coach />
          <Nav />
        </>
      )}
      {celebrate && <Celebration />}
      {brief && <Briefing />}
      <Toast />
      {phase === 'title' && <Title />}
      {phase === 'intro' && <Intro />}
      {phase === 'setup' && <Setup />}
    </div>
  )
}
