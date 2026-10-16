import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ISLANDS } from './layout'
import { PAL } from './palette'

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
uniform vec4 uIslands[${ISLANDS.length}];
varying vec3 vWorld;

void main() {
  // faceted normal: the low-poly look
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (n.y < 0.0) n = -n;
  vec3 viewDir = normalize(cameraPosition - vWorld);

  // distance to nearest shore drives the shallow-water colour and foam
  float shore = 1e5;
  for (int i = 0; i < ${ISLANDS.length}; i++) {
    float d = length(vWorld.xz - uIslands[i].xy) - uIslands[i].z;
    shore = min(shore, d);
  }
  float shallow = 1.0 - smoothstep(0.0, 7.0, shore);
  vec3 base = mix(uDeep, uMid, smoothstep(-0.2, 0.25, vWorld.y));
  base = mix(base, uShallow, shallow * 0.85);

  float diff = max(dot(n, uSunDir), 0.0);
  float facet = mix(0.35, 0.05, smoothstep(30.0, 130.0, length(cameraPosition - vWorld)));
  vec3 col = base * (0.86 + facet * (diff - 0.5) * 2.0);

  // glints and sky reflection use a softened normal so the facets don't sparkle like a checkerboard
  vec3 sn = normalize(mix(n, vec3(0.0, 1.0, 0.0), 0.88));
  float fres = pow(1.0 - max(dot(sn, viewDir), 0.0), 5.0);
  col = mix(col, uSky, fres * 0.3);

  vec3 h = normalize(uSunDir + viewDir);
  float spec = pow(max(dot(sn, h), 0.0), 160.0);
  col += uSunColor * spec * 0.7;

  float ring = smoothstep(1.4, 0.0, shore) + (sin(shore * 3.2 - uTime * 2.0) * 0.5 + 0.5) * smoothstep(3.0, 0.6, shore) * 0.45;
  col = mix(col, uFoam, clamp(ring, 0.0, 1.0) * 0.85);

  float dist = length(cameraPosition - vWorld);
  float fog = smoothstep(uFogNear, uFogFar, dist);
  col = mix(col, uFogColor, fog);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export function Ocean({ sunDir, fogColor, fogNear, fogFar }: { sunDir: THREE.Vector3; fogColor: string; fogNear: number; fogFar: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
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
      uFogNear: { value: fogNear },
      uFogFar: { value: fogFar },
      uIslands: { value: ISLANDS.map((i) => new THREE.Vector4(i.x, i.z, i.radius * 1.18, 0)) },
    }),
    [sunDir, fogColor, fogNear, fogFar],
  )
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
  })
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[420, 420, 160, 160]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  )
}
