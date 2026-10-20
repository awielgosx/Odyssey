import { directionById } from '../content/directions'
import { allText, isNoFit, missingFor, type Landing } from '../content/landing'
import type { Grade } from '../store'
import { maxFor, RUBRICS, type TaskKind } from './rubrics'

// ---------- request ----------

export interface GradeRequest {
  kind: TaskKind
  directionId?: number
  context: string // the reference business, in a few lines
  journey?: string // earlier answers on this voyage, so Athena can build on them
  answer: string // the student's answer, flattened to labelled lines
  extra?: object // structured fields for the fallback grader
}

const TIMEOUT_MS = 58000
// one id per browser tab, so the server can rate-limit per player rather than per campus network
const SID = Math.random().toString(36).slice(2, 12)

export async function requestGrade(req: GradeRequest): Promise<Grade> {
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-voyage': SID },
      body: JSON.stringify({ mode: 'grade', ...req }),
      signal: ctl.signal,
    })
    clearTimeout(t)
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    return normalise(req.kind, data)
  } catch {
    // keep what was sent, so Athena can review it properly once she is reachable
    return { ...estimate(req), pending: { kind: req.kind, directionId: req.directionId, answer: req.answer, extra: req.extra } }
  }
}

export async function requestHint(req: GradeRequest, previous: string[]): Promise<string> {
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-voyage': SID },
      body: JSON.stringify({ mode: 'hint', ...req, previous }),
      signal: ctl.signal,
    })
    clearTimeout(t)
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    if (typeof data.question === 'string' && data.question.length > 5) return data.question
    throw new Error('empty')
  } catch {
    return fallbackHint(req, previous)
  }
}

function normalise(kind: TaskKind, data: { scores?: { criterion: string; score: number; note?: string }[]; feedback?: string; question?: string }): Grade {
  const rubric = RUBRICS[kind]
  const scores = rubric.map((c) => {
    const hit = data.scores?.find((s) => s.criterion === c.key)
    const score = Math.max(0, Math.min(c.max, Math.round(Number(hit?.score ?? 0))))
    return { criterion: c.label, score, max: c.max, note: String(hit?.note ?? '') }
  })
  const total = scores.reduce((m, s) => m + s.score, 0)
  return {
    scores,
    total,
    max: maxFor(kind),
    feedback: String(data.feedback ?? ''),
    question: String(data.question ?? ''),
    source: (data as { model?: string }).model === 'rules' ? 'rules' : 'ai',
  }
}

// ---------- fallback grader ----------

const VAGUE = ['better', 'improve', 'innovative', 'innovation', 'solution', 'leverage', 'synergy', 'optimize', 'optimise', 'disrupt', 'value', 'things', 'stuff', 'more efficient', 'sustainable']

