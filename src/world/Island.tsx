import { Html } from '@react-three/drei'
import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { directionById } from '../content/directions'
import { voyageById } from '../content/voyages'
import { stopComplete, useGame } from '../store'
import { buildIsland } from './coast'
import { LateFeeStall, TiresiasOar } from './Eggs'
import { Cypress, LandmarkModel, M, OliveTree } from './Landmarks'
import { STOPS, type IslandSpot, type Stop } from './layout'
import { PAL } from './palette'
import { cliffTexture } from './textures'

const sandMat = new THREE.MeshStandardMaterial({ color: PAL.sand, roughness: 1, flatShading: true })
const sandWallMat = new THREE.MeshStandardMaterial({ color: '#c9a56b', roughness: 1, flatShading: true })
const grassMat = new THREE.MeshStandardMaterial({ color: PAL.olive, roughness: 1, flatShading: true })
const grassHighMat = new THREE.MeshStandardMaterial({ color: '#7d8c40', roughness: 1, flatShading: true })
const hillMat = new THREE.MeshStandardMaterial({ color: PAL.oliveDark, roughness: 1, flatShading: true })

function cliffMaterial(seed: number) {
  const t = cliffTexture().clone()
  t.wrapS = THREE.RepeatWrapping
  t.offset.x = (seed % 97) / 97
  t.needsUpdate = true
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, flatShading: true })
}

const rockCliffMat = new THREE.MeshStandardMaterial({ color: '#a98a6c', roughness: 1, flatShading: true })

// A coastline turned into a low-poly island: beach, painted cliff, grassy top, trees.
export function Terrain({
  poly,
  height,
  seed,
  terrace,
  scatter,
  children,
  plain,
}: {
  poly: THREE.Vector2[]
  height: number
  seed: number
  terrace?: boolean
  scatter?: number
  children?: (spot: THREE.Vector3) => ReactNode
  plain?: boolean
}) {
  const g = useMemo(() => buildIsland(poly, height, seed, { terrace, scatter }), [poly, height, seed, terrace, scatter])
  const cliffMat = useMemo(() => (plain ? rockCliffMat : cliffMaterial(seed)), [seed, plain])
  return (
    <group>
      <mesh geometry={g.beachWall} material={sandWallMat} receiveShadow />
      <mesh geometry={g.beachTop} material={sandMat} receiveShadow />
      <mesh geometry={g.cliff} material={cliffMat} castShadow receiveShadow />
      <mesh geometry={g.top} material={grassMat} receiveShadow castShadow />
      {g.terraceWall && <mesh geometry={g.terraceWall} material={rockCliffMat} castShadow receiveShadow />}
      {g.terraceTop && <mesh geometry={g.terraceTop} material={grassHighMat} receiveShadow castShadow />}
      {g.scatter.map((d, i) =>
        d.kind === 'cypress' ? (
          <Cypress key={i} p={[d.p.x, d.p.y, d.p.z]} s={d.s} />
        ) : d.kind === 'olive' ? (
          <OliveTree key={i} p={[d.p.x, d.p.y, d.p.z]} s={d.s} />
        ) : d.kind === 'hill' ? (
          <mesh key={i} position={d.p} scale={[d.s * 1.6, d.s * 0.7, d.s * 1.3]} material={hillMat} castShadow receiveShadow>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        ) : (
          <mesh key={i} position={d.p} scale={d.s} rotation={[d.s, d.s * 3, 0]} material={M.rock} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.45, 0]} />
          </mesh>
        ),
      )}
      {g.shoreRocks.map((r, i) => (
        <mesh key={`r${i}`} position={r.p} scale={r.s} rotation={[r.s * 2, r.s * 5, 0]} material={M.rock} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.6, 0]} />
        </mesh>
      ))}
      {children?.(g.landmarkSpot)}
    </group>
  )
}

