import { useRef, useState } from 'react'
import { audio } from '../audio/engine'
import { requestGrade, requestHint, type GradeRequest } from '../coach/grade'
import { DIRECTIONS } from '../content/directions'
import { summaryOf } from '../content/landing'
import { voyageById } from '../content/voyages'
import { useGame, type Grade } from '../store'

export function troyContext() {
  const s = useGame.getState()
  const v = voyageById(s.voyageId)
  const t = s.troy?.answer
  if (!t) return v.title
  return [
    `Business: ${v.id === 'own' ? 'the student’s own project' : v.title}`,
    `Offer: ${t.offer}`,
    `User: ${t.user}. Decision-maker: ${t.decider}. Payer: ${t.payer}. Price: ${t.price}`,
    `Value curve today: ${t.attributes.map((a) => `${a.name || '?'} ${a.level}/5`).join(', ')}`,
    `Customer frustration: ${t.frustration}`,
    `Industry orthodoxy: ${t.orthodoxy}`,
    s.narrows ? `Value chain: ${s.narrows.chain.filter(Boolean).join(' > ')}. Key resources: ${s.narrows.resources.filter(Boolean).join(', ')}. Partners: ${s.narrows.partners}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Earlier answers on this voyage, so Athena's reviews and nudges build on them
export function journeyContext(skip?: string) {
  const s = useGame.getState()
  const lines: string[] = []
  DIRECTIONS.forEach((d) => {
    const l = s.landings[d.id]
    if (l && skip !== `land${d.id}`) lines.push(`Island ${d.id} (${d.name}): ${summaryOf(d, l.answer).slice(0, 160)}`)
  })
  if (s.aeolus && skip !== 'aeolus') lines.push(`Aeolus plan: ${s.aeolus.answer.sentence}`)
  if (s.lemnos && skip !== 'lemnos') lines.push(`Lemnos model: ${s.lemnos.answer.name}: ${s.lemnos.answer.pitch}`)
  return lines.join('\n')
}

// Shared submit / revise / hint flow for every graded task.
export function useGradedTask(key: string, grades: Grade[]) {
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(grades.length === 0)
  // kept in the store so Athena never repeats a question after the panel closes
  const [hints, setHints] = useDraft<string[]>(`hints:${key}`, () => [])
  const [hintBusy, setHintBusy] = useState(false)
  const used = useGame((s) => s.hints[key] ?? 0)

  const lastCall = useRef<{ req: Omit<GradeRequest, 'context'>; save: (g: Grade) => void } | null>(null)

  const submit = async (req: Omit<GradeRequest, 'context'>, save: (g: Grade) => void) => {
    lastCall.current = { req, save }
    setBusy(true)
    audio.submit()
    const g = await requestGrade({ ...req, context: troyContext(), journey: journeyContext(key) })
    save(g)
    setBusy(false)
    setEditing(false)
    if (g.total / g.max >= 0.75) audio.laurel()
    else if (g.total / g.max >= 0.4) audio.success()
    else audio.wrong()
  }

  const ask = async (req: Omit<GradeRequest, 'context'>) => {
    if (used >= 2) return
    setHintBusy(true)
    const q = await requestHint({ ...req, context: troyContext(), journey: journeyContext(key) }, hints)
    setHints((h) => [...h, q])
    useGame.getState().useHint(key)
    setHintBusy(false)
    audio.click()
  }

  // after an offline estimate: ask the real coach again (the estimate is replaced, not counted as a revision)
  const retry = () => (lastCall.current ? submit(lastCall.current.req, lastCall.current.save) : setEditing(true))

  return {
    busy,
    editing,
    setEditing,
    submit,
    retry,
    ask,
    hints,
    hintBusy,
    hintsLeft: 2 - used,
    // one revision; unlimited rewrites after a 0, which blocks the voyage until fixed
    canRevise: grades.length === 1 || (grades.length > 0 && grades[grades.length - 1].total === 0),
    attempt: grades.length,
    last: grades[grades.length - 1] ?? null,
  }
}

// Unsubmitted answers live in the store (and so in localStorage) so nothing is lost when
// the panel closes for the chart, the menu, sailing or a reload.
export function useDraft<T>(key: string, init: () => T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => (useGame.getState().drafts[key] as T | undefined) ?? init())
  const current = useRef(value)
  current.current = value
  const update = (next: T | ((prev: T) => T)) => {
    const v = typeof next === 'function' ? (next as (p: T) => T)(current.current) : next
    current.current = v
    setValue(v)
    useGame.getState().setDraft(key, v)
  }
  return [value, update]
}
