import * as THREE from 'three'
import { pointInPoly, rng } from './layout'

// Builds a low-poly island from a coastline polygon (local x/z, stored as Vector2 x/y).

function signedArea(poly: THREE.Vector2[]) {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

function scalePoly(poly: THREE.Vector2[], k: number, jitter = 0, seed = 1) {
  const rand = rng(seed)
  return poly.map((p) => p.clone().multiplyScalar(k * (1 + (rand() - 0.5) * jitter)))
}

// Flat cap at height y (ShapeGeometry is in XY; we map shape y -> -z after rotation).
function cap(poly: THREE.Vector2[], y: number) {
  const shape = new THREE.Shape(poly.map((p) => new THREE.Vector2(p.x, -p.y)))
  const g = new THREE.ShapeGeometry(shape)
  g.rotateX(-Math.PI / 2)
  g.translate(0, y, 0)
  return g
}

// Wall between a bottom ring and a top ring, UVs running along the perimeter.
function wall(bottom: THREE.Vector2[], top: THREE.Vector2[], y0: number, y1: number, uScale: number) {
  const ccw = signedArea(bottom) > 0
  const pos: number[] = []
  const uv: number[] = []
  let u = 0
  const n = bottom.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const b0 = bottom[i]
    const b1 = bottom[j]
    const t0 = top[i]
    const t1 = top[j]
    const len = b0.distanceTo(b1)
    const u0 = u / uScale
    const u1 = (u + len) / uScale
    u += len
    const A = [b0.x, y0, b0.y]
    const B = [b1.x, y0, b1.y]
    const C = [t1.x, y1, t1.y]
    const D = [t0.x, y1, t0.y]
    // outward-facing winding depends on polygon orientation
    const quad = ccw ? [A, D, C, A, C, B] : [A, B, C, A, C, D]
    const quv = ccw
      ? [[u0, 0], [u0, 1], [u1, 1], [u0, 0], [u1, 1], [u1, 0]]
      : [[u0, 0], [u1, 0], [u1, 1], [u0, 0], [u1, 1], [u0, 1]]
    quad.forEach((v) => pos.push(...v))
    quv.forEach((v) => uv.push(...v))
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

export interface IslandGeometry {
  beachTop: THREE.BufferGeometry
  beachWall: THREE.BufferGeometry
  cliff: THREE.BufferGeometry
  top: THREE.BufferGeometry
  terraceWall?: THREE.BufferGeometry
  terraceTop?: THREE.BufferGeometry
  terraceHeight: number
  landmarkSpot: THREE.Vector3
  scatter: { p: THREE.Vector3; s: number; kind: 'cypress' | 'olive' | 'rock' | 'hill' }[]
  shoreRocks: { p: THREE.Vector3; s: number }[]
}

export function buildIsland(poly: THREE.Vector2[], height: number, seed: number, opts: { terrace?: boolean; scatter?: number } = {}): IslandGeometry {
  const rand = rng(seed)
  const beach = scalePoly(poly, 1.12, 0.05, seed + 1)
  const cliffBottom = scalePoly(poly, 1.0, 0.03, seed + 2)
  const cliffTop = scalePoly(poly, 0.93, 0.05, seed + 3)

  const beachTop = cap(beach, 0.25)
  const beachWall = wall(scalePoly(beach, 1.04), beach, -0.6, 0.25, 6)
  const cliff = wall(cliffBottom, cliffTop, 0.2, height, 7)
  const top = cap(cliffTop, height)

  // landmark goes near the centroid, nudged inside the polygon
  const c = new THREE.Vector2()
  cliffTop.forEach((p) => c.add(p))
  c.divideScalar(cliffTop.length)
  if (!pointInPoly(c, cliffTop)) c.set(cliffTop[0].x * 0.5, cliffTop[0].y * 0.5)

  let terraceWall: THREE.BufferGeometry | undefined
  let terraceTop: THREE.BufferGeometry | undefined
  let terraceHeight = height
  if (opts.terrace) {
    const inner = cliffTop.map((p) => p.clone().sub(c).multiplyScalar(0.48).add(c))
    const innerTop = inner.map((p) => p.clone().sub(c).multiplyScalar(0.94).add(c))
    terraceHeight = height + 0.9
    terraceWall = wall(inner, innerTop, height, terraceHeight, 5)
    terraceTop = cap(innerTop, terraceHeight)
  }

  const scatter: IslandGeometry['scatter'] = []
  const inside = cliffTop.map((p) => p.clone().sub(c).multiplyScalar(0.86).add(c))
  const count = opts.scatter ?? 10
  let tries = 0
  const reach = Math.max(...cliffTop.map((p) => p.distanceTo(c)))
  while (scatter.length < count && tries++ < 400) {
    const a = rand() * Math.PI * 2
    const d = reach * (0.3 + rand() * 0.7)
    const p = new THREE.Vector2(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d)
    if (!pointInPoly(p, inside)) continue
    if (p.distanceTo(c) < 2.6) continue // keep the landmark clear
    const r = rand()
    const kind = r < 0.38 ? 'cypress' : r < 0.66 ? 'olive' : r < 0.86 ? 'rock' : 'hill'
    scatter.push({ p: new THREE.Vector3(p.x, height, p.y), s: 0.7 + rand() * 0.7, kind })
  }

  const shoreRocks: IslandGeometry['shoreRocks'] = []
  for (let i = 0; i < 7; i++) {
    const q = beach[Math.floor(rand() * beach.length)]
    shoreRocks.push({ p: new THREE.Vector3(q.x * (1.03 + rand() * 0.1), 0.05, q.y * (1.03 + rand() * 0.1)), s: 0.35 + rand() * 0.6 })
  }

  return {
    beachTop,
    beachWall,
    cliff,
    top,
    terraceWall,
    terraceTop,
    terraceHeight,
    landmarkSpot: new THREE.Vector3(c.x, opts.terrace ? terraceHeight : height, c.y),
    scatter,
    shoreRocks,
  }
}
