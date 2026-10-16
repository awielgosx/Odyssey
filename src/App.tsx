import { useRef, useState } from 'react'
import { directionById } from './content/directions'
import { StormDice, type RollResult, type StormHandle } from './dice/StormDice'
import { useGame } from './store'
import { World } from './world/World'

function IslandPanel() {
  const target = useGame((s) => s.target)
  const sailing = useGame((s) => s.sailing)
  const id = target.startsWith('d') ? Number(target.slice(1)) : null
  if (sailing || !id) return null
  const d = directionById(id)
  return (
    <aside className="panel island-panel" aria-live="polite">
      <p className="panel-kicker">
        Direction {d.id} of 14, {d.pillar === 'proposition' ? 'value proposition' : 'value architecture'}
      </p>
      <h2>{d.name}</h2>
      <ol className="questions">
        {d.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      <p className="examples">Seen in class: {d.courseExamples.join(', ')}</p>
    </aside>
  )
}

function StormModal() {
  const open = useGame((s) => s.diceOpen)
  const openDice = useGame((s) => s.openDice)
  const storm = useRef<StormHandle>(null)
  const [result, setResult] = useState<RollResult | null>(null)
  const [rolling, setRolling] = useState(false)
  if (!open) return null
  const describe = (v: number | 'C') =>
    v === 'C' ? 'Contributions wildcard: improve one environmental or societal indicator' : `${v}. ${directionById(v).name}`
  return (
    <div className="storm" role="dialog" aria-label="Aeolus' storm">
      <div className="storm-stage">
        <StormDice
          ref={storm}
          onResult={(r) => {
            setResult(r)
            setRolling(false)
          }}
        />
      </div>
      <div className="storm-ui panel">
        <h2>Aeolus' storm</h2>
        <p>
          The wind god opens his bag. One die decides a value-proposition direction, the other a value-architecture direction. Your
          idea has to survive both, together.
        </p>
        {result && !rolling && (
          <div className="roll-result">
            <p>
              <span className="die-chip bf">Proposition</span> {describe(result.proposition.value)}
            </p>
            <p>
              <span className="die-chip rf">Architecture</span> {describe(result.architecture.value)}
            </p>
            <p className="fuse">Fuse both into your idea. You have three minutes before the council asks why they fit together.</p>
          </div>
        )}
        <div className="row">
          <button
            className="btn primary"
            disabled={rolling}
            onClick={() => {
              setResult(null)
              setRolling(true)
              storm.current?.roll()
            }}
          >
            {rolling ? 'The winds are blowing' : result ? 'Roll again' : 'Roll the dice'}
          </button>
          <button className="btn" onClick={() => openDice(false)}>
            Back to the map
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)
  const openDice = useGame((s) => s.openDice)
  const sailTo = useGame((s) => s.sailTo)
  return (
    <div className="app">
      <World />
      <header className="cartouche">
        <h1>Odyssey 3.14</h1>
        <p>Sail your business model through fourteen directions and defend it before the gods.</p>
      </header>
      <IslandPanel />
      <nav className="dock">
        <button className="btn" onClick={() => sailTo('ithaca')}>
          Return to Ithaca
        </button>
        <button className="btn primary" onClick={() => openDice(true)}>
          Summon Aeolus' storm
        </button>
        <button className="btn ghost" onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} aria-pressed={quality === 'high'}>
          Graphics: {quality === 'high' ? 'cinematic' : 'fast'}
        </button>
      </nav>
      <StormModal />
    </div>
  )
}
