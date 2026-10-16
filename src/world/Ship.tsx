import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store'
import { islandByKey } from './layout'
import { M } from './Landmarks'
import { PAL } from './palette'
import { sailTexture } from './textures'

// Shared, mutable ship state so the camera can follow without React re-renders.
export const shipState = { pos: new THREE.Vector3(2.5, 0, 51.5), heading: Math.PI / 2 }

function dockPoint(key: string, from: THREE.Vector3) {
  const isl = islandByKey(key)
  const c = new THREE.Vector3(isl.x, 0, isl.z)
  const dir = from.clone().sub(c).setY(0)
  if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1)
  dir.normalize()
  return c.add(dir.multiplyScalar(isl.radius * 1.55 + 1.2))
}

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
  const target = useGame((s) => s.target)
  const sailing = useGame((s) => s.sailing)
  const arrive = useGame((s) => s.arrive)
  const hull = useHullGeometry()
  const sailGeo = useSailGeometry()
  const hullMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, flatShading: true }), [])
  const sailMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: sailTexture(), side: THREE.DoubleSide, roughness: 0.9, flatShading: true }),
    [],
  )
  const voyage = useRef<{ curve: THREE.CatmullRomCurve3; t: number; dur: number } | null>(null)

  useEffect(() => {
    if (!sailing) return
    const start = shipState.pos.clone()
    const end = dockPoint(target, start)
    const mid = start.clone().lerp(end, 0.5)
    const side = new THREE.Vector3().subVectors(end, start).cross(new THREE.Vector3(0, 1, 0)).normalize()
    mid.add(side.multiplyScalar(start.distanceTo(end) * 0.18))
    const curve = new THREE.CatmullRomCurve3([start, mid, end])
    voyage.current = { curve, t: 0, dur: Math.max(2.2, curve.getLength() / 9) }
  }, [sailing, target])

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    const v = voyage.current
    if (v) {
      v.t = Math.min(1, v.t + dt / v.dur)
      const e = v.t < 0.5 ? 2 * v.t * v.t : 1 - Math.pow(-2 * v.t + 2, 2) / 2
      const p = v.curve.getPointAt(e)
      const tan = v.curve.getTangentAt(Math.min(0.999, Math.max(0.001, e)))
      shipState.pos.copy(p)
      shipState.heading = Math.atan2(-tan.z, tan.x)
      if (v.t >= 1) {
        voyage.current = null
        arrive()
      }
    }
    const time = clock.elapsedTime
    g.position.set(shipState.pos.x, 0.05 + Math.sin(time * 1.6) * 0.08, shipState.pos.z)
    g.rotation.set(Math.sin(time * 1.3) * 0.04, shipState.heading, Math.sin(time * 1.1) * 0.05)
    if (oars.current) {
      const speed = v ? 6 : 1.2
      oars.current.children.forEach((o, i) => {
        o.rotation.y = Math.sin(time * speed + i * 0.0) * (v ? 0.45 : 0.08)
      })
    }
    if (sail.current) sail.current.scale.z = 1 + Math.sin(time * 2.2) * 0.12
  })

  return (
    <group ref={group} scale={1.1}>
      <mesh geometry={hull} material={hullMat} castShadow receiveShadow />
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
      <mesh position={[0, 1.35, 0]} material={M.wood} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.9, 6]} />
      </mesh>
      <mesh position={[0, 2.2, 0]} rotation-x={Math.PI / 2} material={M.wood} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 5]} />
      </mesh>
      <mesh ref={sail} geometry={sailGeo} material={sailMat} position={[0.06, 1.5, 0]} rotation-y={Math.PI / 2} castShadow />
      <group ref={oars}>
        {Array.from({ length: 10 }, (_, i) => {
          const side = i % 2 === 0 ? 1 : -1
          const x = -0.8 + Math.floor(i / 2) * 0.38
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
