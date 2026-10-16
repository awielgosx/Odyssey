import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { audio } from '../audio/engine'
import { useGame } from '../store'
import { M } from './Landmarks'
import { PAL } from './palette'
import { shipState } from './Ship'

// Small hidden details. None of them is needed to play; each answers when found.

const find = (key: string, text: string) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation()
  useGame.getState().findEgg(key, text)
  audio.pluck(440, 0, 0.2, audio.sfx)
}

const hover = {
  onPointerOver: () => (document.body.style.cursor = 'help'),
  onPointerOut: () => (document.body.style.cursor = ''),
}

// Tiresias' oar: a farmer far inland mistakes an oar for a winnowing fan (Odyssey 11).
export function TiresiasOar({ position }: { position: [number, number, number] }) {
  return (
    <group
      position={position}
      onClick={find('oar', '"What a fine winnowing fan, stranger!" Same object, different customer, different value. (Odyssey, book 11)')}
      {...hover}
    >
      <mesh position={[0, 0.35, 0]} material={M.clay} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.7, 6]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={M.marble} castShadow>
        <sphereGeometry args={[0.12, 6, 5]} />
      </mesh>
      <mesh position={[0.18, 0.75, 0]} rotation-z={-0.3} material={M.wood} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.3, 4]} />
      </mesh>
      <mesh position={[0.36, 1.32, 0]} rotation-z={-0.3} material={M.wood} castShadow>
        <boxGeometry args={[0.14, 0.35, 0.03]} />
      </mesh>
    </group>
  )
}

// A shuttered scroll-lending stall with a late fee (Netflix and Blockbuster, session 11).
export function LateFeeStall({ position }: { position: [number, number, number] }) {
  return (
    <group
      position={position}
      rotation-y={0.6}
      onClick={find(
        'latefee',
        '"Returned late: 40 drachmas." A fine like this is said to have started a rival video business. His co-founder calls the story a convenient fiction. Check your sources.',
      )}
      {...hover}
    >
      <mesh position={[0, 0.3, 0]} material={M.wood} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.5]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={M.clay} castShadow>
        <boxGeometry args={[1.05, 0.08, 0.65]} />
      </mesh>
      <mesh position={[0, 0.35, 0.26]} material={M.marble}>
        <boxGeometry args={[0.5, 0.22, 0.02]} />
      </mesh>
    </group>
  )
}

// Argos, the old dog who alone recognised Odysseus after twenty years (Odyssey 17).
export function Argos({ position }: { position: [number, number, number] }) {
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Mesh>(null)
  const stopIndex = useGame((s) => s.stopIndex)
  const sailing = useGame((s) => s.sailing)
  const home = stopIndex === 19 && !sailing
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (head.current) head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, home ? 0.5 : -0.25, 0.05)
    if (tail.current) tail.current.rotation.y = home ? Math.sin(t * 14) * 0.7 : Math.sin(t * 1.2) * 0.1
  })
  return (
    <group position={position} onClick={find('argos', 'Argos. He waited twenty years by the door, and he still knew his master.')} {...hover}>
      <mesh position={[0, 0.22, 0]} material={M.wood} castShadow>
        <boxGeometry args={[0.6, 0.22, 0.24]} />
      </mesh>
      {[-0.22, 0.22].map((x) =>
        [-0.08, 0.08].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.07, z]} material={M.wood}>
            <boxGeometry args={[0.07, 0.15, 0.07]} />
          </mesh>
        )),
      )}
      <group ref={head} position={[0.32, 0.3, 0]}>
        <mesh position={[0.1, 0.05, 0]} material={M.wood} castShadow>
          <boxGeometry args={[0.24, 0.17, 0.18]} />
        </mesh>
        <mesh position={[0.24, 0.02, 0]} material={M.glaze}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
        </mesh>
      </group>
      <mesh ref={tail} position={[-0.36, 0.3, 0]} rotation-z={0.6} material={M.wood}>
        <boxGeometry args={[0.25, 0.04, 0.04]} />
      </mesh>
    </group>
  )
}

