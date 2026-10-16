import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { audio } from '../audio/engine'
import { useGame } from '../store'
import { M } from './Landmarks'
import { laneSlope, laneZ, NARROWS_X, STOPS } from './layout'
import { PAL } from './palette'
import { sailTexture } from './textures'

// Shared, mutable ship state so the camera can follow without React re-renders.
const start = STOPS[0].dock
export const shipState = { pos: new THREE.Vector3(start.x, 0, start.z), heading: 0, dir: 1, sailing: false }

function useHullGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.55, 0.95)
    s.quadraticCurveTo(-1.45, 0.2, -1.0, 0.0)
    s.lineTo(1.0, 0.0)
    s.lineTo(1.75, 0.08) // bronze ram
    s.lineTo(1.25, 0.28)
    s.quadraticCurveTo(1.45, 0.55, 1.62, 0.8)
    s.lineTo(1.3, 0.52)
    s.lineTo(-1.2, 0.52)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false, curveSegments: 6, steps: 2 })
    g.translate(0, 0, -0.35)
    const pos = g.attributes.position
    const colors: number[] = []
    const glaze = new THREE.Color(PAL.glaze)
    const clay = new THREE.Color(PAL.clay)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const taper = Math.max(0.12, 1 - Math.pow(Math.abs(x) / 1.6, 2.2))
      const belly = 0.55 + 0.45 * Math.min(1, y / 0.4)
      pos.setZ(i, pos.getZ(i) * taper * belly)
      const c = y > 0.36 && y < 0.5 ? clay : glaze
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

function useSailGeometry() {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(1.7, 1.35, 8, 6)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.cos((x / 1.7) * Math.PI) * 0.22 * (0.6 + 0.4 * Math.cos((y / 1.35) * Math.PI)))
    }
    g.computeVertexNormals()
    return g
  }, [])
}

