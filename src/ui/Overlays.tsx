import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio/engine'
import { VOYAGES } from '../content/voyages'
import { useGame, type Framing, type ShipStyle } from '../store'
import { ShipPreview3D } from '../world/ShipPreview'
import { Athena } from './Athena'
import { useDialog } from './common'

// dev-only: no WebGL previews in automated UI tests (?no3d)
const NO3D = import.meta.env.DEV && new URLSearchParams(location.search).has('no3d')

export function Title() {
  const s = useGame()
  const saved = !!s.startedAt
  return (
    <div className="overlay">
      <div className="title-card parchment">
        <div className="meander-band" />
        <p className="sub" style={{ marginTop: 18 }}>
          Odyssey 3.14
        </p>
        <h1>The Voyage</h1>
        <p style={{ marginTop: 18 }}>
          Sail your business model from Troy to Ithaca. Learn the fourteen directions, apply them to a real business, and defend your new model before the gods. About an hour if you do it properly; your progress is saved, so you can stop and come back.
        </p>
        <div className="row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {saved ? (
            <>
              <button
                className="btn primary"
                autoFocus
                onClick={() => {
                  audio.start()
                  s.set({ phase: 'play' })
                }}
              >
                Continue your voyage
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (!confirm('Start a new voyage? Your current voyage will be cleared from this browser.')) return
                  audio.start()
                  s.reset()
                  s.set({ phase: 'intro', introStep: 0 })
                }}
              >
                Start a new voyage
              </button>
            </>
          ) : (
            <button
              className="btn primary"
              autoFocus
              onClick={() => {
                audio.start()
                s.set({ phase: 'intro', introStep: 0 })
              }}
            >
              Begin the voyage
            </button>
          )}
        </div>
        <p className="fine">
          A study tool for the Odyssey 3.14 approach to business model innovation (Lehmann-Ortega, Musikas and Schoettl, HEC Paris). Best on a desktop or laptop, with sound on.
          <br />
          Made by Adam Wielgos.
        </p>
        <div className="meander-band" style={{ marginTop: 18 }} />
      </div>
    </div>
  )
}

const PillarBadge = ({ k }: { k: 'p' | 'a' | 'c' }) => <span className={`badge ${k}`}>{k.toUpperCase()}</span>

const STEPS = [
  {
    title: 'Sail from Troy to Ithaca',
    body: (
      <>
        <p>Every industry has a business model that almost everyone copies. This game teaches you to break away from it, with the Odyssey 3.14 method.</p>
        <p>
          Like Odysseus, you sail home after the war. You start at <b>Troy</b>: a traditional business model that everyone in an industry copies. You end at <b>Ithaca</b> with a reinvented one that you designed and defended.
        </p>
        <p>Between them lie fourteen islands. Each teaches one way to reinvent a business model and asks you to apply it to your own business.</p>
      </>
    ),
  },
  {
    title: 'Every business model has three pillars',
    body: (
      <>
        <div className="pillars">
          <div className="pillar">
            <b>
              <PillarBadge k="p" /> Value proposition
            </b>
            <span>What you offer, to whom, at what price.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="a" /> Value architecture
            </b>
            <span>How you build and deliver it: value chain, partners, resources.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="c" /> Contributions
            </b>
            <span>What it gives back: financial, environmental and societal.</span>
          </div>
        </div>
        <p>A strong model is one where the proposition and the architecture fit together. Near the end of the voyage, the gods of Olympus will test exactly that fit.</p>
      </>
    ),
  },
  {
    title: 'Explore widely, then go deep',
    body: (
      <>
        <p>
          Odyssey 3.14 gives you fourteen directions to reinvent a business model. You explore all of them, but no business uses them all: the winners combine <b>a few directions that reinforce each other</b>.
        </p>
        <p>
          So the islands are a fast idea hunt. If a direction does not fit your business, say so and explain why: that is a valid answer (only ideas go forward, though). Then you choose your best pair, one promise and the change that makes it possible, and go deep.
        </p>
        <div className="score-split" aria-label="How your score is built">
          <span>Quick checks 10%</span>
          <span>Troy 10%</span>
          <span>14 islands 20%</span>
          <span>Your two chosen ideas, Aeolus, Lemnos and Olympus: 60%</span>
        </div>
      </>
    ),
  },
  {
    title: 'How the voyage works',
    body: (
      <ol className="steps">
        <li>
          <b>Troy.</b> Describe the traditional business model you want to reinvent.
        </li>
        <li>
          <b>Fourteen numbered islands</b>, the 14 directions of Odyssey 3.14: islands 1 to 7 change the value proposition (<PillarBadge k="p" />), 8 to 14 the value architecture (<PillarBadge k="a" />). At each one: a real case, a quick check that tests the logic, then one or two short questions that apply the direction to your business (or a reasoned “this doesn’t fit”). Halfway, at <b>the Narrows</b>, you chart how your business is built and delivered.
        </li>
        <li>
          <b>Aeolus</b> checks that your ideas hold together, <b>Lemnos</b> forges them into one model, and the <b>gods of Olympus</b> question it.
        </li>
        <li>
          <b>Athena</b>, your coach, reviews every answer and asks hard questions. She never writes your ideas. Your score and a Captain&rsquo;s Log wait at Ithaca.
        </li>
      </ol>
    ),
  },
]