// Penelope's loom: the cloth grows during the day and unravels at night (local clock).
export function Loom({ position }: { position: [number, number, number] }) {
  const cloth = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const h = new Date().getHours()
    const day = h >= 7 && h < 21
    const target = day ? 0.35 + ((h - 7) / 14) * 0.6 : 0.95 - ((h + 3) % 24) / 10
    if (cloth.current) cloth.current.scale.y = THREE.MathUtils.lerp(cloth.current.scale.y, Math.max(0.1, target), 0.02)
  })
  return (
    <group position={position} onClick={find('loom', 'Penelope weaves by day and unpicks by night, waiting for you to come home.')} {...hover}>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} material={M.wood} castShadow>
          <boxGeometry args={[0.06, 1.2, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, 1.18, 0]} material={M.wood}>
        <boxGeometry args={[1.0, 0.06, 0.06]} />
      </mesh>
      <mesh ref={cloth} position={[0, 1.15, 0.01]} scale={[1, 0.5, 1]}>
        <boxGeometry args={[0.82, 0.9, 0.02]} />
        <meshStandardMaterial color={PAL.clayLight} roughness={1} />
      </mesh>
    </group>
  )
}

// Seven herds and seven flocks: the cattle of the Sun (Odyssey 12). Seven directions per sea, too.
export function Cattle({ position }: { position: [number, number, number] }) {
  const beasts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        p: [Math.cos(i * 2.4) * (1 + (i % 4) * 0.8), 0, Math.sin(i * 2.4) * (1 + (i % 4) * 0.8)] as [number, number, number],
        cow: i < 7,
        r: i * 0.7,
      })),
    [],
  )
  return (
    <group position={position} onClick={find('cattle', 'Seven herds of cattle, seven flocks of sheep: the cattle of the Sun. Seven directions per sea, too. Leave them be.')} {...hover}>
      {beasts.map((b, i) => (
        <group key={i} position={b.p} rotation-y={b.r} scale={b.cow ? 1 : 0.7}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.5, 0.25, 0.25]} />
            <meshStandardMaterial color={b.cow ? PAL.gold : PAL.marble} flatShading roughness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.32, 0]} material={b.cow ? M.glaze : M.marbleShade}>
            <boxGeometry args={[0.15, 0.14, 0.14]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Polyphemus' cave. "Who's there?" "Nobody." (Odyssey 9)
export function NobodyCave({ position }: { position: [number, number, number] }) {
  const eye = useRef<THREE.Mesh>(null)
  const [clicks, setClicks] = useState(0)
  useFrame(({ clock }) => {
    if (!eye.current) return
    const t = clock.elapsedTime % 6
    eye.current.scale.y = t > 5.8 ? 0.1 : 1
  })
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        const n = clicks + 1
        setClicks(n)
        if (n === 1) useGame.getState().say('"Who’s there?"  "Nobody."')
        else
          useGame
            .getState()
            .findEgg(
              'nobody',
              'Carved by the cave: "If I had asked people what they wanted, they would have said faster horses." Signed, Nobody. (Henry Ford probably never said it. Check your sources.)',
            )
      }}
      {...hover}
    >
      <mesh position={[0, 0.9, 0]} material={M.glaze}>
        <boxGeometry args={[1.2, 1.4, 0.4]} />
      </mesh>
      <mesh ref={eye} position={[0, 1.15, 0.25]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

// A bronze sundial on Olympus. At 3:14 the gods are pleased.
export function Sundial({ position }: { position: [number, number, number] }) {
  const gnomon = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const d = new Date()
    if (gnomon.current) gnomon.current.rotation.y = -((d.getHours() % 12) + d.getMinutes() / 60) * (Math.PI / 6)
  })
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        const d = new Date()
        const h = d.getHours() % 12 || 12
        const pi = h === 3 && d.getMinutes() === 14
        useGame
          .getState()
          .findEgg(pi ? 'pi' : 'sundial', pi ? '3:14. The shadow falls on π and the gods are pleased.' : `The bronze sundial reads ${h}:${String(d.getMinutes()).padStart(2, '0')}. Come back at 3:14.`)
      }}
      {...hover}
    >
      <mesh position={[0, 0.3, 0]} material={M.marble} castShadow>
        <cylinderGeometry args={[0.3, 0.36, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} material={M.gold}>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
      </mesh>
      <mesh ref={gnomon} position={[0, 0.75, 0]} material={M.glaze}>
        <boxGeometry args={[0.04, 0.22, 0.36]} />
      </mesh>
    </group>
  )
}

