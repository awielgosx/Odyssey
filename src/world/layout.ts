import { DIRECTIONS } from '../content/directions'

export interface IslandSpot {
  key: string
  directionId?: number
  x: number
  z: number
  radius: number
  height: number
  seed: number
}

// Ithaca sits south, Olympus north. The Sea of Proposition arcs west,
// the Sea of Architecture arcs east: the map itself reads as the 3-pillar model.
const arc = (count: number, side: -1 | 1) =>
  Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const angle = Math.PI * (0.12 + 0.76 * t) // from south-ish to north-ish
    const r = 30 + (i % 2 === 0 ? 0 : 6)
    return {
      x: side * Math.sin(angle) * r,
      z: Math.cos(angle) * r * 1.05 + 4,
    }
  })

const west = arc(7, -1)
const east = arc(7, 1)

export const ISLANDS: IslandSpot[] = [
  { key: 'ithaca', x: 0, z: 40, radius: 6.5, height: 2.6, seed: 3 },
  { key: 'olympus', x: 0, z: -34, radius: 7.5, height: 9, seed: 11 },
  ...DIRECTIONS.map((d) => {
    const p = d.pillar === 'proposition' ? west[d.id - 1] : east[d.id - 8]
    return {
      key: `d${d.id}`,
      directionId: d.id,
      x: p.x,
      z: p.z,
      radius: 3.6 + ((d.id * 37) % 10) / 10,
      height: 1.8 + ((d.id * 53) % 10) / 9,
      seed: d.id * 101,
    }
  }),
]

export const islandByKey = (key: string) => ISLANDS.find((i) => i.key === key)!

// A tiny deterministic RNG so every island looks the same on every visit.
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}
