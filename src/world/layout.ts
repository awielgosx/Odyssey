import * as THREE from 'three'
import { DIRECTIONS } from '../content/directions'

// ---------------------------------------------------------------------------
// The voyage runs left to right: Troy (your business today) on the far west,
// through the Sea of the Value Proposition (1-7), the Narrows, the Sea of the
// Value Architecture (8-14), then Aeolus, Lemnos, Olympus and home to Ithaca.
// ---------------------------------------------------------------------------

export type StopKind = 'troy' | 'island' | 'narrows' | 'aeolus' | 'lemnos' | 'olympus' | 'ithaca'

export interface Stop {
  key: string
  kind: StopKind
  label: string
  directionId?: number
  index: number
  dock: THREE.Vector3 // where the ship waits, on the sea lane
  island?: IslandSpot
}

export interface IslandSpot {
  key: string
  x: number
  z: number
  radius: number
  height: number
  seed: number
  shape: 'random' | 'ithaca' | 'crescent' | 'round'
  poly: THREE.Vector2[] // coastline in local x/z
}

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

// ---------------- coastlines ----------------

function randomCoast(seed: number, r: number) {
  const rand = rng(seed)
  const N = 56
  const harmonics = Array.from({ length: 5 }, (_, i) => ({ k: i + 2, a: (0.05 + rand() * 0.16) / Math.pow(i + 1, 0.6), p: rand() * Math.PI * 2 }))
  const bays = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => ({ at: rand() * Math.PI * 2, depth: 0.18 + rand() * 0.22, w: 0.18 + rand() * 0.2 }))
  const capes = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => ({ at: rand() * Math.PI * 2, h: 0.15 + rand() * 0.25, w: 0.12 + rand() * 0.15 }))
  const aspect = 1 + rand() * 0.6
  const rot = rand() * Math.PI
  const pts: THREE.Vector2[] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    let f = 1
    for (const h of harmonics) f += h.a * Math.sin(h.k * t + h.p)
    for (const b of bays) {
      const d = Math.atan2(Math.sin(t - b.at), Math.cos(t - b.at))
      f -= b.depth * Math.exp(-(d * d) / (2 * b.w * b.w))
    }
    for (const c of capes) {
      const d = Math.atan2(Math.sin(t - c.at), Math.cos(t - c.at))
      f += c.h * Math.exp(-(d * d) / (2 * c.w * c.w))
    }
    f = Math.max(0.5, f)
    const x = Math.cos(t) * r * f * aspect
    const z = Math.sin(t) * r * f / Math.sqrt(aspect)
    pts.push(new THREE.Vector2(x * Math.cos(rot) - z * Math.sin(rot), x * Math.sin(rot) + z * Math.cos(rot)))
  }
  return pts
}

// Simplified outline of the real Ithaca: two lobes joined by the narrow Aetos isthmus.
const ITHACA_OUTLINE = [
  [-0.3, -2.3], [0.15, -2.35], [0.6, -2.05], [0.95, -1.6], [0.85, -1.15], [1.0, -0.8], [0.55, -0.45], [0.25, -0.12],
  [0.3, 0.25], [0.75, 0.45], [1.15, 0.85], [1.1, 1.4], [0.75, 1.95], [0.25, 2.25], [-0.3, 2.05], [-0.55, 1.55],
  [-0.45, 1.05], [-0.7, 0.75], [-0.25, 0.4], [-0.12, 0.05], [-0.3, -0.3], [-0.75, -0.55], [-0.95, -1.05], [-0.8, -1.55], [-0.75, -2.0],
]

function ithacaCoast(r: number) {
  // rotate so the island lies east-west along the voyage
  return ITHACA_OUTLINE.map(([x, z]) => new THREE.Vector2(z * r * 0.5, -x * r * 0.5))
}

// A broken caldera ring, like Santorini (Thera).
function crescentCoast(r: number) {
  const pts: THREE.Vector2[] = []
  const a0 = 0.55
  const a1 = Math.PI * 2 - 0.55
  for (let i = 0; i <= 26; i++) {
    const t = a0 + ((a1 - a0) * i) / 26
    const wob = 1 + 0.06 * Math.sin(t * 5)
    pts.push(new THREE.Vector2(Math.cos(t) * r * wob, Math.sin(t) * r * wob))
  }
  for (let i = 26; i >= 0; i--) {
    const t = a0 + ((a1 - a0) * i) / 26
    const wob = 1 + 0.08 * Math.sin(t * 7 + 1)
    pts.push(new THREE.Vector2(Math.cos(t) * r * 0.58 * wob, Math.sin(t) * r * 0.58 * wob))
  }
  return pts
}

export function maxRadius(poly: THREE.Vector2[]) {
  return poly.reduce((m, p) => Math.max(m, p.length()), 0)
}

// ---------------- the sea lane ----------------

export const SPACING = 15
export const X0 = -142

export function laneZ(x: number) {
  return 9 * Math.sin(x * 0.028 + 0.6) + 3.5 * Math.sin(x * 0.071 + 1.7)
}

export function laneSlope(x: number) {
  return 9 * 0.028 * Math.cos(x * 0.028 + 0.6) + 3.5 * 0.071 * Math.cos(x * 0.071 + 1.7)
}

export const lanePoint = (x: number) => new THREE.Vector3(x, 0, laneZ(x))

