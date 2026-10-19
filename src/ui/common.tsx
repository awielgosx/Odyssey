import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import type { Grade } from '../store'

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

// Athena's owl, drawn like the one on Athenian silver coins.
export function Owl({ className = 'owl' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="38" rx="20" ry="23" fill="#1d1714" />
      <path d="M14 22 L20 10 L26 20 Z M50 22 L44 10 L38 20 Z" fill="#1d1714" />
      <circle cx="24" cy="30" r="8.5" fill="#e2894f" />
      <circle cx="40" cy="30" r="8.5" fill="#e2894f" />
      <circle cx="24" cy="30" r="3.6" fill="#1d1714" />
      <circle cx="40" cy="30" r="3.6" fill="#1d1714" />
      <path d="M29 36 L32 42 L35 36 Z" fill="#e8bf55" />
      <path d="M20 48 Q32 56 44 48" stroke="#e2894f" strokeWidth="2" fill="none" />
      <path d="M22 54 Q32 60 42 54" stroke="#e2894f" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function LaurelRow({ score, max }: { score: number; max: number }) {
  return (
    <span className="laurels" aria-label={`${score} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < score ? '' : 'empty'}>
          {'❦'}
        </span>
      ))}
    </span>
  )
}

export function Field({
  label,
  hint,
  value,
  onChange,
  limit,
  rows = 2,
  placeholder,
  single,
}: {
  label: ReactNode
  hint?: string
  value: string
  onChange: (v: string) => void
  limit?: number
  rows?: number
  placeholder?: string
  single?: boolean
}) {
  const n = wordCount(value)
  return (
    <label className="field">
      <span>
        {label}
        {limit ? <small className={`count ${n > limit ? 'over' : ''}`}>{n}/{limit} words</small> : hint ? <small>{hint}</small> : null}
      </span>
      {single ? (
        <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

export function GradeView({ grade, attempt, canRevise, onRevise, onRetry, busy }: { grade: Grade; attempt: number; canRevise: boolean; onRevise?: () => void; onRetry?: () => void; busy?: boolean }) {
  return (
    <div className="grade" role="status" tabIndex={-1}>
      <div className="grade-head">
        <h3>{attempt > 1 ? 'Athena’s second review' : 'Athena’s review'}</h3>
        <span className="grade-total">
          {grade.total}/{grade.max}
        </span>
      </div>
      {grade.scores.map((s) => (
        <div className="crit" key={s.criterion}>
          <span>{s.criterion}</span>
          <LaurelRow score={s.score} max={s.max} />
          {s.note && <span className="note">{s.note}</span>}
        </div>
      ))}
      {grade.feedback && <p className="lede">{grade.feedback}</p>}
      {grade.question && grade.total < grade.max && (
        <div className="hint">
          <b>Athena asks:</b> {grade.question}
        </div>
      )}
      {grade.source === 'estimate' && (
        <div className="estimate">
          <p>
            Athena could not be reached just now (busy or offline), so this is a <b>provisional estimate</b> from simple checks, always below full marks. It counts for at most half marks in your voyage score until Athena reviews it. You can ask her again now, improve your answer first, or sail on and send all pending answers from Ithaca.
          </p>
          <div className="submit-row">
            {onRetry && (
              <button className="btn small primary" disabled={busy} onClick={onRetry}>
                {busy ? 'Athena is reading\u2026' : 'Ask Athena again'}
              </button>
            )}
            {onRevise && (
              <button className="btn small" disabled={busy} onClick={onRevise}>
                Edit my answer
              </button>
            )}
          </div>
        </div>
      )}
      {grade.total === 0 && grade.source !== 'estimate' && (
        <div className="hint zero" role="alert">
          <b>Zero laurels: you cannot sail on yet.</b> Rewrite your answer with real substance and submit it again.
        </div>
      )}
      {canRevise && onRevise && grade.total < grade.max && grade.source !== 'estimate' && (
        <div className="submit-row">
          <button className={`btn small ${grade.total === 0 ? 'primary' : ''}`} onClick={onRevise}>
            {grade.total === 0 ? 'Rewrite and resubmit' : 'Revise once'}
          </button>
          <small className="count">{grade.total === 0 ? 'Rewrites after a zero are unlimited.' : 'Only your final review counts.'}</small>
        </div>
      )}
    </div>
  )
}

export function SignToggle({ value, onChange, label }: { value: string; onChange: (v: '+' | '0' | '-') => void; label: string }) {
  return (
    <span className="sign" role="group" aria-label={label}>
      {(['+', '0', '-'] as const).map((s) => (
        <button key={s} type="button" aria-pressed={value === s} onClick={() => onChange(s)} aria-label={`${label}: ${s === '+' ? 'positive' : s === '0' ? 'neutral' : 'negative'}`}>
          {s === '-' ? '−' : s}
        </button>
      ))}
    </span>
  )
}

// Shown while a reviewed answer is being revised: the review above still counts until resubmitted.
export function RevisingNote({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="hint revising" role="note">
      <b>You are revising.</b> Athena’s last review still counts until you submit again.{' '}
      <button type="button" className="link-btn" onClick={onCancel}>
        Cancel and keep my reviewed answer
      </button>
    </div>
  )
}

// Modal behaviour for overlays: focus moves in (to [data-autofocus] or the first control), Tab stays
// inside, Escape runs the given action, and focus returns where it was on close.
export function useDialog(ref: RefObject<HTMLElement | null>, onEscape?: () => void) {
  const esc = useRef(onEscape)
  esc.current = onEscape
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prev = document.activeElement as HTMLElement | null
    const focusables = () => [...el.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, a[href], [tabindex]:not([tabindex="-1"])')]
    ;(el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && esc.current) {
        e.preventDefault()
        esc.current()
        return
      }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (!el.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true })
    }
  }, [ref])
}

export const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
