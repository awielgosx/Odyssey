import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { demoDrafts } from './content/demos'
import type { Landing, NarrowsAnswer, Sign } from './content/landing'
import { voyageById, type Attribute } from './content/voyages'
import { STOPS } from './world/layout'

export type { Landing, NarrowsAnswer, Sign }

export type Quality = 'high' | 'low'
export type Phase = 'title' | 'intro' | 'setup' | 'play'
export type ShipStyle = 'black' | 'owl' | 'dolphin'
// Reinventing an existing company, or a startup attacking the incumbents' model
export type Framing = 'incumbent' | 'startup'

// What was sent for review, kept with a provisional estimate so Athena can review it later
export interface PendingReview {
  kind: 'troy' | 'landing' | 'aeolus' | 'lemnos' | 'olympus'
  directionId?: number
  answer: string
  extra?: object
}

export interface Grade {
  scores: { criterion: string; score: number; max: number; note: string }[]
  total: number
  max: number
  feedback: string
  question: string
  source: 'ai' | 'estimate' | 'rules'
  pending?: PendingReview
}

export interface TroyAnswer {
  offer: string
  user: string
  decider: string
  payer: string
  price: string
  attributes: Attribute[]
  frustration: string
  orthodoxy: string
  trend: string
}

export interface CheckState {
  firstTry: boolean | null
  done: boolean
  wrong: number[]
}

export interface LemnosAnswer {
  name: string
  pitch: string
  curve: number[]
  added?: Attribute[] // attributes Troy never offered (created at the forge)
  chain?: string[] // the new value chain
  price?: string // the new price and revenue model
  zone: string
  indicators: Record<string, Sign | ''>
  antagonism: string
}

export interface OlympusAnswer {
  god: string
  answer: string
  hypotheses?: { p: string; a: string; c: string } // one per pillar
  riskiest?: 'p' | 'a' | 'c'
  assumption: string
  mvp: string
  stake: string
}

export interface AeolusAnswer {
  p: number | null
  a: number | null
  promise?: string // the value-proposition change, prefilled from the chosen island
  enabler?: string // the value-architecture change, prefilled from the chosen island
  link?: string // why the second makes the first possible: the heart of the exercise
  who?: string
  gain?: string // the contribution indicator that improves most
  sentence: string // assembled from the parts above
}

interface Attempts<T> {
  answer: T
  grades: Grade[]
}

interface GameState {
  // settings
  quality: Quality
  sound: boolean
  wax: boolean
  // flow
  phase: Phase
  introStep: number
  voyageId: string
  captain: string
  captainAuto: boolean // name drawn from Odysseus' crew because the field was left blank
  crew: string[]
  shipStyle: ShipStyle
  framing: Framing
  startedAt: number | null
  finishedAt: number | null
  // position
  stopIndex: number
  furthest: number
  sailing: boolean
  chart: boolean
  // answers
  troy: Attempts<TroyAnswer> | null
  narrows: NarrowsAnswer | null
  checks: Record<number, CheckState>
  landings: Record<number, Attempts<Landing>>
  landingOpen: number | null
  aeolus: Attempts<AeolusAnswer> | null
  lemnos: Attempts<LemnosAnswer> | null
  olympus: Attempts<OlympusAnswer> | null
  hints: Record<string, number>
  eggs: string[]
  drafts: Record<string, unknown>
  celebrated: boolean
  briefed: boolean
  toast: { text: string; id: number } | null
  // actions
  set: (p: Partial<GameState>) => void
  startVoyage: (voyageId: string, captain: string, crew?: string[], shipStyle?: ShipStyle, framing?: Framing) => void
  sailTo: (index: number) => void
  arrive: () => void
  answerCheck: (id: number, optionIndex: number, correct: boolean) => void
  saveTroy: (answer: TroyAnswer, grade?: Grade) => void
  saveNarrows: (answer: NarrowsAnswer) => void
  saveLanding: (id: number, answer: Landing, grade?: Grade) => void
  saveAeolus: (answer: AeolusAnswer, grade?: Grade) => void
  saveLemnos: (answer: LemnosAnswer, grade?: Grade) => void
  saveOlympus: (answer: OlympusAnswer, grade?: Grade) => void
  useHint: (key: string) => void
  findEgg: (key: string, text: string) => void
  say: (text: string) => void
  setDraft: (key: string, value: unknown) => void
  reset: () => void
}