function Mist({ r }: { r: number }) {
  const puffs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + i
        const d = (0.25 + ((i * 37) % 10) / 14) * r
        return { p: [Math.cos(a) * d, 3.2 + (i % 3) * 0.7, Math.sin(a) * d] as [number, number, number], s: 1.4 + (i % 4) * 0.45 }
      }),
    [r],
  )
  return (
    <group>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.p} scale={p.s}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#fffaf2" emissive="#ffe6cc" emissiveIntensity={0.5} transparent opacity={0.92} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

export type StopState = 'locked' | 'next' | 'current' | 'passed'

export function useStopState(index: number): StopState {
  const stopIndex = useGame((s) => s.stopIndex)
  const furthest = useGame((s) => s.furthest)
  if (index === stopIndex) return 'current'
  if (index <= furthest) return 'passed'
  if (index === furthest + 1) return 'next'
  return 'locked'
}

export function useStopClick(stop: Stop) {
  const sailTo = useGame((s) => s.sailTo)
  const say = useGame((s) => s.say)
  return () => {
    const s = useGame.getState()
    if (s.phase !== 'play') return
    if (stop.index === s.stopIndex) return
    if (stop.index > s.furthest + 1) {
      const nxt = STOPS[s.furthest + 1]
      say(`The sea lane reaches ${stop.label} later. Next stop: ${nxt.label}.`)
      return
    }
    if (stop.index === s.furthest + 1 && !stopComplete(s, s.furthest)) {
      say(`Finish the task at ${STOPS[s.furthest].label} before sailing on.`)
      return
    }
    sailTo(stop.index)
  }
}

// The flag above each stop: number, pillar badge and short name, so the map explains itself.
export function StopTag({ stop, height }: { stop: Stop; height: number }) {
  const state = useStopState(stop.index)
  const sailing = useGame((s) => s.sailing)
  const voyageId = useGame((s) => s.voyageId)
  const landed = useGame((s) => (stop.directionId ? (s.landings[stop.directionId]?.grades.length ?? 0) > 0 : false))
  const phase = useGame((s) => s.phase)
  if (phase !== 'play' || (state === 'current' && !sailing)) return null
  const dir = stop.directionId ? directionById(stop.directionId) : null
  const recommended = dir ? voyageById(voyageId).recommended.includes(dir.id) : false
  return (
    <Html position={[0, height + 3.4, 0]} center distanceFactor={44} zIndexRange={[10, 0]}>
      <div className={`flag ${state} ${dir ? dir.pillar : 'special'}`}>
        {dir ? (
          <>
            <span className="flag-num">{dir.id}</span>
            <span className="flag-pillar" aria-label={dir.pillar === 'proposition' ? 'Value proposition' : 'Value architecture'}>
              {dir.pillar === 'proposition' ? 'P' : 'A'}
            </span>
            <span className="flag-name">{dir.short}</span>
            {landed && <span className="flag-mark" title="You landed here">{'❦'}</span>}
            {recommended && !landed && state !== 'locked' && <span className="flag-mark owl" title="Athena recommends landing here">{'★'}</span>}
          </>
        ) : (
          <span className="flag-name">{stop.label}</span>
        )}
      </div>
    </Html>
  )
}

export function DirectionIsland({ stop }: { stop: Stop }) {
  const spot = stop.island as IslandSpot
  const dir = directionById(stop.directionId!)
  const state = useStopState(stop.index)
  const onClick = useStopClick(stop)
  return (
    <group
      position={[spot.x, 0, spot.z]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <Terrain poly={spot.poly} height={spot.height} seed={spot.seed} terrace={spot.radius > 5.2} scatter={9}>
        {(p) => (
          <group position={p}>
            <group scale={1.4}>
              <LandmarkModel type={dir.landmark} />
            </group>
            {dir.id === 5 && <TiresiasOar position={[2.2, 0, 1.2]} />}
            {dir.id === 7 && <LateFeeStall position={[-2.3, 0, 1.0]} />}
          </group>
        )}
      </Terrain>
      {state === 'locked' && <Mist r={spot.radius} />}
      <StopTag stop={stop} height={spot.height} />
    </group>
  )
}
