import * as THREE from 'three'
import { PAL } from './palette'

const cache = new Map<string, THREE.Texture>()

function make(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

// A running Greek key along a strip.
export function drawMeander(ctx: CanvasRenderingContext2D, x0: number, y0: number, width: number, height: number, color: string) {
  const u = height / 6
  ctx.strokeStyle = color
  ctx.lineWidth = u * 0.9
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'square'
  ctx.beginPath()
  ctx.moveTo(x0, y0 + 5.5 * u)
  ctx.lineTo(x0 + width, y0 + 5.5 * u)
  ctx.stroke()
  for (let ox = x0; ox < x0 + width; ox += 6 * u) {
    ctx.beginPath()
    ctx.moveTo(ox + u * 0.5, y0 + 5.5 * u)
    ctx.lineTo(ox + u * 0.5, y0 + 0.5 * u)
    ctx.lineTo(ox + 5 * u, y0 + 0.5 * u)
    ctx.lineTo(ox + 5 * u, y0 + 4 * u)
    ctx.lineTo(ox + 2.5 * u, y0 + 4 * u)
    ctx.lineTo(ox + 2.5 * u, y0 + 2.4 * u)
    ctx.stroke()
  }
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  const img = ctx.getImageData(0, 0, w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * alpha
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

// Cliff band: clay with a black-figure meander frieze.
export const cliffTexture = () =>
  make('cliff', 1024, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, PAL.clayLight)
    g.addColorStop(1, PAL.clay)
    c.fillStyle = g
    c.fillRect(0, 0, 1024, 256)
    c.fillStyle = PAL.glaze
    c.fillRect(0, 70, 1024, 6)
    c.fillRect(0, 184, 1024, 6)
    drawMeander(c, 0, 92, 1024, 78, PAL.glaze)
    c.fillStyle = PAL.glaze
    c.fillRect(0, 230, 1024, 26)
    grain(c, 1024, 256, 0.06)
  })

// Three sails, one per ship style. The black ship carries the apotropaic eye painted on Greek
// ships and cups, the red one Athena's owl, the blue one a leaping dolphin.
export const sailTexture = (style: 'black' | 'owl' | 'dolphin' = 'black') =>
  make(`sail-${style}`, 512, 512, (c) => {
    if (style === 'dolphin') {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? PAL.marble : '#2f6f9a'
        c.fillRect(i * 64, 0, 64, 512)
      }
      c.fillStyle = PAL.marble
      c.beginPath()
      c.arc(256, 256, 150, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = PAL.glaze
      c.save()
      c.translate(256, 262)
      c.beginPath()
      c.moveTo(-120, 30)
      c.quadraticCurveTo(-40, -110, 90, -40)
      c.lineTo(125, -55)
      c.lineTo(108, -22)
      c.quadraticCurveTo(40, 30, -60, 40)
      c.lineTo(-95, 85)
      c.lineTo(-92, 42)
      c.closePath()
      c.fill()
      c.beginPath()
      c.moveTo(-10, -62)
      c.lineTo(10, -112)
      c.lineTo(30, -55)
      c.closePath()
      c.fill()
      c.restore()
      grain(c, 512, 512, 0.05)
      return
    }
    const owl = style === 'owl'
    c.fillStyle = owl ? PAL.clay : PAL.marble
    c.fillRect(0, 0, 512, 512)
    c.fillStyle = owl ? PAL.glaze : PAL.clay
    c.fillRect(0, 0, 512, 70)
    c.fillRect(0, 442, 512, 70)
    drawMeander(c, 0, 12, 512, 46, owl ? PAL.clay : PAL.glaze)
    drawMeander(c, 0, 454, 512, 46, owl ? PAL.clay : PAL.glaze)
    c.save()
    c.translate(256, 256)
    if (owl) {
      c.fillStyle = PAL.glaze
      c.beginPath()
      c.ellipse(0, 30, 95, 125, 0, 0, Math.PI * 2)
      c.fill()
      c.beginPath()
      c.moveTo(-85, -70)
      c.lineTo(-70, -135)
      c.lineTo(-30, -85)
      c.moveTo(85, -70)
      c.lineTo(70, -135)
      c.lineTo(30, -85)
      c.fill()
      for (const x of [-40, 40]) {
        c.fillStyle = PAL.ochre
        c.beginPath()
        c.arc(x, -30, 34, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = PAL.glaze
        c.beginPath()
        c.arc(x, -30, 14, 0, Math.PI * 2)
        c.fill()
      }
      c.fillStyle = PAL.ochre
      c.beginPath()
      c.moveTo(-10, 0)
      c.lineTo(10, 0)
      c.lineTo(0, 22)
      c.fill()
    } else {
      c.fillStyle = PAL.glaze
      c.beginPath()
      c.ellipse(0, 0, 150, 78, 0, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = PAL.marble
      c.beginPath()
      c.ellipse(0, 0, 128, 60, 0, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = PAL.clay
      c.beginPath()
      c.arc(0, 0, 50, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = PAL.glaze
      c.beginPath()
      c.arc(0, 0, 26, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
    grain(c, 512, 512, 0.05)
  })

// Amphora body: clay with a black band and meander.
export const potteryTexture = () =>
  make('pottery', 512, 256, (c) => {
    c.fillStyle = PAL.clay
    c.fillRect(0, 0, 512, 256)
    c.fillStyle = PAL.glaze
    c.fillRect(0, 0, 512, 60)
    c.fillRect(0, 200, 512, 56)
    drawMeander(c, 0, 92, 512, 60, PAL.glaze)
  })
