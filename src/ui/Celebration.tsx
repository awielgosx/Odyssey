// Arrival at Ithaca: three seconds of confetti in vase colours (laurel leaves, clay and ochre
// flecks, black-figure chips), a livelier lyre, and Athena front and centre with what to do next.
import { useEffect, useRef } from 'react'
import { audio } from '../audio/engine'
import { finalGrade, useGame } from '../store'
import { Athena } from './Athena'
import { prefersReducedMotion, useDialog } from './common'

const COLORS = ['#d9a23e', '#c4562c', '#1d1714', '#efe6d4', '#7a8a3a', '#9a3f1c', '#e2c27a']

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      c.width = window.innerWidth * dpr
      c.height = window.innerHeight * dpr
    }
    resize()
    const W = () => c.width
    const H = () => c.height
    type P = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; col: string; kind: number }
    const parts: P[] = []
    const burst = (fromLeft: boolean) => {
      for (let i = 0; i < 90; i++) {
        const ang = (fromLeft ? -1.05 : -2.09) + (Math.random() - 0.5) * 0.7
        const sp = (14 + Math.random() * 12) * dpr
        parts.push({
          x: fromLeft ? 0 : W(),
          y: H() * 0.95,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          s: (5 + Math.random() * 7) * dpr,
          col: COLORS[Math.floor(Math.random() * COLORS.length)],
          kind: Math.floor(Math.random() * 3),
        })
      }
    }
    burst(true)
    burst(false)
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const el = t - t0
      ctx.clearRect(0, 0, W(), H())
      for (const p of parts) {
        p.vy += 0.38 * dpr
        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.r += p.vr
        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - 2400) / 600)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.r)
        ctx.fillStyle = p.col
        if (p.kind === 0) {
          // a laurel leaf
          ctx.beginPath()
          ctx.ellipse(0, 0, p.s, p.s * 0.38, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.kind === 1) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
        else {
          ctx.beginPath()
          ctx.moveTo(-p.s / 2, p.s / 2)
          ctx.lineTo(-p.s / 2, -p.s / 2)
          ctx.lineTo(p.s / 2, -p.s / 2)
          ctx.lineTo(p.s / 2, 0)
          ctx.lineWidth = 2 * dpr
          ctx.strokeStyle = p.col
          ctx.stroke()
        }
        ctx.restore()
      }
      if (el < 3000) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W(), H())
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}

// "Ana", "Ana and Ben", "Ana, Ben and Chloé"
const names = (xs: string[]) => (xs.length <= 1 ? xs[0] ?? 'captain' : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

export function Celebration() {
  const s = useGame()
  const g = finalGrade(s)
  const ref = useRef<HTMLDivElement>(null)
  const still = prefersReducedMotion()
  useEffect(() => {
    audio.fanfare()
  }, [])
  const close = () => s.set({ celebrated: true })
  useDialog(ref, close)
  const crew = [s.captain, ...(s.crew ?? [])].filter(Boolean)
  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-labelledby="home-title" ref={ref}>
      {!still && <Confetti />}
      <div className="celebrate-card parchment">
        <div className="meander-band" />
        <div className="celebrate-body">
          <span aria-hidden="true">
            <Athena mood="pleased" size={210} />
          </span>
          <div>
            <h2 id="home-title">Welcome home, {names(crew)}!</h2>
            <p>
              {crew.length > 1 ? 'Together you sailed' : 'You sailed'} from Troy past all fourteen islands, held your plan together before Aeolus, forged a new business model and stood before the gods. Argos recognised you first. So do I.
            </p>
            <p className="celebrate-score">
              Voyage score <b>{g.outOf20}/20</b> · {g.polytropos ? 'Polytropos, the man of many turns' : g.rank}
              {g.pending > 0 && <small className="count"> ({g.pending} answers still wait for Athena’s review: send them from the panel to firm up your score)</small>}
            </p>
            <p>
              <b>What now?</b>
            </p>
            <ol>
              <li>Export your assignment as a PDF: choose the Contemporary or the Scholar style, add your full names and group, and edit any sentence before saving.</li>
              <li>Download the full Captain’s Log if you want every answer and review.</li>
              <li>Then run your Olympus test for real: the riskiest assumption is where your model is most likely to fail.</li>
            </ol>
            <button className="btn primary" data-autofocus onClick={close}>
              See my results
            </button>
          </div>
        </div>
        <div className="meander-band" />
      </div>
    </div>
  )
}
