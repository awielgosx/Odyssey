import { Canvas, useFrame } from '@react-three/fiber'
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { forwardRef, Suspense, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store'
import { drawMeander } from '../world/textures'
import { PAL } from '../world/palette'
import { buildD8, topFace, type DieFace } from './d8'

export interface RollResult {
  proposition: DieFace
  architecture: DieFace
}

const VP_VALUES: (number | 'C')[] = [1, 2, 3, 4, 5, 6, 7, 'C']
const VA_VALUES: (number | 'C')[] = [8, 9, 10, 11, 12, 13, 14, 'C']

interface DieHandle {
  throwDie: (from: THREE.Vector3, dir: THREE.Vector3) => void
  isStill: () => boolean
  face: () => DieFace
}

const Die = forwardRef<DieHandle, { values: (number | 'C')[]; style: 'black-figure' | 'red-figure'; start: [number, number, number] }>(
  function Die({ values, style, start }, ref) {
    const body = useRef<RapierRigidBody>(null)
    const { geo, materials, faces } = useMemo(() => buildD8(values, style), [values, style])
    useImperativeHandle(ref, () => ({
      throwDie(from, dir) {
        const b = body.current
        if (!b) return
        b.setTranslation(from, true)
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6))
        b.setRotation(q, true)
        b.setLinvel(dir, true)
        b.setAngvel({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30, z: (Math.random() - 0.5) * 30 }, true)
      },
      isStill() {
        const b = body.current
        if (!b) return true
        const v = b.linvel()
        const w = b.angvel()
        return Math.hypot(v.x, v.y, v.z) < 0.03 && Math.hypot(w.x, w.y, w.z) < 0.05
      },
      face() {
        const r = body.current!.rotation()
        return topFace(faces, new THREE.Quaternion(r.x, r.y, r.z, r.w))
      },
    }))
    return (
      <RigidBody ref={body} colliders="hull" position={start} restitution={0.35} friction={0.6} linearDamping={0.15} angularDamping={0.2}>
        <mesh geometry={geo} material={materials} castShadow receiveShadow />
      </RigidBody>
    )
  },
)

// The dice land in a kylix, the wide Greek drinking cup.
function Kylix() {
  const geo = useMemo(() => {
    const pts = [
      [0, -0.02], [3.6, -0.02], [4.1, 0.2], [4.4, 0.9], [4.55, 1.0], [4.5, 1.05], [4.2, 0.95], [3.9, 0.3], [3.4, 0.04], [0, 0.04],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 40)
  }, [])
  const tondo = useMemo(() => {
    const s = 1024
    const cv = document.createElement('canvas')
    cv.width = cv.height = s
    const c = cv.getContext('2d')!
    c.fillStyle = PAL.glaze
    c.fillRect(0, 0, s, s)
    c.fillStyle = PAL.clay
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.47, 0, Math.PI * 2)
    c.fill()
    // meander ring
    c.save()
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.47, 0, Math.PI * 2)
    c.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2, true)
    c.clip()
    c.translate(s / 2, s / 2)
    for (let i = 0; i < 48; i++) {
      c.save()
      c.rotate((i / 48) * Math.PI * 2)
      drawMeander(c, -32, -s * 0.47, 64, s * 0.065, PAL.glaze)
      c.restore()
    }
    c.restore()
    // wind god puff: a stylised Aeolus face of swirls
    c.strokeStyle = PAL.glaze
    c.lineWidth = 14
    for (let i = 0; i < 3; i++) {
      c.beginPath()
      c.arc(s / 2 - 60 + i * 60, s / 2 + 40, 50 - i * 8, Math.PI, Math.PI * 2.2)
      c.stroke()
    }
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial color={PAL.glaze} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.045} receiveShadow>
        <circleGeometry args={[3.55, 48]} />
        <meshStandardMaterial map={tondo} roughness={0.55} />
      </mesh>
    </group>
  )
}

