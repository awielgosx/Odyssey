import { CameraControls, Text } from '@react-three/drei'
import marcellus from '@fontsource/marcellus/files/marcellus-latin-400-normal.woff?url'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette, HueSaturation, BrightnessContrast } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store'
import { Island, Olympus } from './Island'
import { ISLANDS, islandByKey } from './layout'
import { Ocean } from './Ocean'
import { PAL } from './palette'
import { Ship, shipState } from './Ship'

const SUN_DIR = new THREE.Vector3(-0.55, 0.32, -0.62).normalize()
const FOG = { color: '#efc29a', near: 150, far: 340 }

function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new THREE.Color(PAL.skyHigh) },
          uMid: { value: new THREE.Color('#e9a77e') },
          uHorizon: { value: new THREE.Color('#ffd9a6') },
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
    <mesh material={mat} scale={380}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}

function Clouds() {
  const group = useRef<THREE.Group>(null)
  const puffs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + i
        const d = 190 + (i % 4) * 25
        return { p: new THREE.Vector3(Math.cos(a) * d, 28 + (i % 3) * 9, Math.sin(a) * d), s: 9 + (i % 5) * 3 }
      }),
    [],
  )
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.004
  })
  return (
    <group ref={group}>
      {puffs.map((c, i) => (
        <group key={i} position={c.p} scale={c.s}>
          {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.75], [-1.0, -0.25, -0.1, 0.7], [0.3, 0.45, 0, 0.6]].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#fff1e0" flatShading roughness={1} emissive="#f6b885" emissiveIntensity={0.25} />
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
    // keep the shadow frustum centred on the ship
    const l = sun.current
    if (!l) return
    l.position.copy(shipState.pos).addScaledVector(SUN_DIR, 80)
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
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={200}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />
      <directionalLight color="#7fb4d8" intensity={0.5} position={[40, 30, 60]} />
    </>
  )
}

function SeaNames() {
  // Lettering painted on the sea, like an old chart.
  const common = { font: marcellus, fontSize: 3.2, color: PAL.marble, fillOpacity: 0.78, anchorX: 'center' as const, anchorY: 'middle' as const, letterSpacing: 0.06 }
  return (
    <>
      <Text {...common} position={[-53, 0.6, 8]} rotation={[-Math.PI / 2, 0, Math.PI / 2.35]}>
        Sea of the Value Proposition
      </Text>
      <Text {...common} position={[53, 0.6, 8]} rotation={[-Math.PI / 2, 0, -Math.PI / 2.35]}>
        Sea of the Value Architecture
      </Text>
    </>
  )
}

function CameraRig() {
  const controls = useRef<CameraControls>(null)
  useEffect(() => {
    controls.current?.setLookAt(34, 62, 104, 0, 0, 14, false)
    if (import.meta.env.DEV) (window as unknown as { __cam: unknown }).__cam = controls.current
  }, [])
  const sailing = useGame((s) => s.sailing)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const c = controls.current
    if (!c || !sailing) return
    c.getTarget(tmp)
    tmp.lerp(shipState.pos, 0.06)
    c.moveTo(tmp.x, 0, tmp.z, false)
  })
  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={12}
      maxDistance={120}
      minPolarAngle={0.35}
      maxPolarAngle={1.25}
      smoothTime={0.6}
    />
  )
}

function Effects() {
  const quality = useGame((s) => s.quality)
  if (quality === 'low') return null
  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={2.2} intensity={2.2} distanceFalloff={1.2} halfRes />
      <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} mipmapBlur />
      <HueSaturation saturation={0.12} />
      <BrightnessContrast contrast={0.06} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.28} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  )
}

export function World() {
  const quality = useGame((s) => s.quality)
  const diceOpen = useGame((s) => s.diceOpen)
  const start = islandByKey('ithaca')
  return (
    <Canvas
      frameloop={diceOpen ? 'never' : 'always'}
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 2] : 1}
      gl={{ antialias: quality === 'low', toneMapping: quality === 'low' ? THREE.AgXToneMapping : THREE.NoToneMapping }}
      camera={{ position: [start.x + 26, 30, start.z + 46], fov: 38, near: 0.5, far: 900 }}
    >
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <Suspense fallback={null}>
        <SkyDome />
        <Clouds />
        <Lights />
        <Ocean sunDir={SUN_DIR} fogColor={FOG.color} fogNear={FOG.near} fogFar={FOG.far} />
        {ISLANDS.map((spot) =>
          spot.key === 'olympus' ? <Olympus key={spot.key} spot={spot} /> : <Island key={spot.key} spot={spot} />,
        )}
        <Ship />
        <SeaNames />
        <Effects />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
