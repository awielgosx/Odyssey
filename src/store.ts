import { create } from 'zustand'

export type Quality = 'high' | 'low'

interface GameState {
  quality: Quality
  target: string // island the ship is heading to or docked at
  sailing: boolean
  visited: string[]
  diceOpen: boolean
  setQuality: (q: Quality) => void
  sailTo: (key: string) => void
  arrive: () => void
  openDice: (open: boolean) => void
}

export const useGame = create<GameState>((set, get) => ({
  quality: 'high',
  target: 'ithaca',
  sailing: false,
  visited: ['ithaca'],
  diceOpen: false,
  setQuality: (quality) => set({ quality }),
  sailTo: (key) => {
    if (get().sailing || get().target === key) return
    set({ target: key, sailing: true })
  },
  arrive: () =>
    set((s) => ({
      sailing: false,
      visited: s.visited.includes(s.target) ? s.visited : [...s.visited, s.target],
    })),
  openDice: (diceOpen) => set({ diceOpen }),
}))