// Odysseus' crew, for captains who leave their name blank
const CREW = ['Eurylochus', 'Polites', 'Elpenor', 'Perimedes', 'Antiphus', 'Eurybates', 'Halitherses']

// Writes are debounced: every keystroke updates a draft, and serialising the whole voyage on each
// one made typing sluggish on slower laptops. Pending writes are flushed when the tab is hidden.
function debounced(store: Storage) {
  const queue = new Map<string, string>()
  let timer: number | undefined
  const flush = () => {
    window.clearTimeout(timer)
    timer = undefined
    queue.forEach((v, k) => {
      try {
        store.setItem(k, v)
      } catch {
        /* full or blocked: keep playing in memory */
      }
    })
    queue.clear()
  }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush())
  return {
    getItem: (k: string) => queue.get(k) ?? store.getItem(k),
    setItem: (k: string, v: string) => {
      queue.set(k, v)
      if (timer === undefined) timer = window.setTimeout(flush, 400)
    },
    removeItem: (k: string) => {
      queue.delete(k)
      store.removeItem(k)
    },
  }
}

const safeStorage = createJSONStorage(() => {
  try {
    const k = '__o314_test'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return debounced(localStorage)
  } catch {
    const mem = new Map<string, string>()
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
  }
})

const fresh = {
  phase: 'title' as Phase,
  introStep: 0,
  voyageId: 'phone',
  captain: '',
  captainAuto: false,
  crew: [] as string[],
  shipStyle: 'black' as ShipStyle,
  framing: 'incumbent' as Framing,
  startedAt: null,
  finishedAt: null,
  stopIndex: 0,
  furthest: 0,
  sailing: false,
  chart: false,
  troy: null,
  narrows: null,
  checks: {},
  landings: {},
  landingOpen: null,
  aeolus: null,
  lemnos: null,
  olympus: null,
  hints: {},
  eggs: [] as string[],
  drafts: {} as Record<string, unknown>,
  celebrated: false,
  briefed: false,
  toast: null,
}