export function Ship() {
  const group = useRef<THREE.Group>(null)
  const oars = useRef<THREE.Group>(null)
  const sail = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const bag = useRef<THREE.Mesh>(null)
  const bagClicks = useRef(0)
  const stopIndex = useGame((s) => s.stopIndex)
  const sailing = useGame((s) => s.sailing)
  const arrive = useGame((s) => s.arrive)
  const hull = useHullGeometry()
  const sailGeo = useSailGeometry()
  const hullMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, flatShading: true }), [])
  const sailMat = useMemo(() => new THREE.MeshStandardMaterial({ map: sailTexture(), side: THREE.DoubleSide, roughness: 0.9, flatShading: true }), [])
  const voyage = useRef<{ from: number; to: number; t: number; dur: number } | null>(null)
  const stroke = useRef(0)
  const blink = useRef(60 + Math.random() * 30)

  // restore position after a reload
  useEffect(() => {
    const d = STOPS[useGame.getState().stopIndex].dock
    shipState.pos.set(d.x, 0, d.z)
  }, [])

  useEffect(() => {
    if (!sailing) return
    const from = shipState.pos.x
    const to = STOPS[stopIndex].dock.x
    const dist = Math.abs(to - from)
    const back = to < from
    voyage.current = { from, to, t: 0, dur: Math.max(2, dist / (back ? 30 : 11)) }
    shipState.dir = back ? -1 : 1
    shipState.sailing = true
    audio.sailing = true
    audio.creak()
  }, [sailing, stopIndex])

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    const v = voyage.current
    const time = clock.elapsedTime
    if (v) {
      v.t = Math.min(1, v.t + dt / v.dur)
      const e = v.t < 0.5 ? 2 * v.t * v.t : 1 - Math.pow(-2 * v.t + 2, 2) / 2
      const x = v.from + (v.to - v.from) * e
      shipState.pos.set(x, 0, laneZ(x))
      if (v.t >= 1) {
        voyage.current = null
        shipState.sailing = false
        audio.sailing = false
        arrive()
      }
    }
    const x = shipState.pos.x
    const facing = Math.atan2(-laneSlope(x) * shipState.dir, shipState.dir)
    shipState.heading = THREE.MathUtils.lerp(shipState.heading, facing, 0.1)
    g.position.set(shipState.pos.x, 0.05 + Math.sin(time * 1.6) * 0.08, shipState.pos.z)
    g.rotation.set(Math.sin(time * 1.3) * 0.04, shipState.heading, Math.sin(time * 1.1) * 0.05)

    // oars: rowing while sailing, one splash per stroke
    if (oars.current) {
      const speed = v ? 6 : 1.2
      oars.current.children.forEach((o) => (o.rotation.y = Math.sin(time * speed) * (v ? 0.45 : 0.08)))
      if (v) {
        const s = Math.floor((time * speed) / Math.PI)
        if (s !== stroke.current) {
          stroke.current = s
          if (s % 2 === 0) audio.oar()
        }
      }
    }
    if (sail.current) sail.current.scale.z = 1 + Math.sin(time * 2.2) * 0.12

    // the bow eyes blink about once a minute
    blink.current -= dt
    if (eyes.current) eyes.current.scale.y = blink.current < 0.12 && blink.current > 0 ? 0.1 : 1
    if (blink.current < 0) blink.current = 60 + Math.random() * 30

    // sirens sing near the Narrows
    const d = Math.abs(x - NARROWS_X)
    audio.siren(Math.max(0, 1 - d / 20))
  })

  return (
    <group ref={group} scale={1.15}>
      <mesh geometry={hull} material={hullMat} castShadow receiveShadow />
      <group ref={eyes}>
        {[-1, 1].map((s) => (
          <group key={s} position={[1.22, 0.38, s * 0.19]}>
            <mesh rotation-y={s > 0 ? 0 : Math.PI} position-z={s * 0.005}>
              <circleGeometry args={[0.08, 10]} />
              <meshStandardMaterial color={PAL.marble} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation-y={s > 0 ? 0 : Math.PI} position-z={s * 0.012}>
              <circleGeometry args={[0.04, 8]} />
              <meshStandardMaterial color={PAL.glaze} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 1.35, 0]} material={M.wood} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.9, 6]} />
      </mesh>
      <mesh position={[0, 2.2, 0]} rotation-x={Math.PI / 2} material={M.wood} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 5]} />
      </mesh>
      <mesh ref={sail} geometry={sailGeo} material={sailMat} position={[0.06, 1.5, 0]} rotation-y={Math.PI / 2} castShadow />
      {/* Aeolus' bag of winds, tied on deck */}
      <mesh
        ref={bag}
        position={[-0.75, 0.62, 0]}
        material={M.wood}
        onClick={(e) => {
          e.stopPropagation()
          bagClicks.current++
          if (bag.current) bag.current.scale.setScalar(1 + bagClicks.current * 0.15)
          if (bagClicks.current >= 3) {
            bagClicks.current = 0
            if (bag.current) bag.current.scale.setScalar(1)
            audio.thunder()
            useGame.getState().findEgg('bag', 'The bag of winds bursts. Odysseus’ crew opened it too, within sight of home. (Odyssey, book 10)')
          }
        }}
        onPointerOver={() => (document.body.style.cursor = 'help')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <sphereGeometry args={[0.16, 6, 5]} />
      </mesh>
      <group ref={oars}>
        {Array.from({ length: 14 }, (_, i) => {
          // fourteen oars: seven per side, like the seven directions in each sea
          const side = i % 2 === 0 ? 1 : -1
          const x = -0.9 + Math.floor(i / 2) * 0.3
          return (
            <group key={i} position={[x, 0.42, side * 0.2]}>
              <mesh position={[0, -0.21, side * 0.45]} rotation-x={side * 2.0} material={M.wood}>
                <cylinderGeometry args={[0.015, 0.02, 1.0, 4]} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}