const words = (s: string) => (s.match(/[\p{L}\p{N}%€$'-]+/gu) ?? []).length

function specificity(text: string) {
  const w = words(text)
  if (w < 5) return 0
  const lower = text.toLowerCase()
  const vague = VAGUE.filter((v) => lower.includes(v)).length
  const concrete = /\d/.test(text) || /\b(per|every|each|instead of|at the|through|via|for)\b/i.test(text)
  // a capital mid-sentence (not after a full stop) suggests a named actor, product or place
  const named = /[a-z,;]\s+[A-Z][a-z]+/.test(text)
  let s = 1
  if ((concrete || named) && w >= 10) s = 2
  if (vague >= 2 && w < 18) s = Math.max(0, s - 1)
  return s
}

// whole words only: "ai" must not match "maintain"
function lexHits(text: string, lexicon: string[]) {
  const lower = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}%]+/gu, ' ')} `
  return lexicon.filter((k) => lower.includes(` ${k.toLowerCase()}`)).length
}

// Always below the maximum, as the review panel promises
const CAP: Record<TaskKind, number> = { troy: 3, landing: 4, aeolus: 3, lemnos: 6, olympus: 4 }

export function estimate(req: GradeRequest): Grade {
  const rubric = RUBRICS[req.kind]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = (req.extra ?? {}) as Record<string, any>
  const raw: Record<string, number> = {}
  switch (req.kind) {
    case 'troy': {
      const roles = [e.offer, e.user, e.payer, e.price].filter((x) => words(x ?? '') >= 1).length
      raw.framing = roles >= 4 && (e.user ?? '') !== (e.payer ?? '') ? 2 : roles >= 3 ? 1 : roles >= 4 ? 2 : 0
      raw.insight = (words(e.frustration ?? '') >= 6 ? 1 : 0) + (words(e.orthodoxy ?? '') >= 6 ? 1 : 0)
      break
    }
    case 'landing': {
      const d = directionById(req.directionId ?? 1)
      const answer = e as Landing
      if (isNoFit(answer)) {
        // a reasoned "doesn't fit": the direction's own logic, and the condition under which it would fit
        const t = String(answer.nofit ?? '')
        raw.grounded = specificity(t) >= 2 ? 1 : 0
        raw.logic = lexHits(t, d.lexicon) >= 1 ? 1 : 0
        raw.consequence = /\b(if|unless|would|only when|as long as|until|provided)\b/i.test(t) ? 1 : 0
        break
      }
      const text = allText(answer)
      const hits = lexHits(text, d.lexicon)
      raw.grounded = specificity(text)
      raw.logic = hits >= 2 ? 2 : hits === 1 || words(text) >= 14 ? 1 : 0
      const honest = /\b(but|cost|costs|worse|lose|risk|trade|give up|instead|less|fewer|pay)\b/i.test(text)
      raw.consequence = (missingFor(d, answer).length === 0 && words(text) >= 16 ? 1 : 0) + (honest ? 1 : 0)
      break
    }
    case 'aeolus': {
      const s = String(e.sentence ?? '')
      raw.coherence = /because/i.test(s) && /(can|could|lets|allows)/i.test(s) && words(s) >= 14 ? 2 : words(s) >= 8 ? 1 : 0
      raw.specificity = specificity(s)
      break
    }
    case 'lemnos': {
      const before = (e.before ?? []) as unknown as number[]
      const after = (e.curve ?? []) as unknown as number[]
      const lowered = after.some((v, i) => v < before[i])
      const raised = after.some((v, i) => v > before[i])
      raw.curve = (raised ? 1 : 0) + (raised && lowered ? 1 : 0)
      raw.positioning = (e.zone ? 1 : 0) + (specificity(String(e.pitch ?? '')) >= 1 && words(String(e.pitch ?? '')) >= 8 ? 1 : 0)
      raw.coherence = words(String(e.pitch ?? '')) >= 10 ? 1 : 0
      const ind = (e.indicators ?? {}) as unknown as Record<string, string>
      raw.contributions = (Object.values(ind).filter(Boolean).length >= 9 ? 1 : 0) + (words(String(e.antagonism ?? '')) >= 8 ? 1 : 0)
      break
    }
    case 'olympus': {
      raw.defence = words(String(e.answer ?? '')) >= 15 ? 1 + (specificity(String(e.answer)) >= 2 ? 1 : 0) : words(String(e.answer ?? '')) >= 6 ? 1 : 0
      const h = (e.hypotheses ?? {}) as Record<string, string>
      raw.hypotheses = (['p', 'a', 'c'].every((k) => words(h[k] ?? '') >= 5) ? 1 : 0) + (e.riskiest ? 1 : 0)
      raw.test = (words(String(e.assumption ?? '')) >= 5 && words(String(e.mvp ?? '')) >= 6 ? 1 : 0) + (/\d/.test(String(e.stake ?? '')) ? 1 : 0)
      break
    }
  }
  let scores = rubric.map((c) => ({ criterion: c.label, score: Math.min(c.max, raw[c.key] ?? 0), max: c.max, note: '' }))
  // the estimate is capped so it never beats a real review; trim the last of the top-scoring criteria
  let total = scores.reduce((m, s) => m + s.score, 0)
  while (total > CAP[req.kind]) {
    const top = Math.max(...scores.map((x) => x.score))
    const i = scores.map((x) => x.score).lastIndexOf(top)
    scores = scores.map((s, j) => (j === i ? { ...s, score: s.score - 1 } : s))
    total--
  }
  // an answer that passed every gate is never stuck at zero by simple checks: only Athena can fail it
  if (total === 0) {
    scores = scores.map((s, j) => (j === 0 ? { ...s, score: 1 } : s))
    total = 1
  }
  const weakest = rubric[scores.reduce((wi, s, i, arr) => (s.score / s.max < arr[wi].score / arr[wi].max ? i : wi), 0)]
  return {
    scores,
    total,
    max: maxFor(req.kind),
    feedback:
      total >= maxFor(req.kind) - 1 ? 'The structure is all there, judging by simple checks.' : 'Judging by simple checks, one part still looks thin.',
    question: weakest.question,
    source: 'estimate',
  }
}

// Offline nudge: find the weakest criterion in the current draft and ask about it.
function fallbackHint(req: GradeRequest, previous: string[]) {
  const est = estimate(req)
  const rubric = RUBRICS[req.kind]
  const order = est.scores.map((sc, i) => ({ i, r: sc.score / sc.max })).sort((a, b) => a.r - b.r)
  for (const { i } of order) {
    const q = rubric[i].question
    if (!previous.includes(q)) return q
  }
  const nofit = req.kind === 'landing' && isNoFit(req.extra as Landing)
  if (nofit) {
    const d = directionById(req.directionId ?? 1)
    const qs = [
      `What exactly in your business blocks “${d.name.toLowerCase()}”: a customer, a regulation, a cost, or a step in the value chain?`,
      'Under what condition would this direction start to fit? Name the one thing that would have to change.',
      `The case on this island worked for a very different business. Which part of its mechanism could still apply to yours?`,
    ]
    const q = qs.find((x) => !previous.includes(x))
    if (q) return q
  }
  const extra = req.kind === 'landing' && req.directionId ? directionById(req.directionId).questions : []
  return extra.find((q) => !previous.includes(q)) ?? 'Which part of your answer would a sceptical investor attack first, and why?'
}