// The Trojan horse at Troy.
export function TrojanHorse({ position }: { position: [number, number, number] }) {
  return (
    <group
      position={position}
      rotation-y={-0.5}
      onClick={find('horse', 'Every industry has its Trojan horse: a newcomer that looks like a harmless gift. A DVD-by-post service looked like one once.')}
      {...hover}
    >
      <mesh position={[0, 0.9, 0]} material={M.wood} castShadow>
        <boxGeometry args={[1.6, 0.6, 0.6]} />
      </mesh>
      <mesh position={[0.8, 1.45, 0]} rotation-z={0.5} material={M.wood} castShadow>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
      </mesh>
      <mesh position={[1.05, 1.85, 0]} material={M.wood} castShadow>
        <boxGeometry args={[0.5, 0.28, 0.3]} />
      </mesh>
      {[-0.6, 0.6].map((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.35, z]} material={M.wood} castShadow>
            <boxGeometry args={[0.16, 0.7, 0.16]} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.02, 0]} material={M.glaze}>
        <boxGeometry args={[1.9, 0.06, 0.8]} />
      </mesh>
    </group>
  )
}

// Seven dolphins arc past the ship every so often, as on Exekias' cup.
export function Dolphins() {
  const group = useRef<THREE.Group>(null)
  const state = useRef({ next: 25, t: -1, side: 1, base: new THREE.Vector3() })
  useFrame((_, dt) => {
    const s = state.current
    const g = group.current
    if (!g) return
    if (s.t < 0) {
      s.next -= dt
      g.visible = false
      if (s.next <= 0) {
        s.t = 0
        s.side = Math.random() < 0.5 ? 1 : -1
        s.base.copy(shipState.pos).add(new THREE.Vector3(-14, 0, s.side * 5))
      }
      return
    }
    s.t += dt
    g.visible = true
    g.children.forEach((d, i) => {
      const local = s.t * 1.8 - i * 0.35
      const phase = local % 1.4
      d.position.set(s.base.x + local * 6, Math.sin((phase / 1.4) * Math.PI) * 1.1 - 0.4, s.base.z + (i % 2) * 1.1 - 0.5)
      d.rotation.z = Math.cos((phase / 1.4) * Math.PI) * 0.9
      d.visible = local > 0 && phase < 1.4
    })
    if (s.t > 9) {
      s.t = -1
      s.next = 70 + Math.random() * 60
    }
  })
  return (
    <group ref={group} onClick={find('dolphins', 'Seven dolphins, as on Exekias’ cup: pirates whom Dionysus turned into dolphins.')} {...hover}>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i}>
          <mesh scale={[0.9, 0.22, 0.22]}>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#5f7f93" flatShading roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation-z={-0.4}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshStandardMaterial color="#5f7f93" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Charybdis swallows the sea three times a minute.
export function Charybdis({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const x = c.getContext('2d')!
    x.translate(128, 128)
    for (let i = 0; i < 6; i++) {
      x.rotate(Math.PI / 3)
      x.strokeStyle = 'rgba(244,239,226,0.7)'
      x.lineWidth = 6
      x.beginPath()
      for (let t = 0; t < 1; t += 0.02) {
        const r = 10 + t * 110
        const a = t * 4
        x.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      x.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.z = clock.elapsedTime * 1.2
    const breath = 0.6 + 0.4 * Math.abs(Math.sin((clock.elapsedTime * Math.PI) / 20))
    mesh.current.scale.setScalar(breath)
  })
  return (
    <mesh ref={mesh} position={position} rotation-x={-Math.PI / 2} onClick={find('charybdis', 'Charybdis drinks the sea three times a day. Steer closer to Scylla, as Circe advised.')} {...hover}>
      <circleGeometry args={[4, 32]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  )
}