const COACH_LINES = [
  'I am Athena, your mentor. I will walk with you from Troy to Ithaca.',
  'Learn these three pillars. I will come back to them at every island.',
  'Breadth finds the ideas. Depth wins the score.',
  'I ask, I never answer. And when an idea is weak, I will tell you so.',
]

export function Intro() {
  const s = useGame()
  const step = s.introStep
  const cur = STEPS[step]
  const done = () => s.set({ phase: s.startedAt ? 'play' : 'setup' })
  const ref = useRef<HTMLDivElement>(null)
  useDialog(ref, done)
  // each new step: focus the main button, so Enter keeps going
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
  }, [step])
  return (
    <div className="overlay">
      <div className="frieze parchment" role="dialog" aria-modal="true" aria-label="How the voyage works" ref={ref}>
        <div className="meander-band" />
        <p className="step">
          {step + 1} of {STEPS.length}
        </p>
        <h2>{cur.title}</h2>
        <div className="intro-coach">
          <Athena mood={step === STEPS.length - 1 ? 'stern' : 'pleased'} size={88} />
          <p>{COACH_LINES[step]}</p>
        </div>
        {cur.body}
        <div className="dots">
          {STEPS.map((_, i) => (
            <i key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <div className="row" style={{ display: 'flex', gap: 10 }}>
          <button className="btn ghost" onClick={done}>
            {s.startedAt ? 'Close' : 'Skip'}
          </button>
          <span style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button className="btn" onClick={() => s.set({ introStep: step - 1 })}>
                Back
              </button>
            )}
            <button
              className="btn primary"
              data-autofocus
              onClick={() => {
                audio.click()
                if (step < STEPS.length - 1) s.set({ introStep: step + 1 })
                else done()
              }}
            >
              {step < STEPS.length - 1 ? 'Next' : s.startedAt ? 'Back to the voyage' : 'Choose your ship'}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

const SHIPS: { id: ShipStyle; name: string; blurb: string }[] = [
  { id: 'black', name: 'The Black Ship', blurb: 'Homer’s black ships, with the painted eye that watches the sea' },
  { id: 'owl', name: 'The Owl of Athena', blurb: 'Red-figure hull, and the goddess of wisdom’s owl on the sail' },
  { id: 'dolphin', name: 'The Dolphin', blurb: 'Aegean blue and gold, with Poseidon’s dolphin leaping on the sail' },
]

export function Setup() {
  const s = useGame()
  const [demo, setDemo] = useState(false)
  const [pick, setPick] = useState('phone')
  const [name, setName] = useState('')
  const [crew, setCrew] = useState<string[]>([])
  const [ship, setShip] = useState<ShipStyle>('black')
  const [framing, setFraming] = useState<Framing>('incumbent')
  // only the selected ship is a live 3D view; the others show a still taken from their first frame
  const [snaps, setSnaps] = useState<Partial<Record<ShipStyle, string>>>({})
  const crewRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  useDialog(ref)
  const practice = VOYAGES.filter((v) => v.id !== 'own')
  return (
    <div className="overlay">
      <div className="setup parchment" role="dialog" aria-modal="true" aria-label="Start your voyage" ref={ref}>
        <div className="meander-band" />
        <h2 style={{ marginTop: 14 }}>{demo ? 'Demo voyage' : 'Your voyage'}</h2>
        {!demo ? (
          <>
            <p>
              Bring a real business, a startup idea or a company you know well. You will describe its traditional model at Troy and reinvent it on the way to Ithaca.
            </p>
            <div className="field">
              <div className="field-label" id="framing-label">
                Who are you on this voyage?
              </div>
              <div className="seg fit-toggle" role="group" aria-labelledby="framing-label">
                <button type="button" aria-pressed={framing === 'incumbent'} onClick={() => setFraming('incumbent')}>
                  An existing company reinventing its model
                </button>
                <button type="button" aria-pressed={framing === 'startup'} onClick={() => setFraming('startup')}>
                  A startup attacking an industry
                </button>
              </div>
              <small className="count">
                {framing === 'startup' ? 'Troy will be the incumbents’ model you want to beat, not your startup.' : 'Troy will be your company’s model as it works today.'}
              </small>
            </div>
          </>
        ) : (
          <>
            <p>For a guided walkthrough in class. Each demo starts from the traditional business, with Troy and the value chain already described; at Ithaca, Tiresias reveals what the real company did.</p>
            <div className="ships">
              {practice.map((v) => (
                <button key={v.id} className="ship-card" aria-pressed={pick === v.id} onClick={() => (setPick(v.id), audio.click())}>
                  <b>{v.title}</b>
                  <span>{v.blurb}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="field">
          <div className="field-label">Choose your ship</div>
          <div className="ship-styles">
            {SHIPS.map((x) => (
              <button key={x.id} type="button" className="ship-style" aria-pressed={ship === x.id} onClick={() => (setShip(x.id), audio.click())}>
                {NO3D ? (
                  <span className="ship-canvas" />
                ) : ship !== x.id && snaps[x.id] ? (
                  <img className="ship-canvas" src={snaps[x.id]} alt="" />
                ) : (
                  <ShipPreview3D style={x.id} active={ship === x.id} onSnap={(url) => setSnaps((m) => (m[x.id] ? m : { ...m, [x.id]: url }))} />
                )}
                <span>{x.name}</span>
                <small>{x.blurb}</small>
              </button>
            ))}
          </div>
        </div>
        <label className="field" style={{ maxWidth: 360 }}>
          <span>
            Captain&rsquo;s full name <small>optional, printed on your assignment</small>
          </span>
          <input type="text" value={name} placeholder="Leave blank to sail as one of Odysseus’ crew" onChange={(e) => setName(e.target.value)} />
        </label>
        <div ref={crewRef}>
          {crew.map((c, i) => (
            <label className="crew-row" key={i}>
              <small>Crewmate {i + 1}</small>
              <input type="text" value={c} placeholder="Full name" onChange={(e) => setCrew(crew.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="btn ghost small" aria-label={`Remove crewmate ${i + 1}`} onClick={() => setCrew(crew.filter((_, j) => j !== i))}>
                Remove
              </button>
            </label>
          ))}
        </div>
        {crew.length < 6 && (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setCrew([...crew, ''])
              // focus the new name box, so the next keystrokes go into it
              requestAnimationFrame(() => [...(crewRef.current?.querySelectorAll('input') ?? [])].at(-1)?.focus())
            }}
          >
            + Add a crewmate (team project)
          </button>
        )}
        <div className="submit-row">
          <button
            className="btn primary"
            onClick={() => {
              audio.start()
              audio.success()
              s.startVoyage(demo ? pick : 'own', name, crew, ship, framing)
            }}
          >
            {demo ? 'Start the demo at Troy' : 'Set sail from Troy'}
          </button>
          <button className="btn ghost" onClick={() => setDemo(!demo)}>
            {demo ? 'Back to my own business' : 'Demo mode for teachers'}
          </button>
        </div>
      </div>
    </div>
  )
}
