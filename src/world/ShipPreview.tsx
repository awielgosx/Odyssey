// A small live 3D view of one ship style, for the "choose your ship" cards: the same low-poly
// trireme as in the game, bobbing on a patch of faceted sea. Rendered on demand at 30 fps only
// while the card is selected, so three of them cost almost nothing.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ShipStyle } from '../store'
import { M } from './Landmarks'
import { PAL } from './palette'
import { useHullGeometry, useSailGeometry } from './Ship'
import { sailTexture } from './textures'

function Model({ style, active }: { style: ShipStyle; active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const hull = useHullGeometry(style)
  const sailGeo = useSailGeometry()
  const hullMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, flatShading: true }), [])
  const sailMat = useMemo(() => new THREE.MeshStandardMaterial({ map: sailTexture(style), side: THREE.DoubleSide, roughness: 0.9, flatShading: true }), [style])
  const sea = useMemo(() => {
    const g = new THREE.CircleGeometry(2.7, 9, 0, Math.PI * 2)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 1; i < pos.count; i++) pos.setY(i, Math.sin(i * 1.7) * 0.06)
    g.computeVertexNormals()
    return g
  }, [])
  const t = useRef(0)
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    t.current += dt
    g.rotation.y = -0.22 + (active ? Math.sin(t.current * 0.6) * 0.3 : 0)
    g.position.y = Math.sin(t.current * 1.6) * 0.05
    g.rotation.z = Math.sin(t.current * 1.3) * 0.04
  })
  return (
    <>
      <mesh geometry={sea} position-y={0.05}>
        <meshStandardMaterial color={PAL.aegeanShallow} flatShading roughness={0.7} transparent opacity={0.85} />
      </mesh>
      <group ref={group}>
        <mesh geometry={hull} material={hullMat} />
        <mesh position={[0, 1.35, 0]} material={M.wood}>
          <cylinderGeometry args={[0.035, 0.05, 1.9, 6]} />
        </mesh>
        <mesh position={[0, 2.2, 0]} rotation-x={Math.PI / 2} material={M.wood}>
          <cylinderGeometry args={[0.025, 0.025, 1.9, 5]} />
        </mesh>
        <mesh geometry={sailGeo} material={sailMat} position={[0.06, 1.5, 0]} rotation-y={Math.PI / 2} />
        {Array.from({ length: 14 }, (_, i) => {
          const side = i % 2 === 0 ? 1 : -1
          const x = -0.9 + Math.floor(i / 2) * 0.3
          return (
            <mesh key={i} position={[x, 0.21, side * 0.65]} rotation-x={side * 2.0} material={M.wood}>
              <cylinderGeometry args={[0.015, 0.02, 1.0, 4]} />
            </mesh>
          )
        })}
      </group>
    </>
  )
}

function Ticker({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    if (!active) return
    const id = window.setInterval(() => invalidate(), 33)
    return () => window.clearInterval(id)
  }, [active, invalidate])
  return null
}

export function ShipPreview3D({ style, active }: { style: ShipStyle; active: boolean }) {
  return (
    <Canvas className="ship-canvas" frameloop="demand" dpr={[1, 2]} camera={{ position: [1.2, 2.3, 6.4], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0.1, 0.95, 0)}>
      <hemisphereLight args={['#ffe2c2', '#2d5a6e', 1.1]} />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color={PAL.sun} />
      <Model style={style} active={active} />
      <Ticker active={active} />
    </Canvas>
  )
}
