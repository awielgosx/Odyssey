import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Landmark } from '../content/directions'
import { PAL } from './palette'
import { potteryTexture } from './textures'

// Shared low-poly materials
export const M = {
  marble: new THREE.MeshStandardMaterial({ color: PAL.marble, roughness: 0.7, flatShading: true }),
  marbleShade: new THREE.MeshStandardMaterial({ color: PAL.marbleShade, roughness: 0.8, flatShading: true }),
  clay: new THREE.MeshStandardMaterial({ color: PAL.clay, roughness: 0.8, flatShading: true }),
  glaze: new THREE.MeshStandardMaterial({ color: PAL.glaze, roughness: 0.45, flatShading: true }),
  gold: new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.3, metalness: 0.7, flatShading: true }),
  olive: new THREE.MeshStandardMaterial({ color: PAL.olive, roughness: 0.9, flatShading: true }),
  pine: new THREE.MeshStandardMaterial({ color: PAL.pine, roughness: 0.9, flatShading: true }),
  wood: new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 0.9, flatShading: true }),
  rock: new THREE.MeshStandardMaterial({ color: PAL.rock, roughness: 1, flatShading: true }),
  ember: new THREE.MeshStandardMaterial({ color: '#ff7a2a', emissive: '#ff6a1a', emissiveIntensity: 3, flatShading: true }),
  flame: new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 4, flatShading: true }),
  water: new THREE.MeshStandardMaterial({ color: PAL.aegeanShallow, roughness: 0.2, flatShading: true }),
}

const Box = ({ s, p, m = M.marble, r }: { s: [number, number, number]; p: [number, number, number]; m?: THREE.Material; r?: [number, number, number] }) => (
  <mesh position={p} rotation={r} material={m} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
)

const Col = ({ p, h = 1.4, rad = 0.12, m = M.marble }: { p: [number, number, number]; h?: number; rad?: number; m?: THREE.Material }) => (
  <mesh position={[p[0], p[1] + h / 2, p[2]]} material={m} castShadow receiveShadow>
    <cylinderGeometry args={[rad * 0.85, rad, h, 8]} />
  </mesh>
)

function Pediment({ w, d, h, y, m = M.clay }: { w: number; d: number; h: number; y: number; m?: THREE.Material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0)
    s.lineTo(w / 2, 0)
    s.lineTo(0, h)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false })
    g.translate(0, 0, -d / 2)
    return g
  }, [w, d, h])
  return <mesh geometry={geo} position={[0, y, 0]} rotation-y={Math.PI / 2} material={m} castShadow />
}

export function Temple({ cols = 6, w = 2.6, d = 1.7, h = 1.4, roof = M.clay }: { cols?: number; w?: number; d?: number; h?: number; roof?: THREE.Material }) {
  const pos: [number, number, number][] = []
  for (let i = 0; i < cols; i++) {
    const x = -w / 2 + 0.2 + (i * (w - 0.4)) / (cols - 1)
    pos.push([x, 0.3, d / 2 - 0.2], [x, 0.3, -d / 2 + 0.2])
  }
  return (
    <group>
      <Box s={[w + 0.5, 0.15, d + 0.5]} p={[0, 0.075, 0]} m={M.marbleShade} />
      <Box s={[w + 0.25, 0.15, d + 0.25]} p={[0, 0.225, 0]} />
      {pos.map((p, i) => (
        <Col key={i} p={p} h={h} />
      ))}
      <Box s={[w - 0.6, h * 0.8, d - 0.7]} p={[0, 0.3 + h * 0.4, 0]} m={M.marbleShade} />
      <Box s={[w + 0.15, 0.18, d + 0.15]} p={[0, 0.3 + h + 0.09, 0]} />
      <Box s={[w + 0.16, 0.09, d + 0.16]} p={[0, 0.3 + h + 0.2, 0]} m={M.glaze} />
      <group rotation-y={-Math.PI / 2}>
        <Pediment w={d + 0.2} d={w + 0.2} h={0.45} y={0.3 + h + 0.25} m={roof} />
      </group>
    </group>
  )
}

function Amphora({ scale = 1 }: { scale?: number }) {
  const geo = useMemo(() => {
    const pts = [
      [0, 0], [0.18, 0.02], [0.32, 0.25], [0.42, 0.6], [0.4, 0.9], [0.24, 1.15], [0.14, 1.25], [0.14, 1.45], [0.2, 1.5], [0, 1.5],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 12)
  }, [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: potteryTexture(), roughness: 0.5, flatShading: true }), [])
  return (
    <group scale={scale}>
      <mesh geometry={geo} material={mat} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.27, 1.2, 0]} rotation-z={s * 0.3} material={M.glaze} castShadow>
          <torusGeometry args={[0.14, 0.035, 5, 8, Math.PI]} />
        </mesh>
      ))}
    </group>
  )
}

