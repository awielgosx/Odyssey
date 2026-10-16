import { Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { directionById } from '../content/directions'
import { useGame } from '../store'
import { Cypress, LandmarkModel, M, OliveTree, Temple } from './Landmarks'
import { rng, type IslandSpot } from './layout'
import { PAL } from './palette'
import { cliffTexture } from './textures'

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return s - Math.floor(s)
}

// Push vertices outward/up by a position-keyed noise so seams stay closed.
function jitter(geo: THREE.BufferGeometry, amount: number, seed: number, keepBottom = true) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  geo.computeBoundingBox()
  const minY = geo.boundingBox!.min.y
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    if (keepBottom && Math.abs(v.y - minY) < 1e-3) continue
    const n = hash3(v.x + seed, v.y, v.z) - 0.5
    const r = Math.hypot(v.x, v.z)
    if (r > 1e-3) {
      const k = 1 + n * amount
      v.x *= k
      v.z *= k
    }
    v.y += (hash3(v.z, v.x + seed, v.y) - 0.5) * amount * 0.6
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function Terrain({ spot }: { spot: IslandSpot }) {
  const { radius: r, height: h, seed } = spot
  const geos = useMemo(() => {
    const beach = jitter(new THREE.CylinderGeometry(r * 1.12, r * 1.28, 0.7, 11, 1), 0.12, seed)
    const cliff = jitter(new THREE.CylinderGeometry(r * 0.9, r * 1.02, h, 14, 2), 0.08, seed + 1)
    const top = jitter(new THREE.CylinderGeometry(r * 0.86, r * 0.9, 0.22, 14, 1), 0.06, seed + 2)
    return { beach, cliff, top }
  }, [r, h, seed])
  const cliffMat = useMemo(() => {
    const t = cliffTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(Math.round(r * 1.1), 1)
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, flatShading: true })
  }, [r])
  const sand = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.sand, roughness: 1, flatShading: true }), [])
  const grass = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.olive, roughness: 1, flatShading: true }), [])

  const decor = useMemo(() => {
    const rand = rng(seed)
    const items: { kind: 'cypress' | 'olive' | 'rock'; p: [number, number, number]; s: number }[] = []
    const n = 5 + Math.floor(rand() * 4)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const d = r * (0.55 + rand() * 0.25)
      const kind = rand() < 0.45 ? 'cypress' : rand() < 0.7 ? 'olive' : 'rock'
      items.push({ kind, p: [Math.cos(a) * d, h + 0.1, Math.sin(a) * d], s: 0.7 + rand() * 0.6 })
    }
    for (let i = 0; i < 6; i++) {
      const a = rand() * Math.PI * 2
      const d = r * (1.15 + rand() * 0.25)
      items.push({ kind: 'rock', p: [Math.cos(a) * d, 0.1, Math.sin(a) * d], s: 0.4 + rand() * 0.6 })
    }
    return items
  }, [seed, r, h])

  return (
    <group>
      <mesh geometry={geos.beach} position-y={-0.15} material={sand} receiveShadow castShadow />
      <mesh geometry={geos.cliff} position-y={h / 2} material={cliffMat} castShadow receiveShadow />
      <mesh geometry={geos.top} position-y={h + 0.02} material={grass} receiveShadow castShadow />
      {decor.map((d, i) =>
        d.kind === 'cypress' ? (
          <Cypress key={i} p={d.p} s={d.s} />
        ) : d.kind === 'olive' ? (
          <OliveTree key={i} p={d.p} s={d.s} />
        ) : (
          <mesh key={i} position={d.p} scale={d.s} rotation={[d.s, d.s * 3, 0]} material={M.rock} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.45, 0]} />
          </mesh>
        ),
      )}
    </group>
  )
}

