import marcellus from '@fontsource/marcellus/files/marcellus-latin-400-normal.woff?url'
import { CameraControls, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store'
import { Dolphins } from './Eggs'
import { DirectionIsland } from './Island'
import { laneZ, NARROWS_X, STOPS, X0, SPACING } from './layout'
import { Ocean } from './Ocean'
import { PAL } from './palette'
import { Ship, shipState } from './Ship'
import { Aeolus, Islets, Ithaca, Lemnos, Narrows, Olympus, Troy } from './Specials'

const SUN_DIR = new THREE.Vector3(-0.5, 0.36, -0.62).normalize()
const FOG = { color: '#efc29a', near: 120, far: 330 }
export const fogState = { near: FOG.near, far: FOG.far }

function FogRig() {
  const chart = useGame((s) => s.chart)
  const scene = useThree((s) => s.scene)
  useFrame(() => {
    const near = chart ? 600 : FOG.near
    const far = chart ? 1400 : FOG.far
    fogState.near += (near - fogState.near) * 0.05
    fogState.far += (far - fogState.far) * 0.05
    const f = scene.fog as THREE.Fog | null
    if (f) {
      f.near = fogState.near
      f.far = fogState.far
    }
  })
  return null
}

function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color(PAL.skyHigh) },
          uMid: { value: new THREE.Color('#e9a77e') },
          uHorizon: { value: new THREE.Color(FOG.color) },
          uSun: { value: SUN_DIR },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
        fragmentShader: `
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; varying vec3 vDir;
          void main(){
            float h = clamp(vDir.y, -0.2, 1.0);
            vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
            col = mix(col, uTop, smoothstep(0.15, 0.75, h));
            float sun = max(dot(normalize(vDir), normalize(uSun)), 0.0);
            col += vec3(1.0, 0.75, 0.45) * pow(sun, 18.0) * 0.6 + vec3(1.0,0.9,0.7) * pow(sun, 900.0) * 3.0;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  )
  return (
    <mesh material={mat} scale={700}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}

function Clouds() {
  const group = useRef<THREE.Group>(null)
  const puffs = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + i
        const d = 330 + (i % 4) * 30
        return { p: new THREE.Vector3(Math.cos(a) * d, 40 + (i % 3) * 14, Math.sin(a) * d * 0.7), s: 14 + (i % 5) * 4 }
      }),
    [],
  )
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.003
  })
  return (
    <group ref={group}>
      {puffs.map((c, i) => (
        <group key={i} position={c.p} scale={c.s}>
          {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.75], [-1.0, -0.25, -0.1, 0.7], [0.3, 0.45, 0, 0.6]].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#fff1e0" flatShading roughness={1} emissive="#f6b885" emissiveIntensity={0.3} fog={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Lights() {
  const quality = useGame((s) => s.quality)
  const sun = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    const l = sun.current
    if (!l) return
    l.position.copy(shipState.pos).addScaledVector(SUN_DIR, 90)
    l.target.position.copy(shipState.pos)
    l.target.updateMatrixWorld()
  })
  return (
    <>
      <hemisphereLight args={['#ffe2c2', '#2d5a6e', 0.85]} />
      <directionalLight
        ref={sun}
        color={PAL.sun}
        intensity={3.2}
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-far={220}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />
      <directionalLight color="#7fb4d8" intensity={0.5} position={[40, 30, 60]} />
    </>
  )
}

function SeaNames() {
  // parchment letters with a dark ink outline: readable on deep water, shallows and foam alike
  const common = {
    font: marcellus,
    fontSize: 3.4,
    color: '#f6e7c4',
    outlineWidth: 0.12,
    outlineColor: '#1d1714',
    outlineOpacity: 0.85,
    anchorX: 'center' as const,
    anchorY: 'middle' as const,
    letterSpacing: 0.08,
  }
  const xp = X0 + SPACING * 4
  const xa = X0 + SPACING * 12
  return (
    <>
      <Text {...common} position={[xp, 0.7, laneZ(xp) + 22]} rotation={[-Math.PI / 2, 0, 0]}>
        Sea of the Value Proposition
      </Text>
      <Text {...common} position={[xa, 0.7, laneZ(xa) + 22]} rotation={[-Math.PI / 2, 0, 0]}>
        Sea of the Value Architecture
      </Text>
      <Text {...common} fontSize={2.2} position={[NARROWS_X, 0.7, laneZ(NARROWS_X) + 15]} rotation={[-Math.PI / 2, 0, 0]}>
        The Narrows
      </Text>
    </>
  )
}

// The sea lane, painted as a dotted route on the water.
function Route() {
  const furthest = useGame((s) => s.furthest)
  const geo = useMemo(() => {
    const pts: number[] = []
    for (let x = STOPS[0].dock.x; x <= STOPS[STOPS.length - 1].dock.x; x += 1.6) pts.push(x, 0.45, laneZ(x))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  const reach = STOPS[Math.min(STOPS.length - 1, furthest + 1)].dock.x
  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.5}
        color={PAL.marble}
        transparent
        opacity={0.85}
        onBeforeCompile={(sh) => {
          sh.uniforms.uReach = { value: reach }
          sh.vertexShader = sh.vertexShader.replace('void main() {', 'uniform float uReach; varying float vAhead;\nvoid main() {\nvAhead = position.x > uReach ? 1.0 : 0.0;')
          sh.fragmentShader = sh.fragmentShader
            .replace('void main() {', 'varying float vAhead;\nvoid main() {')
            .replace('#include <premultiplied_alpha_fragment>', '#include <premultiplied_alpha_fragment>\ngl_FragColor.a *= (1.0 - vAhead * 0.75);')
        }}
        customProgramCacheKey={() => String(Math.round(reach))}
      />
    </points>
  )
}

function CameraRig() {
  const controls = useRef<CameraControls>(null)
  const chart = useGame((s) => s.chart)
  const phase = useGame((s) => s.phase)
  const { size } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    if (import.meta.env.DEV) (window as unknown as { __cam: unknown }).__cam = c
    if (chart) {
      c.maxDistance = 420
      c.minAzimuthAngle = -0.8
      c.setLookAt(0, 230, 150, 0, 0, 0, true)
    } else if (phase !== 'play') {
      // establishing shot: from behind Troy, looking east along the voyage
      c.maxDistance = 420
      c.minAzimuthAngle = -Infinity
      c.maxAzimuthAngle = Infinity
      c.setLookAt(-178, 22, 38, -110, 0, -4, false)
    } else {
      c.minAzimuthAngle = -0.8
      c.maxAzimuthAngle = 0.8
      c.maxDistance = 80
      const p = shipState.pos
      c.setLookAt(p.x + 4, 26, p.z + 40, p.x + 8, 0, p.z - 2, true)
    }
  }, [chart, phase])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c || chart) return
    if (phase !== 'play') {
      c.rotate(dt * 0.01, 0, false)
      return
    }
    const s = useGame.getState()
    // focus between the ship and the island it is visiting; leave room for the task panel on the right
    const stop = STOPS[s.stopIndex]
    target.copy(shipState.pos)
    if (!s.sailing && stop.island) target.lerp(tmp.set(stop.island.x, 0, stop.island.z), 0.45)
    if (s.sailing) target.x += shipState.dir * 6
    const panelOpen = !s.sailing && size.width > 760
    const dist = c.distance
    const visibleW = 2 * dist * Math.tan((38 * Math.PI) / 360) * (size.width / size.height)
    if (panelOpen) target.x += visibleW * 0.17
    c.getTarget(tmp)
    tmp.lerp(target, 1 - Math.exp(-dt * (s.sailing ? 4 : 2.6)))
    c.moveTo(tmp.x, 0, tmp.z, false)
  })

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={16}
      maxDistance={80}
      minPolarAngle={0.45}
      maxPolarAngle={1.2}
      minAzimuthAngle={-0.8}
      maxAzimuthAngle={0.8}
      smoothTime={0.5}
      dollySpeed={0.5}
    />
  )
}

// Render at 30 fps when nothing much moves and 60 fps while sailing: keeps laptops cool.
function Ticker() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const s = useGame.getState()
      const fps = s.sailing || s.chart ? 60 : s.phase === 'play' ? 30 : 24
      if (t - last >= 1000 / fps - 2) {
        last = t
        invalidate()
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [invalidate])
  return null
}

function Effects() {
  const quality = useGame((s) => s.quality)
  if (quality === 'low') return null
  return (
    <EffectComposer multisampling={0}>
      {/* No N8AO: on Apple GPUs its half-resolution depth pass produced NaN patches that Bloom
          smeared into large black shapes on the sea. Shadow maps already give the contact shading. */}
      <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} mipmapBlur />
      <HueSaturation saturation={0.12} />
      <BrightnessContrast contrast={0.06} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.28} darkness={0.5} />
      <SMAA />
    </EffectComposer>
  )
}

export function World() {
  const quality = useGame((s) => s.quality)
  return (
    <Canvas
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 1.5] : 1}
      frameloop="demand"
      gl={{ antialias: quality === 'low', toneMapping: quality === 'low' ? THREE.AgXToneMapping : THREE.NoToneMapping }}
      camera={{ position: [-178, 22, 38], fov: 38, near: 0.5, far: 1600 }}
    >
      <color attach="background" args={[FOG.color]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <Suspense fallback={null}>
        <SkyDome />
        <Clouds />
        <Lights />
        <Ocean />
        <Troy />
        {STOPS.filter((s) => s.kind === 'island').map((s) => (
          <DirectionIsland key={s.key} stop={s} />
        ))}
        <Narrows />
        <Aeolus />
        <Lemnos />
        <Olympus />
        <Ithaca />
        <Islets />
        <Route />
        <Ship />
        <Dolphins />
        <SeaNames />
        <Effects />
        <FogRig />
      </Suspense>
      <CameraRig />
      <Ticker />
    </Canvas>
  )
}