function OliveTree({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.3, 0]} material={M.wood} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 5]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} material={M.olive} castShadow>
        <icosahedronGeometry args={[0.38, 0]} />
      </mesh>
      <mesh position={[0.2, 0.62, 0.1]} material={M.olive} castShadow>
        <icosahedronGeometry args={[0.24, 0]} />
      </mesh>
    </group>
  )
}

export function Cypress({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.15, 0]} material={M.wood} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 5]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} material={M.pine} castShadow>
        <coneGeometry args={[0.22, 1.4, 6]} />
      </mesh>
    </group>
  )
}

function Lighthouse() {
  const flame = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (flame.current) flame.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 7) * 0.12)
  })
  return (
    <group>
      <mesh position={[0, 0.9, 0]} material={M.marble} castShadow>
        <cylinderGeometry args={[0.38, 0.55, 1.8, 8]} />
      </mesh>
      <mesh position={[0, 1.2, 0]} material={M.clay} castShadow>
        <cylinderGeometry args={[0.47, 0.49, 0.22, 8]} />
      </mesh>
      <mesh position={[0, 2.15, 0]} material={M.marble} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 0.7, 8]} />
      </mesh>
      <mesh position={[0, 2.55, 0]} material={M.glaze}>
        <cylinderGeometry args={[0.36, 0.3, 0.12, 8]} />
      </mesh>
      <mesh ref={flame} position={[0, 2.85, 0]} material={M.flame}>
        <octahedronGeometry args={[0.2, 0]} />
      </mesh>
    </group>
  )
}

function Theatre() {
  const rows = [0, 1, 2, 3]
  return (
    <group>
      {rows.map((r) => (
        <mesh key={r} position={[0, 0.12 + r * 0.22, 0]} rotation-y={Math.PI} material={r % 2 ? M.marbleShade : M.marble} castShadow receiveShadow>
          <cylinderGeometry args={[0.9 + r * 0.35, 0.9 + r * 0.35, 0.24, 14, 1, false, -Math.PI / 2, Math.PI]} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, 0.2]} material={M.clay} receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.06, 14]} />
      </mesh>
      <group position={[0, 0.06, 0.2]}>
        {/* masks of comedy and tragedy, simplified */}
        <mesh position={[-0.2, 0.3, 0]} material={M.gold} castShadow>
          <sphereGeometry args={[0.16, 6, 5]} />
        </mesh>
        <mesh position={[0.2, 0.3, 0]} material={M.glaze} castShadow>
          <sphereGeometry args={[0.16, 6, 5]} />
        </mesh>
      </group>
    </group>
  )
}

function Agora() {
  const stalls: [number, number, string][] = [
    [-0.8, 0.3, PAL.clay],
    [0.1, -0.5, PAL.aegeanMid],
    [0.8, 0.4, PAL.ochre],
  ]
  return (
    <group>
      {stalls.map(([x, z, c], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box s={[0.7, 0.4, 0.5]} p={[0, 0.2, 0]} m={M.marble} />
          <mesh position={[0, 0.62, 0]} castShadow>
            <coneGeometry args={[0.55, 0.45, 4]} />
            <meshStandardMaterial color={c} flatShading roughness={0.8} />
          </mesh>
        </group>
      ))}
      <Amphora scale={0.4} />
    </group>
  )
}

function Bridge() {
  return (
    <group>
      <mesh position={[0, 0, 0]} material={M.marble} castShadow>
        <torusGeometry args={[1.0, 0.18, 5, 10, Math.PI]} />
      </mesh>
      <Box s={[0.5, 0.5, 0.5]} p={[-1.05, 0.25, 0]} m={M.marbleShade} />
      <Box s={[0.5, 0.5, 0.5]} p={[1.05, 0.25, 0]} m={M.marbleShade} />
      <mesh position={[0, 1.25, 0]} material={M.gold} castShadow>
        <octahedronGeometry args={[0.16, 0]} />
      </mesh>
    </group>
  )
}

