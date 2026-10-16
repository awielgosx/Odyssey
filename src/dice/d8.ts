import * as THREE from 'three'
import { drawMeander } from '../world/textures'
import { PAL } from '../world/palette'

export interface DieFace {
  label: string // what is painted on the face
  value: number | 'C' // direction number, or C for the Contributions wildcard
  normal: THREE.Vector3 // in die-local space
}

const SIGNS: [number, number, number][] = [
  [1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1],
  [1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1],
]

export function buildD8(values: (number | 'C')[], style: 'black-figure' | 'red-figure', size = 0.62) {
  const positions: number[] = []
  const uvs: number[] = []
  const geo = new THREE.BufferGeometry()
  const faces: DieFace[] = []
  SIGNS.forEach(([sx, sy, sz], i) => {
    const a = new THREE.Vector3(0, sy * size, 0) // apex on the Y axis
    let b = new THREE.Vector3(sx * size, 0, 0)
    let c = new THREE.Vector3(0, 0, sz * size)
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a))
    const out = new THREE.Vector3(sx, sy, sz)
    if (n.dot(out) < 0) [b, c] = [c, b]
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
    uvs.push(0.5, 0.94, 0.04, 0.12, 0.96, 0.12)
    geo.addGroup(i * 3, 3, i)
    faces.push({ value: values[i], label: values[i] === 'C' ? 'C' : String(values[i]), normal: out.normalize() })
  })
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.computeVertexNormals()
  const materials = faces.map((f) => new THREE.MeshStandardMaterial({ map: faceTexture(f.value, style), roughness: 0.42, metalness: 0.05 }))
  return { geo, materials, faces }
}

function faceTexture(value: number | 'C', style: 'black-figure' | 'red-figure') {
  const s = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = s
  const c = canvas.getContext('2d')!
  const bg = style === 'black-figure' ? PAL.clay : PAL.glaze
  const fg = style === 'black-figure' ? PAL.glaze : PAL.clayLight
  c.fillStyle = bg
  c.fillRect(0, 0, s, s)
  // border band along the triangle edge
  c.strokeStyle = fg
  c.lineWidth = 10
  c.beginPath()
  c.moveTo(s * 0.5, s * 0.1)
  c.lineTo(s * 0.1, s * 0.84)
  c.lineTo(s * 0.9, s * 0.84)
  c.closePath()
  c.stroke()
  c.save()
  c.beginPath()
  c.moveTo(s * 0.5, s * 0.1)
  c.lineTo(s * 0.1, s * 0.84)
  c.lineTo(s * 0.9, s * 0.84)
  c.closePath()
  c.clip()
  drawMeander(c, 0, s * 0.73, s, s * 0.08, fg)
  c.restore()
  if (value === 'C') {
    // the doughnut: the Contributions wildcard
    c.strokeStyle = PAL.olive
    c.lineWidth = 22
    c.beginPath()
    c.arc(s / 2, s * 0.5, 38, 0, Math.PI * 2)
    c.stroke()
    c.strokeStyle = PAL.gold
    c.lineWidth = 6
    c.beginPath()
    c.arc(s / 2, s * 0.5, 38, 0, Math.PI * 2)
    c.stroke()
  } else {
    c.fillStyle = fg
    c.font = `${value >= 10 ? 84 : 100}px Marcellus, Georgia, serif`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(String(value), s / 2, s * 0.53)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function topFace(faces: DieFace[], q: THREE.Quaternion) {
  let best = faces[0]
  let bestY = -Infinity
  const v = new THREE.Vector3()
  for (const f of faces) {
    v.copy(f.normal).applyQuaternion(q)
    if (v.y > bestY) {
      bestY = v.y
      best = f
    }
  }
  return best
}
