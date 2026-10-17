import { useState } from 'react'
import { audio } from '../audio/engine'
import { VOYAGES } from '../content/voyages'
import { useGame, type ShipStyle } from '../store'
import { Athena } from './Athena'

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
          Sail your business model from Troy to Ithaca. Learn the fourteen directions, apply them to a real business, and defend your new model before the gods. About twenty-five minutes.
        </p>
        <div className="row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn primary"
            onClick={() => {
              audio.start()
              s.set({ phase: 'intro', introStep: 0 })
            }}
          >
            Begin the voyage
          </button>
          {saved && (
            <button
              className="btn"
              onClick={() => {
                audio.start()
                s.set({ phase: 'play' })
              }}
            >
              Continue your voyage
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
    title: 'How the voyage works',
    body: (
      <ol className="steps">
        <li>
          <b>Troy.</b> Describe the traditional business model you want to reinvent.
        </li>
        <li>
          <b>Fourteen numbered islands</b>, the 14 directions of Odyssey 3.14: islands 1 to 7 change the value proposition (<PillarBadge k="p" />), 8 to 14 the value architecture (<PillarBadge k="a" />). At each one: a real case, a quick check that tests the logic, then one or two short questions that apply the direction to your business. Halfway, at <b>the Narrows</b>, you chart how your business is built and delivered.
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
  'I ask, I never answer. And when an idea is weak, I will tell you so.',
]

export function Intro() {
  const s = useGame()
  const step = s.introStep
  const cur = STEPS[step]
  const done = () => s.set({ phase: s.startedAt ? 'play' : 'setup' })
  return (
    <div className="overlay">
      <div className="frieze parchment" role="dialog" aria-label="How the voyage works">
        <div className="meander-band" />
        <p className="step">
          {step + 1} of {STEPS.length}
        </p>
        <h2>{cur.title}</h2>
        <div className="intro-coach">
          <Athena mood={step === 2 ? 'stern' : 'pleased'} size={88} />
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
            Skip
          </button>
          <span style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button className="btn" onClick={() => s.set({ introStep: step - 1 })}>
                Back
              </button>
            )}
            <button
              className="btn primary"
              onClick={() => {
                audio.click()
                if (step < STEPS.length - 1) s.set({ introStep: step + 1 })
                else done()
              }}
            >
              {step < STEPS.length - 1 ? 'Next' : 'Choose your ship'}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

const SHIPS: { id: ShipStyle; name: string; hull: string; stripe: string; sail: string; mark: string }[] = [
  { id: 'black', name: 'The Black Ship', hull: '#1d1714', stripe: '#c4562c', sail: '#efe6d4', mark: 'eye' },
  { id: 'owl', name: 'The Owl of Athena', hull: '#c4562c', stripe: '#1d1714', sail: '#c4562c', mark: 'owl' },
  { id: 'dolphin', name: 'The Dolphin', hull: '#24577a', stripe: '#d9a23e', sail: '#2f6f9a', mark: 'dolphin' },
]

function ShipPreview({ s }: { s: (typeof SHIPS)[number] }) {
  return (
    <svg viewBox="0 0 120 80" width="120" height="80" aria-hidden="true">
      <path d="M8 66 Q60 60 112 52" stroke="#2f6f9a" strokeWidth="2" fill="none" opacity="0.5" />
      <polygon points="14,48 22,60 92,60 108,56 96,52 100,46 92,50 24,50" fill={s.hull} />
      <polygon points="22,50 92,50 91,53 23,53" fill={s.stripe} />
      <line x1="58" y1="50" x2="58" y2="10" stroke="#5a3c22" strokeWidth="2" />
      <rect x="40" y="14" width="36" height="30" fill={s.sail} stroke="#1d1714" strokeWidth="1" />
      {s.id === 'dolphin' && [44, 52, 60, 68].map((x) => <rect key={x} x={x} y="14" width="4" height="30" fill="#efe6d4" />)}
      {s.mark === 'eye' && (
        <>
          <ellipse cx="58" cy="29" rx="11" ry="6" fill="#1d1714" />
          <circle cx="58" cy="29" r="3" fill="#c4562c" />
        </>
      )}
      {s.mark === 'owl' && (
        <>
          <ellipse cx="58" cy="31" rx="7" ry="9" fill="#1d1714" />
          <circle cx="55.5" cy="28" r="2.2" fill="#d9a23e" />
          <circle cx="60.5" cy="28" r="2.2" fill="#d9a23e" />
        </>
      )}
      {s.mark === 'dolphin' && (
        <>
          <circle cx="58" cy="29" r="10" fill="#efe6d4" />
          <path d="M50 32 Q56 21 66 26 L68 24 L67 28 Q60 33 54 33 Z" fill="#1d1714" />
        </>
      )}
    </svg>
  )
}

export function Setup() {
  const s = useGame()
  const [demo, setDemo] = useState(false)
  const [pick, setPick] = useState('phone')
  const [name, setName] = useState('')
  const [crew, setCrew] = useState<string[]>([])
  const [ship, setShip] = useState<ShipStyle>('black')
  const practice = VOYAGES.filter((v) => v.id !== 'own')
  return (
    <div className="overlay">
      <div className="setup parchment" role="dialog" aria-label="Start your voyage">
        <div className="meander-band" />
        <h2 style={{ marginTop: 14 }}>{demo ? 'Demo voyage' : 'Your voyage'}</h2>
        {!demo ? (
          <p>
            Bring a real business, a startup idea or a company you know well. You will describe its traditional model at Troy and reinvent it on the way to Ithaca.
          </p>
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
                <ShipPreview s={x} />
                <span>{x.name}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="field" style={{ maxWidth: 360 }}>
          <span>
            Captain&rsquo;s name <small>optional</small>
          </span>
          <input type="text" value={name} placeholder="Leave blank to sail as one of Odysseus’ crew" onChange={(e) => setName(e.target.value)} />
        </label>
        {crew.map((c, i) => (
          <div className="crew-row" key={i}>
            <input type="text" value={c} placeholder={`Crewmate ${i + 1}`} aria-label={`Crewmate ${i + 1}`} onChange={(e) => setCrew(crew.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className="btn ghost small" aria-label={`Remove crewmate ${i + 1}`} onClick={() => setCrew(crew.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        {crew.length < 6 && (
          <button type="button" className="link-btn" onClick={() => setCrew([...crew, ''])}>
            + Add a crewmate (team project)
          </button>
        )}
        <div className="submit-row">
          <button
            className="btn primary"
            onClick={() => {
              audio.start()
              audio.success()
              s.startVoyage(demo ? pick : 'own', name, crew, ship)
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
