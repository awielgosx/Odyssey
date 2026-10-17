import { useEffect } from 'react'
import { audio } from './audio/engine'
import { directionById } from './content/directions'
import { stopComplete, useGame } from './store'
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
    <aside className="panel parchment" key={stop.key} aria-label={stop.label}>
      {stop.kind === 'troy' && <TroyTask />}
      {stop.kind === 'island' && <IslandTask id={stop.directionId!} />}
      {stop.kind === 'narrows' && <NarrowsTask />}
      {stop.kind === 'aeolus' && <AeolusTask />}
      {stop.kind === 'lemnos' && <LemnosTask />}
      {stop.kind === 'olympus' && <OlympusTask />}
      {stop.kind === 'ithaca' && <IthacaEnd />}
      <PanelNext />
    </aside>
  )
}

// Once a stop is done, the way on is right where the player's eyes already are.
function PanelNext() {
  const s = useGame()
  const next = STOPS[s.stopIndex + 1]
  if (!next || !stopComplete(s, s.stopIndex)) return null
  const label = next.directionId ? `island ${next.directionId} · ${directionById(next.directionId).short}` : next.label
  return (
    <div className="panel-foot">
      <button className="btn primary" onClick={() => (audio.click(), s.sailTo(s.stopIndex + 1))}>
        Sail on to {label} {'\u2192'}
      </button>
    </div>
  )
}

export default function App() {
  const phase = useGame((s) => s.phase)
  const chart = useGame((s) => s.chart)
  const celebrate = useGame((s) => s.phase === 'play' && !s.sailing && s.stopIndex === STOPS.length - 1 && !s.celebrated)
  useKeys()
  useEffect(() => {
    // a reload mid-voyage returns to the title so audio can start on a click
    if (useGame.getState().sailing) useGame.setState({ sailing: false })
    audio.setMuted(!useGame.getState().sound)
  }, [])
  return (
    <div className={`app ${chart ? 'charting' : ''}`}>
      <World />
      {phase === 'play' && (
        <>
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
      <Toast />
      {phase === 'title' && <Title />}
      {phase === 'intro' && <Intro />}
      {phase === 'setup' && <Setup />}
    </div>
  )
}