// An offline estimate is provisional: the next review replaces it instead of counting as a revision.
function push<T>(prev: Attempts<T> | null | undefined, answer: T, grade?: Grade): Attempts<T> {
  const old = prev?.grades ?? []
  const kept = old.length && old[old.length - 1].source === 'estimate' ? old.slice(0, -1) : old
  return { answer, grades: grade ? [...kept, grade] : old }
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      quality: 'high',
      sound: true,
      wax: false,
      ...fresh,
      set: (p) => set(p),
      startVoyage: (voyageId, captain, crew = [], shipStyle = 'black', framing = 'incumbent') => {
        const v = voyageById(voyageId)
        set({
          ...fresh,
          phase: 'play',
          voyageId,
          captain: captain.trim() || CREW[Math.floor(Math.random() * CREW.length)],
          captainAuto: !captain.trim(),
          crew: crew.map((c) => c.trim()).filter(Boolean),
          shipStyle,
          framing: voyageId === 'own' ? framing : 'incumbent',
          startedAt: Date.now(),
          troy: {
            answer: {
              offer: v.offer,
              user: v.user,
              decider: v.decider,
              payer: v.payer,
              price: v.price,
              attributes: v.attributes.map((a) => ({ ...a })),
              frustration: v.frustration ?? '',
              orthodoxy: v.orthodoxy ?? '',
              trend: v.trend ?? '',
            },
            grades: [],
          },
          narrows: v.chain ? { chain: [...v.chain], resources: [...(v.resources ?? [])], partners: v.partners ?? '' } : null,
          // demo ships come with every answer drafted, ready to submit live in class
          drafts: demoDrafts(v),
        })
      },
      sailTo: (index) => {
        const s = get()
        if (s.sailing || index === s.stopIndex || index < 0 || index >= STOPS.length) return
        if (index > s.furthest + 1 && !freeTravel(s)) return
        set({ stopIndex: index, sailing: true, landingOpen: null })
      },
      arrive: () => {
        const s = get()
        const last = s.stopIndex === STOPS.length - 1
        set({ sailing: false, furthest: Math.max(s.furthest, s.stopIndex), finishedAt: last && !s.finishedAt ? Date.now() : s.finishedAt })
      },
      answerCheck: (id, optionIndex, correct) => {
        const prev = get().checks[id] ?? { firstTry: null, done: false, wrong: [] }
        if (prev.done) return
        set({
          checks: {
            ...get().checks,
            [id]: {
              firstTry: prev.firstTry === null ? correct : prev.firstTry,
              done: correct,
              wrong: correct ? prev.wrong : [...prev.wrong, optionIndex],
            },
          },
        })
      },
      saveTroy: (answer, grade) => set({ troy: push(get().troy, answer, grade) }),
      saveNarrows: (answer) => set({ narrows: answer }),
      saveLanding: (id, answer, grade) => set({ landings: { ...get().landings, [id]: push(get().landings[id], answer, grade) } }),
      saveAeolus: (answer, grade) => set({ aeolus: push(get().aeolus, answer, grade) }),
      saveLemnos: (answer, grade) => set({ lemnos: push(get().lemnos, answer, grade) }),
      saveOlympus: (answer, grade) => set({ olympus: push(get().olympus, answer, grade) }),
      useHint: (key) => set({ hints: { ...get().hints, [key]: (get().hints[key] ?? 0) + 1 } }),
      findEgg: (key, text) => {
        const eggs = get().eggs.includes(key) ? get().eggs : [...get().eggs, key]
        set({ eggs, toast: { text, id: Date.now() } })
      },
      say: (text) => set({ toast: { text, id: Date.now() } }),
      setDraft: (key, value) => set({ drafts: { ...get().drafts, [key]: value } }),
      reset: () => set({ ...fresh }),
    }),
    {
      name: 'odyssey-314-voyage',
      storage: safeStorage,
      version: 2,
      // v2: islands ask their own questions. Keep Troy, clear answers built on the old island form.
      migrate: (old, version) => {
        const s = (old ?? {}) as Partial<GameState>
        if (version < 2) {
          const drafts = Object.fromEntries(Object.entries(s.drafts ?? {}).filter(([k]) => k === 'troy'))
          return { ...s, landings: {}, aeolus: null, lemnos: null, olympus: null, narrows: null, drafts, stopIndex: Math.min(s.stopIndex ?? 0, 1), furthest: Math.min(s.furthest ?? 0, 1), finishedAt: null } as GameState
        }
        return s as GameState
      },
      // a reload mid-sail: the ship is at its destination, so count it as reached
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>
        const merged = { ...current, ...p }
        return { ...merged, furthest: Math.max(merged.furthest ?? 0, merged.stopIndex ?? 0) }
      },
      partialize: (s) => {
        // don't persist transient flags
        const { sailing, toast, chart, ...rest } = s
        void sailing
        void toast
        void chart
        return rest
      },
    },
  ),
)

// ---------- derived helpers ----------

// Demo ships can sail anywhere at once, for class walkthroughs and testing.
export const freeTravel = (s: { voyageId: string }) => s.voyageId !== 'own'

export const bestGrade = (a: { grades: Grade[] } | null | undefined) => (a && a.grades.length ? a.grades[a.grades.length - 1] : null)

// A review of 0 is a fail: the player rewrites before sailing on.
export const passed = (a: { grades: Grade[] } | null | undefined) => (bestGrade(a)?.total ?? 0) > 0

export function stopComplete(s: GameState, index: number): boolean {
  const stop = STOPS[index]
  switch (stop.kind) {
    case 'troy':
      return passed(s.troy)
    case 'island':
      return !!s.checks[stop.directionId!]?.done && passed(s.landings[stop.directionId!])
    case 'narrows':
      return !!s.narrows
    case 'aeolus':
      return passed(s.aeolus)
    case 'lemnos':
      return passed(s.lemnos)
    case 'olympus':
      return passed(s.olympus)
    case 'ithaca':
      return true
  }
}

// The draft key of the task at a stop (matches useGradedTask keys)
export function stopKey(index: number): string | null {
  const stop = STOPS[index]
  if (!stop) return null
  if (stop.kind === 'island') return `land${stop.directionId}`
  return stop.kind === 'ithaca' ? null : stop.kind
}

// A reviewed answer is open for revision here: sailing on would leave unsubmitted changes behind
export function revisingHere(s: GameState): boolean {
  const key = stopKey(s.stopIndex)
  if (!key || s.drafts[`editing:${key}`] !== true) return false
  if (key === 'narrows') return !!s.narrows
  const rec = key === 'troy' ? s.troy : key === 'aeolus' ? s.aeolus : key === 'lemnos' ? s.lemnos : key === 'olympus' ? s.olympus : s.landings[Number(key.slice(4))]
  return !!rec?.grades.length
}

