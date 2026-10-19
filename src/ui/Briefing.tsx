// Before island 1: Athena explains how to play the fourteen islands. Explore widely, it is fine
// to say a direction does not fit, and most of the score comes from going deep on two ideas.
import { useRef } from 'react'
import { audio } from '../audio/engine'
import { useGame } from '../store'
import { Athena } from './Athena'
import { useDialog } from './common'

export function Briefing() {
  const set = useGame((s) => s.set)
  const ref = useRef<HTMLDivElement>(null)
  const ok = () => (audio.click(), set({ briefed: true }))
  useDialog(ref, ok)
  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-labelledby="brief-title" ref={ref}>
      <div className="celebrate-card parchment">
        <div className="meander-band" />
        <div className="celebrate-body">
          <span aria-hidden="true">
            <Athena mood="neutral" size={190} />
          </span>
          <div>
            <h2 id="brief-title">Fourteen islands: explore widely, then go deep</h2>
            <p>Each island is one of the fourteen directions of Odyssey 3.14. Treat them as a fast idea hunt, not an exam on every direction:</p>
            <ul className="brief-list">
              <li>
                <b>One or two quick questions per island.</b> Rough, concrete ideas beat polished vague ones.
              </li>
              <li>
                <b>“This direction doesn’t fit my business” is a valid answer.</b> No real business uses all fourteen. Say why it fails for you, and what would have to change for it to fit: a sharp argument scores as well as an idea. But only ideas go forward to Aeolus, so keep at least one idea in each sea.
              </li>
              <li>
                <b>The islands count for 20% of your score.</b> At Aeolus you will choose your best two ideas, one from each sea. Those two ideas and the model you build on them at Lemnos and Olympus count for <b>60%</b>.
              </li>
            </ul>
            <p className="count">Knowledge checks and Troy count for the last 20%.</p>
            <button className="btn primary" data-autofocus onClick={ok}>
              Understood, show me island 1
            </button>
          </div>
        </div>
        <div className="meander-band" />
      </div>
    </div>
  )
}