function Treasury() {
  return (
    <group>
      <group scale={0.7}>
        <Temple cols={4} w={2} d={1.6} roof={M.gold} />
      </group>
      {[[-1.1, 0.5], [1.1, 0.5], [1.0, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]} material={M.gold} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Forge() {
  const glow = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 5 + Math.sin(clock.elapsedTime * 9) * 1.5 + Math.sin(clock.elapsedTime * 23) * 0.8
  })
  return (
    <group>
      <Box s={[1.6, 0.9, 1.2]} p={[0, 0.45, 0]} m={M.rock} />
      <mesh position={[0, 1.1, 0]} rotation-y={Math.PI / 4} material={M.clay} castShadow>
        <coneGeometry args={[1.15, 0.5, 4]} />
      </mesh>
      <Box s={[0.3, 1.0, 0.3]} p={[0.5, 1.4, -0.25]} m={M.rock} />
      <Box s={[0.7, 0.45, 0.05]} p={[0, 0.3, 0.61]} m={M.ember} />
      <Box s={[0.4, 0.25, 0.25]} p={[-0.9, 0.12, 0.8]} m={M.glaze} />
    </group>
  )
}

function Mill() {
  const wheel = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (wheel.current) wheel.current.rotation.z += dt * 0.8
  })
  return (
    <group>
      <Box s={[1.2, 1.1, 1.0]} p={[0, 0.55, 0]} m={M.marble} />
      <mesh position={[0, 1.3, 0]} rotation-y={Math.PI / 4} material={M.clay} castShadow>
        <coneGeometry args={[0.95, 0.5, 4]} />
      </mesh>
      <group ref={wheel} position={[0, 0.8, 0.62]}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} s={[1.6, 0.14, 0.05]} p={[0, 0, 0]} r={[0, 0, (i * Math.PI) / 4]} m={M.wood} />
        ))}
      </group>
    </group>
  )
}

function Stairs() {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} s={[1.8 - i * 0.3, 0.25, 1.8 - i * 0.3]} p={[0, 0.125 + i * 0.25, 0]} m={i === 2 ? M.clay : M.marble} />
      ))}
      <Box s={[0.6, 0.1, 0.6]} p={[1.3, 0.05, 0.6]} m={M.marbleShade} r={[0.3, 0.4, 0.1]} />
    </group>
  )
}

function Grove() {
  return (
    <group>
      <OliveTree p={[-0.7, 0, 0.4]} s={1.3} />
      <OliveTree p={[0.6, 0, -0.5]} s={1.1} />
      <OliveTree p={[0.7, 0, 0.7]} s={0.9} />
      <mesh position={[0, 0.2, 0]} material={M.marble} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.4, 8]} />
      </mesh>
      <mesh position={[0, 0.41, 0]} material={M.water}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 8]} />
      </mesh>
    </group>
  )
}

function Circle() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <Col key={i} p={[Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1]} h={1.2} m={i % 2 ? M.marble : M.marbleShade} />
      })}
      <mesh position={[0, 1.25, 0]} material={M.marble} castShadow>
        <torusGeometry args={[1.1, 0.1, 4, 16]} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={M.clay} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.5, 8]} />
      </mesh>
    </group>
  )
}

function Twins() {
  return (
    <group>
      <group position={[-0.8, 0, 0]} scale={0.55}>
        <Temple cols={4} w={1.6} d={1.4} />
      </group>
      <group position={[0.8, 0, 0]} scale={0.55}>
        <Temple cols={4} w={1.6} d={1.4} roof={M.glaze} />
      </group>
      <Box s={[0.9, 0.08, 0.3]} p={[0, 0.6, 0]} m={M.gold} />
    </group>
  )
}

function Mine() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} material={M.rock} castShadow>
        <dodecahedronGeometry args={[1.1, 0]} />
      </mesh>
      <Box s={[0.6, 0.7, 0.3]} p={[0, 0.35, 0.95]} m={M.glaze} />
      {[[0.6, 0.3, 1.0], [-0.55, 0.25, 1.05], [0.9, 0.2, 0.5]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0.3 * i, i, 0.2]} material={M.gold} castShadow>
          <octahedronGeometry args={[0.18 + i * 0.03, 0]} />
        </mesh>
      ))}
    </group>
  )
}

function Stoa() {
  return (
    <group>
      <Box s={[3, 0.15, 1.1]} p={[0, 0.075, 0]} m={M.marbleShade} />
      {Array.from({ length: 7 }, (_, i) => (
        <Col key={i} p={[-1.35 + i * 0.45, 0.15, 0.35]} h={1.1} rad={0.09} />
      ))}
      <Box s={[3, 1.1, 0.15]} p={[0, 0.7, -0.4]} m={M.marble} />
      <Box s={[3.1, 0.15, 1.2]} p={[0, 1.33, 0]} m={M.clay} />
    </group>
  )
}

export function LandmarkModel({ type }: { type: Landmark }) {
  switch (type) {
    case 'amphora':
      return <Amphora scale={1.2} />
    case 'stoa':
      return <Stoa />
    case 'lighthouse':
      return <Lighthouse />
    case 'theatre':
      return <Theatre />
    case 'agora':
      return <Agora />
    case 'bridge':
      return <Bridge />
    case 'treasury':
      return <Treasury />
    case 'forge':
      return <Forge />
    case 'mill':
      return <Mill />
    case 'stairs':
      return <Stairs />
    case 'grove':
      return <Grove />
    case 'circle':
      return <Circle />
    case 'twins':
      return <Twins />
    case 'mine':
      return <Mine />
  }
}

export { OliveTree }
