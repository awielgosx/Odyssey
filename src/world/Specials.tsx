import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Argos, Cattle, Charybdis, Loom, NobodyCave, Sundial, TrojanHorse } from './Eggs'
import { StopTag, Terrain, useStopClick } from './Island'
import { M, Temple } from './Landmarks'
import { ISLETS, laneZ, NARROWS_X, rng, stopByKey, type Stop } from './layout'
import { PAL } from './palette'

function Clickable({ stop, children, tagY = 2 }: { stop: Stop; children: React.ReactNode; tagY?: number }) {
  const onClick = useStopClick(stop)
  const s = stop.island!
  return (
    <group
      position={[s.x, 0, s.z]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {children}
      <StopTag stop={stop} height={s.height + tagY} />
    </group>
  )
}

function Houses({ count, seed, radius, y }: { count: number; seed: number; radius: number; y: number }) {
  const list = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2
      const d = 2.4 + r() * radius
      return { p: [Math.cos(a) * d, y, Math.sin(a) * d] as [number, number, number], s: 0.5 + r() * 0.4, rot: r() * Math.PI }
    })
  }, [count, seed, radius, y])
  return (
    <>
      {list.map((h, i) => (
        <group key={i} position={h.p} rotation-y={h.rot} scale={h.s}>
          <mesh position={[0, 0.45, 0]} material={M.marble} castShadow receiveShadow>
            <boxGeometry args={[1, 0.9, 0.8]} />
          </mesh>
          <mesh position={[0, 1.05, 0]} rotation-y={Math.PI / 4} material={M.clay} castShadow>
            <coneGeometry args={[0.75, 0.35, 4]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// Troy: your business today. A walled city everyone fights over, the old model.
export function Troy() {
  const stop = stopByKey('troy')
  const s = stop.island!
  const towers = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  return (
    <Clickable stop={stop}>
      <Terrain poly={s.poly} height={s.height} seed={s.seed} scatter={8}>
        {(p) => (
          <group position={p}>
            <mesh position={[0, 0.7, 0]} material={M.marbleShade} castShadow receiveShadow>
              <cylinderGeometry args={[3.6, 3.7, 1.4, 16, 1, true]} />
            </mesh>
            {towers.map((a, i) => (
              <mesh key={i} position={[Math.cos(a) * 3.65, 0.95, Math.sin(a) * 3.65]} material={M.marble} castShadow>
                <cylinderGeometry args={[0.45, 0.5, 1.9, 6]} />
              </mesh>
            ))}
            <group position={[0, 0, -0.5]} scale={0.8}>
              <Temple cols={6} w={2.6} d={1.8} />
            </group>
            <Houses count={6} seed={11} radius={0.8} y={0} />
            <TrojanHorse position={[2.6, 0, 5.0]} />
          </group>
        )}
      </Terrain>
    </Clickable>
  )
}

// Aeolus' floating island, walled in bronze, where the winds are kept in a bag.
export function Aeolus() {
  const stop = stopByKey('aeolus')
  const s = stop.island!
  const float = useRef<THREE.Group>(null)
  const swirls = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (float.current) float.current.position.y = 1.6 + Math.sin(t * 0.8) * 0.25
    if (swirls.current) swirls.current.rotation.y = t * 0.6
  })
  return (
    <Clickable stop={stop} tagY={4}>
      <group ref={float}>
        <Terrain poly={s.poly} height={s.height} seed={s.seed} scatter={5} plain>
          {(p) => (
            <group position={p}>
              <mesh position={[0, 0.5, 0]} material={M.gold} castShadow>
                <cylinderGeometry args={[3.4, 3.4, 1.0, 20, 1, true]} />
              </mesh>
              <mesh position={[0, 0.6, 0]} material={M.wood} castShadow>
                <sphereGeometry args={[0.7, 7, 6]} />
              </mesh>
              <mesh position={[0, 1.3, 0]} material={M.gold}>
                <torusGeometry args={[0.18, 0.06, 5, 8]} />
              </mesh>
            </group>
          )}
        </Terrain>
        {/* the island floats: show its rocky underside */}
        <mesh position={[0, -1.4, 0]} rotation-x={Math.PI} material={M.rock} castShadow>
          <coneGeometry args={[s.radius * 0.95, 3.2, 9]} />
        </mesh>
      </group>
      <group ref={swirls} position={[0, 4.5, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, 0, i]} position={[0, i * 0.6, 0]}>
            <torusGeometry args={[3 + i * 0.8, 0.04, 4, 40, Math.PI * 1.3]} />
            <meshBasicMaterial color="#f4efe2" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </Clickable>
  )
}

// Lemnos, where Hephaestus keeps his forge in a smoking volcano.
export function Lemnos() {
  const stop = stopByKey('lemnos')
  const s = stop.island!
  const glow = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 14 + Math.sin(clock.elapsedTime * 5) * 4
  })
  const geo = useMemo(() => new THREE.CylinderGeometry(1.2, 3.6, 3.4, 9, 3), [])
  return (
    <Clickable stop={stop} tagY={4}>
      <Terrain poly={s.poly} height={s.height} seed={s.seed} scatter={6}>
        {(p) => (
          <group position={p}>
            <mesh geometry={geo} position={[0, 1.7, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#5b4a40" flatShading roughness={1} />
            </mesh>
            <mesh position={[0, 3.41, 0]}>
              <cylinderGeometry args={[0.95, 0.95, 0.05, 9]} />
              <meshStandardMaterial color="#ff7a2a" emissive="#ff5a10" emissiveIntensity={4} />
            </mesh>
            <group position={[3.2, 0, 1.6]}>
              <mesh position={[0, 0.3, 0]} material={M.glaze} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.4]} />
              </mesh>
              <mesh position={[0, 0.66, 0]} material={M.glaze} castShadow>
                <boxGeometry args={[1.1, 0.14, 0.45]} />
              </mesh>
            </group>
          </group>
        )}
      </Terrain>
    </Clickable>
  )
}

// Olympus: the council of the gods.
export function Olympus() {
  const stop = stopByKey('olympus')
  const s = stop.island!
  const mountain = useMemo(() => new THREE.CylinderGeometry(1.8, 6.2, 9, 10, 4), [])
  const snow = useMemo(() => new THREE.CylinderGeometry(1.85, 3.1, 2.6, 10, 1), [])
  return (
    <Clickable stop={stop} tagY={9}>
      <Terrain poly={s.poly} height={s.height} seed={s.seed} scatter={6}>
        {(p) => (
          <group position={p}>
            <mesh geometry={mountain} position={[0, 4.5, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#9c7f66" flatShading roughness={1} />
            </mesh>
            <mesh geometry={snow} position={[0, 7.75, 0]} castShadow>
              <meshStandardMaterial color={PAL.marble} flatShading roughness={0.9} />
            </mesh>
            <group position={[0, 9.05, 0]} scale={0.75}>
              <Temple cols={6} w={2.6} d={1.8} roof={M.gold} />
            </group>
            <Sundial position={[4.2, 0, 3.4]} />
          </group>
        )}
      </Terrain>
    </Clickable>
  )
}

// Ithaca, home: the reinvented business model. Its outline follows the real island.
export function Ithaca() {
  const stop = stopByKey('ithaca')
  const s = stop.island!
  return (
    <Clickable stop={stop}>
      <Terrain poly={s.poly} height={s.height} seed={s.seed} scatter={8}>
        {(p) => (
          <group position={p}>
            <group rotation-y={Math.PI / 2}>
              <Temple cols={6} w={3} d={2} h={1.6} />
            </group>
            <Houses count={7} seed={77} radius={3} y={0} />
            <Loom position={[-2.2, 0, 1.6]} />
          </group>
        )}
      </Terrain>
      {/* harbour quay where Argos waits */}
      <group position={[-1.5, 0, -s.poly.reduce((m, q) => Math.min(m, q.y), 0) * -1 - 0.2]}>
        <mesh position={[0, 0.25, 0]} material={M.marbleShade} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.5, 3.2]} />
        </mesh>
        <Argos position={[0.1, 0.5, 0.9]} />
      </group>
    </Clickable>
  )
}

// The Narrows between the two seas: Scylla's cliff, Charybdis, the Sirens, and the Sun's cattle.
export function Narrows() {
  const stop = stopByKey('narrows')
  const z = laneZ(NARROWS_X)
  const scylla = useMemo(() => new THREE.CylinderGeometry(2.4, 4.6, 9, 7, 3), [])
  return (
    <group>
      <group position={[NARROWS_X - 1, 0, z - 9]}>
        <mesh geometry={scylla} position={[0, 4.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#7d6a5a" flatShading roughness={1} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i) * 2.9, 2.5 + i * 0.9, 2.6 + Math.sin(i) * 0.6]} material={M.glaze}>
            <boxGeometry args={[0.6, 0.45, 0.3]} />
          </mesh>
        ))}
      </group>
      <Charybdis position={[NARROWS_X + 2, 0.25, z + 8]} />
      <Html position={[NARROWS_X, 6, z]} center zIndexRange={[10, 0]}>
        <div className="flag special narrows">{stop.label}</div>
      </Html>
    </group>
  )
}

export function Islets() {
  return (
    <>
      {ISLETS.map((i) => (
        <group key={i.key} position={[i.x, 0, i.z]}>
          <Terrain poly={i.poly} height={i.height} seed={i.seed} scatter={i.key === 'thrinacia' ? 3 : 4} plain={i.key !== 'thera'}>
            {(p) => (
              <group position={p}>
                {i.key === 'nobody' && <NobodyCave position={[0, 0, 0]} />}
                {i.key === 'thrinacia' && <Cattle position={[0, 0, 0]} />}
                {i.key === 'sirens' &&
                  [0, 1, 2].map((k) => (
                    <group key={k} position={[Math.cos(k * 2.1) * 0.9, 0, Math.sin(k * 2.1) * 0.9]}>
                      <mesh position={[0, 0.35, 0]} material={M.marble} castShadow>
                        <coneGeometry args={[0.18, 0.7, 5]} />
                      </mesh>
                      <mesh position={[0, 0.5, 0]} rotation-z={0.3} material={M.gold}>
                        <boxGeometry args={[0.7, 0.05, 0.2]} />
                      </mesh>
                    </group>
                  ))}
              </group>
            )}
          </Terrain>
        </group>
      ))}
    </>
  )
}
