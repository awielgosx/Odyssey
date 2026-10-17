import { useState } from 'react'
import { audio } from '../audio/engine'
import { VOYAGES } from '../content/voyages'
import { useGame } from '../store'
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
          Sail your business model from Troy to Ithaca. Learn the fourteen directions, apply them to a real business, and defend your new model before the gods. About twenty minutes.
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
        </p>
        <div className="meander-band" style={{ marginTop: 18 }} />
      </div>
    </div>
  )
}

const PillarBadge = ({ k }: { k: 'p' | 'a' | 'c' }) => <span className={`badge ${k}`}>{k.toUpperCase()}</span>

const STEPS = [
  {
    title: 'Reinvent a business model in twenty minutes',
    body: (
      <>
        <p>
          In 2000, Michelin stopped only selling truck tyres and started selling <b>kilometres</b>: fleets paid per kilometre driven, Michelin kept the tyres and looked after them. Same product, new business model. That is the kind of move you will learn to make.
        </p>
        <p>You start at <b>Troy</b>: a traditional business model that everyone in an industry copies. You end at <b>Ithaca</b> with a reinvented one that you designed and defended.</p>
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
            <span>What you offer, to whom, at what price. Michelin: kilometres instead of tyres, paid per km.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="a" /> Value architecture
            </b>
            <span>How you build and deliver it. Michelin: tyre maintenance across Europe, through partner workshops.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="c" /> Contributions
            </b>
            <span>What it gives back: financial, environmental, societal. Michelin: longer-lasting tyres, but more capital tied up.</span>
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
  'I am Athena, disguised as Mentor. I will walk with you from Troy to Ithaca.',
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

export function Setup() {
  const s = useGame()
  const [demo, setDemo] = useState(false)
  const [pick, setPick] = useState('phone')
  const [name, setName] = useState('')
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
            <p>For a guided walkthrough in class. Each demo starts from the traditional business, with Troy already described; at Ithaca, Tiresias reveals what the real company did.</p>
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
        <label className="field" style={{ maxWidth: 360 }}>
          <span>
            Captain&rsquo;s name <small>optional</small>
          </span>
          <input type="text" value={name} placeholder="Leave blank to sail as one of Odysseus’ crew" onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="submit-row">
          <button
            className="btn primary"
            onClick={() => {
              audio.start()
              audio.success()
              s.startVoyage(demo ? pick : 'own', name)
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
