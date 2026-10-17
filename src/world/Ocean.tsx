import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { allCoasts, MAP_BOUNDS, pointInPoly } from './layout'
import { PAL } from './palette'

// A signed distance field to every coastline, baked once on the CPU.
// The shader uses it for shallow water and foam that hug the real shapes.
const SDF = { minX: MAP_BOUNDS.minX - 20, minZ: MAP_BOUNDS.minZ - 20, sizeX: MAP_BOUNDS.maxX - MAP_BOUNDS.minX + 40, sizeZ: MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ + 40, res: 1.25 }
const D_MIN = -4
const D_MAX = 14

function bakeShoreField() {
  const w = Math.ceil(SDF.sizeX / SDF.res)
  const h = Math.ceil(SDF.sizeZ / SDF.res)
  const dist = new Float32Array(w * h).fill(D_MAX)
  const p = new THREE.Vector2()
  for (const c of allCoasts()) {
    const reach = c.poly.reduce((m, q) => Math.max(m, q.length()), 0) + D_MAX
    const i0 = Math.max(0, Math.floor((c.x - reach - SDF.minX) / SDF.res))
    const i1 = Math.min(w - 1, Math.ceil((c.x + reach - SDF.minX) / SDF.res))
    const j0 = Math.max(0, Math.floor((c.z - reach - SDF.minZ) / SDF.res))
    const j1 = Math.min(h - 1, Math.ceil((c.z + reach - SDF.minZ) / SDF.res))
    const poly = c.poly
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        p.set(SDF.minX + i * SDF.res - c.x, SDF.minZ + j * SDF.res - c.z)
        let best = Infinity
        for (let k = 0; k < poly.length; k++) {
          const a = poly[k]
          const b = poly[(k + 1) % poly.length]
          const abx = b.x - a.x
          const aby = b.y - a.y
          const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / (abx * abx + aby * aby)))
          const dx = a.x + abx * t - p.x
          const dy = a.y + aby * t - p.y
          best = Math.min(best, dx * dx + dy * dy)
        }
        let d = Math.sqrt(best)
        if (pointInPoly(p, poly)) d = -d
        const idx = j * w + i
        dist[idx] = Math.min(dist[idx], d)
      }
    }
  }
  const data = new Uint8Array(w * h)
  for (let i = 0; i < data.length; i++) data[i] = Math.round(((Math.max(D_MIN, Math.min(D_MAX, dist[i])) - D_MIN) / (D_MAX - D_MIN)) * 255)
  const tex = new THREE.DataTexture(data, w, h, THREE.RedFormat, THREE.UnsignedByteType)
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

const vert = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
float wave(vec2 p, vec2 dir, float freq, float speed, float amp) {
  return sin(dot(p, dir) * freq + uTime * speed) * amp;
}
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec2 p = world.xz;
  float h = wave(p, normalize(vec2(1.0, 0.3)), 0.32, 1.1, 0.22)
          + wave(p, normalize(vec2(-0.4, 1.0)), 0.55, 1.6, 0.12)
          + wave(p, normalize(vec2(0.8, -0.7)), 0.9, 2.3, 0.06);
  world.y += h;
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const frag = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uSky;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uTime;
uniform sampler2D uShore;
uniform vec4 uShoreRect; // minX, minZ, sizeX, sizeZ
uniform vec2 uShoreRange;
varying vec3 vWorld;

void main() {
  // faceted normal: the low-poly look. Guard against degenerate derivatives,
  // which produce NaN far away and spread as black blobs through bloom.
  vec3 c = cross(dFdx(vWorld), dFdy(vWorld));
  float cl = length(c);
  vec3 n = cl > 1e-8 ? c / cl : vec3(0.0, 1.0, 0.0);
  if (n.y < 0.0) n = -n;
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);

  vec2 suv = (vWorld.xz - uShoreRect.xy) / uShoreRect.zw;
  float shore = uShoreRange.y;
  if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) {
    shore = mix(uShoreRange.x, uShoreRange.y, texture2D(uShore, suv).r);
  }

  float shallow = 1.0 - smoothstep(0.0, 8.0, shore);
  float hm = mix(smoothstep(-0.2, 0.25, vWorld.y), 0.45, smoothstep(70.0, 200.0, dist));
  vec3 base = mix(uDeep, uMid, hm);
  base = mix(base, uShallow, shallow * 0.85);

  float diff = max(dot(n, uSunDir), 0.0);
  float facet = mix(0.35, 0.05, smoothstep(30.0, 130.0, dist));
  vec3 col = base * (0.86 + facet * (diff - 0.5) * 2.0);

  vec3 sn = normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.88));
  float fres = pow(1.0 - clamp(dot(sn, viewDir), 0.0, 1.0), 5.0);
  col = mix(col, uSky, fres * 0.3 * (1.0 - smoothstep(120.0, 240.0, cameraPosition.y)));
  vec3 h = normalize(uSunDir + viewDir);
  float spec = pow(max(dot(sn, h), 0.0), 160.0);
  col += uSunColor * spec * 0.7;

  // smoothstep needs edge0 < edge1 (reversed edges are undefined and give NaN on Apple GPUs)
  float ring = (1.0 - smoothstep(0.0, 1.2, shore)) + (sin(shore * 3.2 - uTime * 2.0) * 0.5 + 0.5) * (1.0 - smoothstep(0.5, 3.2, shore)) * 0.45;
  col = mix(col, uFoam, clamp(ring, 0.0, 1.0) * 0.85);

  float fog = clamp((dist - uFogNear) / max(uFogFar - uFogNear, 1.0), 0.0, 1.0);
  fog = fog * fog * (3.0 - 2.0 * fog);
  col = mix(col, uFogColor, fog);
  col = clamp(col, 0.0, 4.0);
  // last line of defence: a NaN here would be smeared into a black blob by Bloom
  if (any(isnan(col)) || any(isinf(col))) col = mix(uMid, uFogColor, fog);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export function Ocean({ sunDir, fogColor, fog }: { sunDir: THREE.Vector3; fogColor: string; fog: { near: number; far: number } }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const shore = useMemo(() => bakeShoreField(), [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(PAL.aegeanDeep) },
      uMid: { value: new THREE.Color(PAL.aegeanMid) },
      uShallow: { value: new THREE.Color(PAL.aegeanShallow) },
      uFoam: { value: new THREE.Color(PAL.foam) },
      uSky: { value: new THREE.Color(PAL.sky) },
      uSunDir: { value: sunDir.clone().normalize() },
      uSunColor: { value: new THREE.Color(PAL.sun) },
      uFogColor: { value: new THREE.Color(fogColor) },
      uFogNear: { value: fog.near },
      uFogFar: { value: fog.far },
      uShore: { value: shore },
      uShoreRect: { value: new THREE.Vector4(SDF.minX, SDF.minZ, SDF.sizeX, SDF.sizeZ) },
      uShoreRange: { value: new THREE.Vector2(D_MIN, D_MAX) },
    }),
    [sunDir, fogColor, fog, shore],
  )
  useFrame((_, dt) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value += dt
    mat.current.uniforms.uFogNear.value = fog.near
    mat.current.uniforms.uFogFar.value = fog.far
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[620, 360, 210, 122]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  )
}