// Shortest distance from the sea lane to a coastline placed at (cx, cz).
function laneClearance(poly: THREE.Vector2[], cx: number, cz: number) {
  let best = Infinity
  const reach = maxRadius(poly)
  for (let lx = cx - reach - 6; lx <= cx + reach + 6; lx += 0.5) {
    const p = new THREE.Vector2(lx - cx, laneZ(lx) - cz)
    if (pointInPoly(p, poly)) return -1
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]
      const b = poly[(i + 1) % poly.length]
      const ab = b.clone().sub(a)
      const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq()))
      best = Math.min(best, a.clone().add(ab.multiplyScalar(t)).distanceTo(p))
    }
  }
  return best
}

// ---------------- the stops ----------------

interface StopDef {
  key: string
  kind: StopKind
  label: string
  directionId?: number
  radius: number
  height: number
  shape: IslandSpot['shape']
  side: 1 | -1 // 1 = north (up the screen), -1 = south
}

const DEFS: StopDef[] = [
  { key: 'troy', kind: 'troy', label: 'Troy', radius: 8.5, height: 2.2, shape: 'random', side: 1 },
  ...DIRECTIONS.filter((d) => d.pillar === 'proposition').map(
    (d, i): StopDef => ({ key: `d${d.id}`, kind: 'island', label: d.short, directionId: d.id, radius: 4.6 + ((d.id * 37) % 10) / 9, height: 1.8 + ((d.id * 53) % 10) / 8, shape: 'random', side: i % 2 === 0 ? -1 : 1 }),
  ),
  { key: 'narrows', kind: 'narrows', label: 'The Narrows', radius: 0, height: 0, shape: 'random', side: 1 },
  ...DIRECTIONS.filter((d) => d.pillar === 'architecture').map(
    (d, i): StopDef => ({ key: `d${d.id}`, kind: 'island', label: d.short, directionId: d.id, radius: 4.6 + ((d.id * 37) % 10) / 9, height: 1.8 + ((d.id * 53) % 10) / 8, shape: 'random', side: i % 2 === 0 ? -1 : 1 }),
  ),
  { key: 'aeolus', kind: 'aeolus', label: 'Aeolus', radius: 5, height: 2.4, shape: 'round', side: 1 },
  { key: 'lemnos', kind: 'lemnos', label: 'Lemnos', radius: 6.5, height: 2.4, shape: 'random', side: -1 },
  { key: 'olympus', kind: 'olympus', label: 'Olympus', radius: 8, height: 2, shape: 'random', side: 1 },
  { key: 'ithaca', kind: 'ithaca', label: 'Ithaca', radius: 7.5, height: 2.4, shape: 'ithaca', side: -1 },
]

export const STOPS: Stop[] = DEFS.map((d, index) => {
  const x = X0 + index * SPACING
  const dock = lanePoint(x)
  if (d.kind === 'narrows') return { key: d.key, kind: d.kind, label: d.label, index, dock }
  const seed = 7 + index * 131
  const poly = d.shape === 'ithaca' ? ithacaCoast(d.radius) : d.shape === 'crescent' ? crescentCoast(d.radius) : randomCoast(seed, d.radius)
  const reach = maxRadius(poly)
  // place the island beside the lane, far enough that the ship never touches it
  const normal = new THREE.Vector2(-laneSlope(x), 1).normalize()
  let off = reach * 0.55
  let cx = 0
  let cz = 0
  for (let guard = 0; guard < 80; guard++) {
    cx = x + normal.x * off * -d.side
    cz = dock.z - normal.y * off * d.side
    if (laneClearance(poly, cx, cz) >= 3.4) break
    off += 0.4
  }
  const island: IslandSpot = {
    key: d.key,
    x: cx,
    z: cz,
    radius: d.radius,
    height: d.height,
    seed,
    shape: d.shape,
    poly,
  }
  return { key: d.key, kind: d.kind, label: d.label, directionId: d.directionId, index, dock, island }
})

export const stopByKey = (key: string) => STOPS.find((s) => s.key === key)!
export const STOP_COUNT = STOPS.length
export const NARROWS_X = STOPS.find((s) => s.kind === 'narrows')!.dock.x

// Decorative islets that are not stops (easter eggs live on some of them)
export interface Islet {
  key: string
  x: number
  z: number
  poly: THREE.Vector2[]
  height: number
  seed: number
}

function islet(key: string, x: number, z: number, r: number, h: number, seed: number, shape: IslandSpot['shape'] = 'random'): Islet {
  return { key, x, z, poly: shape === 'crescent' ? crescentCoast(r) : randomCoast(seed, r), height: h, seed }
}

export const ISLETS: Islet[] = [
  islet('nobody', stopByKey('d3').island!.x + 9, stopByKey('d3').island!.z + 13, 2.6, 2.6, 901), // Polyphemus' cave
  islet('thrinacia', NARROWS_X + 3, laneZ(NARROWS_X) - 26, 6, 1.2, 902), // cattle of the Sun
  islet('thera', -60, 34, 6.5, 2.2, 903, 'crescent'), // Santorini caldera
  islet('sirens', NARROWS_X - 6, laneZ(NARROWS_X) + 15, 2.4, 0.9, 904),
  islet('far1', 40, -40, 5, 1.6, 905),
  islet('far2', -120, -36, 4, 1.4, 906),
  islet('far3', 110, 36, 4.5, 1.8, 907),
]

// Everything the ocean shader needs to draw shallows and foam.
export function allCoasts(): { x: number; z: number; poly: THREE.Vector2[] }[] {
  return [...STOPS.filter((s) => s.island).map((s) => ({ x: s.island!.x, z: s.island!.z, poly: s.island!.poly })), ...ISLETS]
}

export function pointInPoly(p: THREE.Vector2, poly: THREE.Vector2[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export const MAP_BOUNDS = { minX: -175, maxX: 175, minZ: -60, maxZ: 60 }
