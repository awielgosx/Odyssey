import { useEffect } from 'react'
import { useGame } from './store'
import { IthacaEnd } from './ui/End'
import { Coach, Nav, Ribbon, Toast, TopRight, useKeys } from './ui/Hud'
import { Intro, Setup, Title } from './ui/Overlays'
import { AeolusTask, IslandTask, LemnosTask, NarrowsCard, OlympusTask, TroyTask } from './ui/Tasks'
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
      {stop.kind === 'narrows' && <NarrowsCard />}
      {stop.kind === 'aeolus' && <AeolusTask />}
      {stop.kind === 'lemnos' && <LemnosTask />}
      {stop.kind === 'olympus' && <OlympusTask />}
      {stop.kind === 'ithaca' && <IthacaEnd />}
    </aside>
  )
}

export default function App() {
  const phase = useGame((s) => s.phase)
  const chart = useGame((s) => s.chart)
  useKeys()
  useEffect(() => {
    // a reload mid-voyage returns to the title so audio can start on a click
    if (useGame.getState().sailing) useGame.setState({ sailing: false })
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
      <Toast />
      {phase === 'title' && <Title />}
      {phase === 'intro' && <Intro />}
      {phase === 'setup' && <Setup />}
    </div>
  )
}
