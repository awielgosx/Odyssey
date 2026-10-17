import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { allCoasts, MAP_BOUNDS, pointInPoly } from './layout'
import { PAL } from './palette'

// The sea, built like every other object in the scene: a flat-shaded MeshStandardMaterial lit by
// the same sun, fogged by the same fog. Only the vertex positions move (a few sine waves). No
// custom fragment maths, so no NaN can turn facets black on any GPU, with or without the
// post-processing used in cinematic mode.

const SIZE = { w: 620, h: 360, sx: 160, sz: 92 }

// Distance from each point to the nearest coastline (negative inside an island), on a coarse grid.
function shoreDistance() {
  const res = 2
  const minX = MAP_BOUNDS.minX - 20
  const minZ = MAP_BOUNDS.minZ - 20
  const w = Math.ceil((MAP_BOUNDS.maxX - MAP_BOUNDS.minX + 40) / res)
  const h = Math.ceil((MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ + 40) / res)
  const dist = new Float32Array(w * h).fill(40)
  const p = new THREE.Vector2()
  for (const c of allCoasts()) {
    const reach = c.poly.reduce((m, q) => Math.max(m, q.length()), 0) + 16
    const i0 = Math.max(0, Math.floor((c.x - reach - minX) / res))
    const i1 = Math.min(w - 1, Math.ceil((c.x + reach - minX) / res))
    const j0 = Math.max(0, Math.floor((c.z - reach - minZ) / res))
    const j1 = Math.min(h - 1, Math.ceil((c.z + reach - minZ) / res))
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        p.set(minX + i * res - c.x, minZ + j * res - c.z)
        let best = Infinity
        for (let k = 0; k < c.poly.length; k++) {
          const a = c.poly[k]
          const b = c.poly[(k + 1) % c.poly.length]
          const abx = b.x - a.x
          const aby = b.y - a.y
          const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / (abx * abx + aby * aby || 1)))
          const dx = a.x + abx * t - p.x
          const dy = a.y + aby * t - p.y
          best = Math.min(best, dx * dx + dy * dy)
        }
        let d = Math.sqrt(best)
        if (pointInPoly(p, c.poly)) d = -d
        dist[j * w + i] = Math.min(dist[j * w + i], d)
      }
  }
  return (x: number, z: number) => {
    const fi = (x - minX) / res
    const fj = (z - minZ) / res
    const i = Math.floor(fi)
    const j = Math.floor(fj)
    if (i < 0 || j < 0 || i >= w - 1 || j >= h - 1) return 40
    const tx = fi - i
    const tz = fj - j
    const d00 = dist[j * w + i]
    const d10 = dist[j * w + i + 1]
    const d01 = dist[(j + 1) * w + i]
    const d11 = dist[(j + 1) * w + i + 1]
    return (d00 * (1 - tx) + d10 * tx) * (1 - tz) + (d01 * (1 - tx) + d11 * tx) * tz
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function useSea() {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE.w, SIZE.h, SIZE.sx, SIZE.sz)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    const d = shoreDistance()
    const colors = new Float32Array(pos.count * 3)
    const calm = new Float32Array(pos.count)
    const deep = new THREE.Color(PAL.aegeanDeep)
    const mid = new THREE.Color(PAL.aegeanMid)
    const shallow = new THREE.Color(PAL.aegeanShallow)
    const foam = new THREE.Color(PAL.foam)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const dist = d(x, z)
      // gentle mottling between deep and mid blue, then turquoise shallows and a pale rim at the shore
      const n = 0.5 + 0.5 * Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2.0) * Math.cos(z * 0.09 - x * 0.03)
      c.copy(deep).lerp(mid, 0.35 + n * 0.45)
      c.lerp(shallow, (1 - smooth(0, 11, dist)) * 0.85)
      c.lerp(foam, (1 - smooth(-1, 2.2, dist)) * 0.7)
      colors.set([c.r, c.g, c.b], i * 3)
      calm[i] = 1 - smooth(0, 6, dist) // 1 at the coast, 0 out at sea
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aCalm', new THREE.BufferAttribute(calm, 1))
    return g
  }, [])
}

// A pale ring of surf hugging each coastline, breathing slowly.
function useSurf() {
  return useMemo(() => {
    const verts: number[] = []
    const idx: number[] = []
    for (const coast of allCoasts()) {
      const poly = coast.poly
      const n = poly.length
      let area = 0
      for (let k = 0; k < n; k++) area += poly[k].x * poly[(k + 1) % n].y - poly[(k + 1) % n].x * poly[k].y
      const s = area > 0 ? 1 : -1
      const base = verts.length / 3
      for (let k = 0; k < n; k++) {
        const prev = poly[(k - 1 + n) % n]
        const cur = poly[k]
        const next = poly[(k + 1) % n]
        // outward normal: average of the two edge normals
        const e1 = new THREE.Vector2(cur.x - prev.x, cur.y - prev.y).normalize()
        const e2 = new THREE.Vector2(next.x - cur.x, next.y - cur.y).normalize()
        const nx = (e1.y + e2.y) * s
        const ny = -(e1.x + e2.x) * s
        const len = Math.hypot(nx, ny) || 1
        const ox = nx / len
        const oy = ny / len
        verts.push(coast.x + cur.x + ox * 0.1, 0, coast.z + cur.y + oy * 0.1)
        verts.push(coast.x + cur.x + ox * 1.5, 0, coast.z + cur.y + oy * 1.5)
      }
      for (let k = 0; k < n; k++) {
        const a = base + k * 2
        const b = base + ((k + 1) % n) * 2
        idx.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    g.setIndex(idx)
    return g
  }, [])
}

const time = { value: 0 }

export function Ocean() {
  const sea = useSea()
  const surf = useSurf()
  const seaMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.58, metalness: 0 })
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = time
      sh.vertexShader = sh.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
uniform float uTime;
attribute float aCalm;
float wave(vec2 p, vec2 dir, float freq, float speed, float amp) { return sin(dot(p, dir) * freq + uTime * speed) * amp; }`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
vec2 wp = position.xz;
float hgt = wave(wp, vec2(0.958, 0.287), 0.32, 1.1, 0.24)
          + wave(wp, vec2(-0.371, 0.928), 0.55, 1.6, 0.13)
          + wave(wp, vec2(0.753, -0.659), 0.9, 2.3, 0.06);
transformed.y += hgt * (1.0 - 0.75 * aCalm);`,
        )
    }
    return m
  }, [])
  const surfMat = useMemo(() => new THREE.MeshBasicMaterial({ color: PAL.foam, transparent: true, opacity: 0.6, depthWrite: false }), [])
  useFrame((_, dt) => {
    time.value += dt
    surfMat.opacity = 0.42 + Math.sin(time.value * 1.3) * 0.18
  })
  return (
    <>
      <mesh geometry={sea} material={seaMat} receiveShadow />
      <mesh geometry={surf} material={surfMat} position-y={0.32} renderOrder={1} />
    </>
  )
}