export function landedIn(s: GameState, pillar: 'proposition' | 'architecture') {
  return Object.entries(s.landings)
    .filter(([id, l]) => (pillar === 'proposition' ? +id <= 7 : +id >= 8) && l.grades.length > 0)
    .map(([id]) => +id)
}

export function laurels(s: GameState) {
  let n = 0
  Object.values(s.checks).forEach((c) => (n += c.firstTry ? 1 : 0))
  const g = (a: { grades: Grade[] } | null | undefined) => bestGrade(a)?.total ?? 0
  n += g(s.troy) + g(s.aeolus) + g(s.lemnos) + g(s.olympus)
  Object.values(s.landings).forEach((l) => (n += g(l)))
  return n
}

export interface FinalGrade {
  knowledge: number
  framing: number
  application: number
  synthesis: number
  percent: number
  outOf20: number
  rank: string
  polytropos: boolean
  pending: number
}

// Quick checks: 1 point right first time, 0.4 on the second try, nothing after that
export const checkValue = (c: CheckState | undefined) => (c?.done ? (c.wrong.length === 0 ? 1 : c.wrong.length === 1 ? 0.4 : 0) : 0)
export const checkPoints = (s: Pick<GameState, 'checks'>) => Object.values(s.checks).reduce((m, c) => m + checkValue(c), 0)

// Odyssey 3.14 explores all fourteen directions but wins on a few. The score follows that:
// Knowledge 10% (quick checks), Framing 10% (Troy), Exploration 20% (all fourteen islands,
// lightly weighted), Focus 60% (the two ideas chosen at Aeolus, Aeolus, Lemnos and Olympus).
export const WEIGHTS = { knowledge: 0.1, framing: 0.1, application: 0.2, synthesis: 0.6 }

// A provisional estimate (Athena unreachable) counts for at most half marks until she reviews it,
// so simple checks can never stand in for a real review.
export const ESTIMATE_CEILING = 0.5
const ratio = (a: { grades: Grade[] } | null | undefined) => {
  const g = bestGrade(a)
  if (!g) return 0
  const r = g.total / g.max
  return g.source === 'estimate' ? Math.min(ESTIMATE_CEILING, r) : r
}

// Answers still waiting for Athena's real review
export function pendingReviews(s: Pick<GameState, 'troy' | 'landings' | 'aeolus' | 'lemnos' | 'olympus'>) {
  const out: { key: string; label: string }[] = []
  const add = (key: string, label: string, a: { grades: Grade[] } | null | undefined) => bestGrade(a)?.source === 'estimate' && out.push({ key, label })
  add('troy', 'Troy', s.troy)
  Object.keys(s.landings)
    .map(Number)
    .sort((x, y) => x - y)
    .forEach((id) => add(`land${id}`, `Island ${id}`, s.landings[id]))
  add('aeolus', 'Aeolus', s.aeolus)
  add('lemnos', 'Lemnos', s.lemnos)
  add('olympus', 'Olympus', s.olympus)
  return out
}

export function finalGrade(s: GameState): FinalGrade {
  const firstTry = Object.values(s.checks).filter((c) => c.firstTry).length
  const knowledge = checkPoints(s) / 14
  const framing = ratio(s.troy)
  const application = Array.from({ length: 14 }, (_, i) => ratio(s.landings[i + 1])).reduce((m, x) => m + x, 0) / 14
  const chosen = s.aeolus?.answer
  const chosenIdeas = chosen?.p && chosen?.a ? (ratio(s.landings[chosen.p]) + ratio(s.landings[chosen.a])) / 2 : 0
  const synthesis = (chosenIdeas + ratio(s.aeolus) + ratio(s.lemnos) + ratio(s.olympus)) / 4
  const percent = Math.round((knowledge * WEIGHTS.knowledge + framing * WEIGHTS.framing + application * WEIGHTS.application + synthesis * WEIGHTS.synthesis) * 100)
  const rank = percent >= 85 ? 'Captain' : percent >= 70 ? 'Navigator' : percent >= 50 ? 'Helmsman' : 'Deckhand'
  const polytropos = percent >= 90 && firstTry >= 12
  const pending = pendingReviews(s).length
  return { knowledge, framing, application, synthesis, percent, outOf20: Math.round(percent * 2) / 10, rank, polytropos: polytropos && pending === 0, pending }
}