function Mist({ r }: { r: number }) {
  // Unexplored islands sit under a soft cloud cap.
  const puffs = useMemo(() => {
    const rand = rng(Math.round(r * 1000))
    return Array.from({ length: 9 }, () => {
      const a = rand() * Math.PI * 2
      const d = rand() * r * 0.9
      return { p: [Math.cos(a) * d, 3.4 + rand() * 1.4, Math.sin(a) * d] as [number, number, number], s: 1.1 + rand() * 1.1 }
    })
  }, [r])
  return (
    <group>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.p} scale={p.s}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#fffaf2" emissive="#ffe6cc" emissiveIntensity={0.55} transparent opacity={0.9} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

export function Island({ spot }: { spot: IslandSpot }) {
  const dir = spot.directionId ? directionById(spot.directionId) : undefined
  const visited = useGame((s) => s.visited.includes(spot.key))
  const target = useGame((s) => s.target === spot.key)
  const docked = useGame((s) => s.target === spot.key && !s.sailing)
  const sailTo = useGame((s) => s.sailTo)
  const [hover, setHover] = useState(false)
  const showMist = !!dir && !visited && !target

  return (
    <group
      position={[spot.x, 0, spot.z]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        sailTo(spot.key)
      }}
    >
      <Terrain spot={spot} />
      <group position-y={spot.height + 0.12}>
        {dir && (
          <group scale={1.35}>
            <LandmarkModel type={dir.landmark} />
          </group>
        )}
        {spot.key === 'ithaca' && <Ithaca />}
      </group>
      {showMist && <Mist r={spot.radius} />}
      {dir && !docked && (
        <Html position={[0, spot.height + 3.6, 0]} center distanceFactor={30} zIndexRange={[10, 0]}>
          <div className={`isle-tag ${dir.pillar} ${hover || target ? 'lit' : ''} ${visited ? 'seen' : ''}`}>
            <span className="isle-num">{dir.id}</span>
            <span className="isle-name">{dir.short}</span>
          </div>
        </Html>
      )}
      {spot.key === 'ithaca' && (
        <Html position={[0, spot.height + 4.4, 0]} center distanceFactor={30} zIndexRange={[10, 0]}>
          <div className="isle-tag home">
            <span className="isle-name">Ithaca · your business today</span>
          </div>
        </Html>
      )}
    </group>
  )
}

function Ithaca() {
  const houses = useMemo(() => {
    const rand = rng(77)
    return Array.from({ length: 9 }, () => {
      const a = rand() * Math.PI * 2
      const d = 2.2 + rand() * 2.4
      return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as [number, number, number], s: 0.5 + rand() * 0.4, rot: rand() * Math.PI }
    })
  }, [])
  return (
    <group>
      <Temple cols={6} w={3} d={2} h={1.6} />
      {houses.map((h, i) => (
        <group key={i} position={h.p} rotation-y={h.rot} scale={h.s}>
          <mesh position={[0, 0.45, 0]} material={M.marble} castShadow receiveShadow>
            <boxGeometry args={[1, 0.9, 0.8]} />
          </mesh>
          <mesh position={[0, 1.05, 0]} rotation-y={Math.PI / 4} material={M.clay} castShadow>
            <coneGeometry args={[0.75, 0.35, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Olympus({ spot }: { spot: IslandSpot }) {
  const sailTo = useGame((s) => s.sailTo)
  const geo = useMemo(() => jitter(new THREE.CylinderGeometry(1.9, spot.radius, spot.height, 10, 4), 0.16, spot.seed), [spot])
  const snow = useMemo(() => jitter(new THREE.CylinderGeometry(2.05, spot.radius * 0.45, spot.height * 0.3, 10, 1), 0.08, spot.seed + 3), [spot])
  return (
    <group
      position={[spot.x, 0, spot.z]}
      onClick={(e) => {
        e.stopPropagation()
        sailTo(spot.key)
      }}
    >
      <mesh position-y={-0.2}>
        <cylinderGeometry args={[spot.radius * 1.2, spot.radius * 1.3, 0.6, 11]} />
        <meshStandardMaterial color={PAL.sand} flatShading roughness={1} />
      </mesh>
      <mesh geometry={geo} position-y={spot.height / 2} castShadow receiveShadow>
        <meshStandardMaterial color="#9c7f66" flatShading roughness={1} />
      </mesh>
      <mesh geometry={snow} position-y={spot.height * 0.86} castShadow>
        <meshStandardMaterial color={PAL.marble} flatShading roughness={0.9} />
      </mesh>
      <group position-y={spot.height + 0.05} scale={0.9}>
        <Temple cols={6} w={2.6} d={1.8} roof={M.gold} />
      </group>
      <Html position={[0, spot.height + 4.5, 0]} center distanceFactor={30} zIndexRange={[10, 0]}>
        <div className="isle-tag olympus">
          <span className="isle-name">Olympus · the council</span>
        </div>
      </Html>
    </group>
  )
}