function TrayColliders() {
  const walls = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2)
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[5, 0.2, 5]} position={[0, -0.16, 0]} friction={0.8} restitution={0.2} />
      {walls.map((a, i) => (
        <CuboidCollider
          key={i}
          args={[1.1, 2.5, 0.2]}
          position={[Math.cos(a) * 3.85, 1.2, Math.sin(a) * 3.85]}
          rotation={[0, -a + Math.PI / 2, 0]}
          restitution={0.4}
        />
      ))}
      <CuboidCollider args={[5, 0.2, 5]} position={[0, 7, 0]} />
    </RigidBody>
  )
}

function Rain() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const drops = useMemo(() => Array.from({ length: 220 }, () => new THREE.Vector3((Math.random() - 0.5) * 18, Math.random() * 12, (Math.random() - 0.5) * 12 - 2)), [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh) return
    drops.forEach((d, i) => {
      d.y -= dt * 14
      d.x -= dt * 3
      if (d.y < 0) {
        d.y = 12
        d.x = (Math.random() - 0.5) * 18
      }
      m.makeRotationZ(0.2).setPosition(d)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, drops.length]}>
      <boxGeometry args={[0.015, 0.45, 0.015]} />
      <meshBasicMaterial color="#cfe3ee" transparent opacity={0.35} />
    </instancedMesh>
  )
}

export interface StormHandle {
  roll: () => void
}

const Scene = forwardRef<StormHandle, { onResult: (r: RollResult) => void }>(function Scene({ onResult }, ref) {
  const vp = useRef<DieHandle>(null)
  const va = useRef<DieHandle>(null)
  const flash = useRef<THREE.AmbientLight>(null)
  const state = useRef({ rolling: false, still: 0, flash: 0 })

  useImperativeHandle(ref, () => ({
    roll() {
      state.current = { rolling: true, still: 0, flash: 1 }
      vp.current?.throwDie(new THREE.Vector3(-1.2, 4.2, 3.2), new THREE.Vector3(1 + Math.random(), -1.5, -6 - Math.random() * 2))
      va.current?.throwDie(new THREE.Vector3(1.3, 4.6, 3.4), new THREE.Vector3(-1 - Math.random(), -1.5, -6 - Math.random() * 2))
    },
  }))

  useFrame((_, dt) => {
    const s = state.current
    s.flash = Math.max(0, s.flash - dt * 2.5)
    if (flash.current) flash.current.intensity = 0.25 + s.flash * (Math.random() > 0.4 ? 6 : 1)
    if (!s.rolling) return
    if (vp.current?.isStill() && va.current?.isStill()) s.still += dt
    else s.still = 0
    if (s.still > 0.45) {
      s.rolling = false
      onResult({ proposition: vp.current!.face(), architecture: va.current!.face() })
    }
  })

  return (
    <>
      <color attach="background" args={['#1c2a36']} />
      <fog attach="fog" args={['#1c2a36', 12, 30]} />
      <ambientLight ref={flash} intensity={0.25} color="#bcd4ff" />
      <spotLight position={[3, 10, 4]} angle={0.55} penumbra={0.6} intensity={140} color="#ffd9a8" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -3]} intensity={0.9} color="#7aa2d6" />
      <Physics gravity={[0, -18, 0]}>
        <TrayColliders />
        <Die ref={vp} values={VP_VALUES} style="black-figure" start={[-1.2, 0.8, 0.4]} />
        <Die ref={va} values={VA_VALUES} style="red-figure" start={[1.2, 0.8, -0.3]} />
      </Physics>
      <Kylix />
      <Rain />
    </>
  )
})

export const StormDice = forwardRef<StormHandle, { onResult: (r: RollResult) => void }>(function StormDice({ onResult }, ref) {
  const quality = useGame((s) => s.quality)
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 7.2, 6.4], fov: 40 }} gl={{ toneMapping: THREE.NoToneMapping }}>
      <Suspense fallback={null}>
        <Scene ref={ref} onResult={onResult} />
        {quality === 'high' && (
          <EffectComposer multisampling={4}>
            <N8AO aoRadius={0.6} intensity={2} halfRes />
            <Bloom luminanceThreshold={0.9} intensity={0.5} mipmapBlur />
            <ToneMapping mode={ToneMappingMode.AGX} />
            <Vignette offset={0.2} darkness={0.7} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
})
