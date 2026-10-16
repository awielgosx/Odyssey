import { useState } from 'react'
import { audio } from '../audio/engine'
import { VOYAGES } from '../content/voyages'
import { useGame } from '../store'
import { Owl } from './common'

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
          A study tool for the Odyssey 3.14 approach to business model innovation (Lehmann-Ortega, Musikas and Schoettl, HEC Paris). Sound on, and best on a laptop.
        </p>
        <div className="meander-band" style={{ marginTop: 18 }} />
      </div>
    </div>
  )
}

const PillarBadge = ({ k }: { k: 'p' | 'a' | 'c' }) => <span className={`badge ${k}`}>{k.toUpperCase()}</span>

const STEPS = [
  {
    title: 'Every industry has a Troy',
    body: (
      <>
        <p>Troy is the business model everyone in an industry copies and fights over: same customers, same offer, same way of making money.</p>
        <p>You won’t win by fighting harder. Like Odysseus, you will sail away and come home changed. Odyssey 3.14, the HEC method for business model innovation, is your chart.</p>
      </>
    ),
  },
  {
    title: 'A business model has three pillars',
    body: (
      <>
        <div className="pillars">
          <div className="pillar">
            <b>
              <PillarBadge k="p" /> Value proposition
            </b>
            <span>What you offer, to whom (user, decision-maker, payer) and at what price.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="a" /> Value architecture
            </b>
            <span>How you build and deliver it: value chain, partners, resources and competencies.</span>
          </div>
          <div className="pillar">
            <b>
              <PillarBadge k="c" /> Contributions
            </b>
            <span>What it gives back: financial, environmental and societal, each rated +, 0 or {'−'}.</span>
          </div>
        </div>
        <p>Strong business models combine a proposition and an architecture that fit each other. That fit is what the gods will test at the end.</p>
      </>
    ),
  },
  {
    title: 'Fourteen islands, fourteen directions',
    body: (
      <>
        <p>
          Each numbered island is one of the 14 directions for finding new business models. Islands 1 to 7 lie in the <b>Sea of the Value Proposition</b>; islands 8 to 14 in the <b>Sea of the Value Architecture</b>. The badge on each flag says which pillar it changes.
        </p>
        <p>At every island you read a short case from the course and answer one quick question. Where an idea sparks, you <b>land</b> and apply the direction to your own business. Land at least once in each sea.</p>
      </>
    ),
  },
  {
    title: 'Then the real tests',
    body: (
      <>
        <p>
          <b>Aeolus</b> checks that one idea from each sea holds together. At <b>Lemnos</b>, Hephaestus’ forge, you shape your new business model and its value curve. On <b>Olympus</b> the gods question it and you design the cheapest test. Then you sail home to <b>Ithaca</b> with your Captain’s Log.
        </p>
      </>
    ),
  },
  {
    title: 'Athena will ask, never answer',
    body: (
      <>
        <p>Athena, in the shape of an owl, reviews every answer you write with the course rubric and asks one question about your weakest point. You can revise each answer once. She never writes your ideas for you.</p>
        <p>Laurels {'❦'} show your progress. Your final grade weighs knowledge, framing, application and synthesis. Use the ribbon at the top to see where you are and to sail back to any island you passed.</p>
      </>
    ),
  },
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
        {step === 4 && (
          <div className="art">
            <Owl className="owl big" />
          </div>
        )}
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
  const [pick, setPick] = useState(s.voyageId)
  const [name, setName] = useState('')
  return (
    <div className="overlay">
      <div className="setup parchment" role="dialog" aria-label="Choose your voyage">
        <div className="meander-band" />
        <h2 style={{ marginTop: 14 }}>Choose your ship</h2>
        <p>Practice on a real company that reinvented its industry (you start from the conventional business and discover the real story at the end), or sail with your own business or project.</p>
        <div className="ships">
          {VOYAGES.map((v) => (
            <button key={v.id} className="ship-card" aria-pressed={pick === v.id} onClick={() => (setPick(v.id), audio.click())}>
              <b>{v.title}</b>
              <span>{v.blurb}</span>
            </button>
          ))}
        </div>
        <label className="field" style={{ maxWidth: 360 }}>
          <span>
            Captain's name <small>optional</small>
          </span>
          <input type="text" value={name} placeholder="Leave blank to sail as Nobody" onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="submit-row">
          <button
            className="btn primary"
            onClick={() => {
              audio.start()
              audio.success()
              s.startVoyage(pick, name)
            }}
          >
            Set sail from Troy
          </button>
        </div>
      </div>
    </div>
  )
}
