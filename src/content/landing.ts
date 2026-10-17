// Island answers: each direction asks its own one to three questions (see Direction.steps).
import { ADD_STEPS, type Direction, type Step } from './directions'

export type Sign = '+' | '0' | '-'
export type LandingValue = string | string[] | Record<string, string>
export type Landing = Record<string, LandingValue>

export interface NarrowsAnswer {
  chain: string[]
  resources: string[]
  partners: string
}

export interface StepContext {
  attributes: string[]
  chain: string[]
  resources: string[]
}

export const CONTRIBS = ['financial', 'environmental', 'societal'] as const

const words = (s: string) => (s.match(/[\p{L}\p{N}%€$'’-]+/gu) ?? []).length

export const OTHER = 'Other: '
export const isOther = (v: unknown) => typeof v === 'string' && v.startsWith(OTHER)
export const stripOther = (v: string) => (isOther(v) ? v.slice(OTHER.length) : v)

// Placeholder or keyboard-mash text ("test test test", "asdf", "lorem ipsum", "xxx"):
// caught before Athena is asked, so it can never earn points.
const FILLER = new Set(['test', 'testing', 'tests', 'asdf', 'qwerty', 'lorem', 'ipsum', 'dolor', 'blah', 'bla', 'xxx', 'xx', 'x', 'aaa', 'abc', 'foo', 'bar', 'idk', 'dunno', 'something', 'stuff', 'todo', 'tbd', 'na', 'n/a', 'none', 'nothing', 'hello', 'hi', 'ok', 'yes', 'no'])
export function isJunk(text: string): boolean {
  const ws = (text.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) ?? []).filter(Boolean)
  if (!ws.length) return false
  const filler = ws.filter((w) => FILLER.has(w)).length
  if (filler / ws.length >= 0.5) return true
  const unique = new Set(ws).size
  if (ws.length >= 4 && unique / ws.length < 0.35) return true // the same word over and over
  const letters = ws.join('')
  if (letters.length >= 8 && !/[aeiouy]/.test(letters)) return true // no vowels: keyboard mash
  if (ws.some((w) => w.length > 25)) return true
  return false
}
export function junkFields(values: string[]): boolean {
  return values.some((v) => v.trim() && isJunk(v))
}

export function optionsFor(step: Step, ctx: StepContext): string[] {
  if (step.kind !== 'pick') return []
  if (step.options) return step.options
  const clean = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean)
  switch (step.source) {
    case 'attributes':
      return clean(ctx.attributes)
    case 'chain':
      return clean(ctx.chain)
    case 'resources':
      return clean(ctx.resources)
    case 'cutAdd':
      return [...clean(ctx.chain).map((s) => `Remove: ${s}`), ...ADD_STEPS]
    default:
      return []
  }
}

export function emptyLanding(d: Direction): Landing {
  const a: Landing = {}
  d.steps.forEach((s) => {
    if (s.kind === 'slots') a[s.id] = s.slots.map(() => '')
    else if (s.kind === 'checks') a[s.id] = []
    else if (s.kind === 'signs') a[s.id] = { financial: '', environmental: '', societal: '' }
    else a[s.id] = ''
  })
  return a
}

// A reasoned "this direction doesn't fit my business" is a legitimate outcome of the method.
export const isNoFit = (a: Landing | undefined) => a?._mode === 'nofit'
export const NOFIT_MIN = 15

export function missingFor(d: Direction, a: Landing): string[] {
  const out: string[] = []
  if (isNoFit(a)) {
    const t = String(a.nofit ?? '')
    if (words(t) < NOFIT_MIN) out.push(`Explain in at least ${NOFIT_MIN} words why this direction does not fit, and what would have to change for it to fit.`)
    if (junkFields([t])) out.push('Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.')
    return out
  }
  d.steps.forEach((s, i) => {
    const n = d.steps.length > 1 ? `${i + 1}. ` : ''
    const v = a[s.id]
    if (s.kind === 'pick' && !v) out.push(`${n}Pick one option.`)
    if (s.kind === 'pick' && isOther(v) && words(stripOther(String(v))) < 1) out.push(`${n}Say what “something else” is.`)
    if (s.kind === 'text') {
      const w = words(String(v ?? ''))
      if (w < s.min) out.push(`${n}Write at least ${s.min} word${s.min > 1 ? 's' : ''}${s.short ? '' : ' (be concrete: who, what, how)'}.`)
      if (w > s.max + 10) out.push(`${n}Cut it down to about ${s.max} words.`)
    }
    if (s.kind === 'slots') {
      const arr = (v as string[]) ?? []
      const empty = s.slots.map((sl, j) => (words(arr[j] ?? '') < s.min ? sl.label : null)).filter(Boolean)
      if (empty.length) out.push(`${n}Fill in ${empty.map((e) => `“${e}”`).join(', ')} (at least ${s.min} word${s.min > 1 ? 's' : ''} each).`)
    }
    if (s.kind === 'signs') {
      const r = (v as Record<string, string>) ?? {}
      if (!CONTRIBS.every((k) => r[k])) out.push(`${n}Give each contribution a sign: +, 0 or −.`)
    }
  })
  const texts = d.steps.flatMap((s) => {
    const v = a[s.id]
    if (s.kind === 'text') return [String(v ?? '')]
    if (s.kind === 'slots') return (v as string[]) ?? []
    if (s.kind === 'pick' && isOther(v)) return [stripOther(String(v))]
    return []
  })
  if (junkFields(texts)) out.push('Placeholder text like “test test” is not an answer. Write what you really think, even if it is rough.')
  return out
}

const show = (v: LandingValue | undefined): string => {
  if (v == null) return ''
  if (typeof v === 'string') return stripOther(v).trim()
  if (Array.isArray(v)) return v.map((x) => x.trim()).filter(Boolean).join('; ')
  return CONTRIBS.map((k) => `${k} ${v[k] || '?'}`).join(', ')
}

// One line that captures the idea, for Aeolus and the Captain's Log
export function summaryOf(d: Direction, a: Landing | undefined): string {
  if (!a) return ''
  if (isNoFit(a)) return `Does not fit: ${String(a.nofit ?? '').trim()}`
  const main = d.steps.find((s) => s.id === d.main)
  if (!main) return show(a[d.main])
  if (main.kind === 'slots') {
    const arr = (a[main.id] as string[]) ?? []
    const lead = d.steps.find((s) => s.kind === 'pick' || (s.kind === 'text' && s.short))
    const head = lead ? show(a[lead.id]) : ''
    // before/after pairs read best as the "after" alone
    const body = main.slots.length === 2 ? arr[1] ?? '' : arr.filter(Boolean).join('; ')
    return head ? `${head}: ${body}` : body
  }
  return show(a[main.id])
}

// Question-and-answer lines for the coach and the log
export function flattenLanding(d: Direction, a: Landing): string {
  if (isNoFit(a)) return `NO FIT: the student argues this direction does not fit their business.\nWhy it does not fit, and what would have to change for it to fit:\n- ${String(a.nofit ?? '').trim()}`
  return d.steps
    .map((s) => {
      if (s.kind === 'slots') {
        const arr = (a[s.id] as string[]) ?? []
        return `${s.label}\n${s.slots.map((sl, j) => `- ${sl.label}: ${arr[j] ?? ''}`).join('\n')}`
      }
      return `${s.label}\n- ${show(a[s.id]) || '(blank)'}`
    })
    .join('\n')
}

export const allText = (a: Landing | undefined) => (a ? Object.values(a).map(show).join(' ') : '')
