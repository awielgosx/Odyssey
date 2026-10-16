// Procedural sound, all synthesised with the Web Audio API: no audio files, nothing to license.
// Ocean, wind, gulls, oars, a Karplus-Strong lyre playing in the Dorian harmonia, sirens and thunder.

type Ctx = AudioContext

// Dorian harmonia, Pythagorean tuning, mese A = 220 Hz (E-D-C-B | A-G-F-E descending)
const SCALE = [165.0, 173.8, 195.6, 220.0, 247.5, 260.7, 293.3, 330.0, 347.6, 391.1, 440.0]

class Engine {
  ctx: Ctx | null = null
  master!: GainNode
  wax!: BiquadFilterNode
  amb!: GainNode
  music!: GainNode
  sfx!: GainNode
  noise!: AudioBuffer
  plucks = new Map<number, AudioBuffer>()
  started = false
  muted = false
  windGain!: GainNode
  windFilter!: BiquadFilterNode
  sirenGain: GainNode | null = null
  timers: number[] = []
  sailing = false
  musicOn = true

  init() {
    if (this.ctx) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    this.ctx = ctx
    try {
      ;(navigator as unknown as { audioSession?: { type: string } }).audioSession!.type = 'playback'
    } catch {
      /* not supported */
    }
    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.9
    this.wax = ctx.createBiquadFilter()
    this.wax.type = 'lowpass'
    this.wax.frequency.value = 20000
    const comp = ctx.createDynamicsCompressor()
    this.master.connect(this.wax).connect(comp).connect(ctx.destination)
    this.amb = this.bus(0.5)
    this.music = this.bus(0.32)
    this.sfx = this.bus(0.7)
    // shared 4 s white noise
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = this.noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    // body resonance for the lyre
    SCALE.forEach((f) => this.plucks.set(f, this.renderPluck(f)))
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) this.ctx.suspend()
      else if (!this.muted) this.ctx.resume()
    })
  }

  bus(gain: number) {
    const g = this.ctx!.createGain()
    g.gain.value = gain
    g.connect(this.master)
    return g
  }

  // Karplus-Strong rendered once per note into a buffer (feedback DelayNodes can't go below 128 samples).
  renderPluck(freq: number, seconds = 2.2) {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const N = Math.round(sr / freq)
    const buf = ctx.createBuffer(1, Math.floor(sr * seconds), sr)
    const out = buf.getChannelData(0)
    let prev = 0
    for (let i = 0; i < out.length; i++) {
      if (i < N) {
        const r = Math.random() * 2 - 1
        prev = prev * 0.5 + r * 0.5 // low-passed excitation: a softer, gut-string pluck
        out[i] = prev
      } else {
        out[i] = 0.996 * 0.5 * (out[i - N] + out[i - N - 1])
      }
    }
    return buf
  }

  noiseSource(loop = false) {
    const s = this.ctx!.createBufferSource()
    s.buffer = this.noise
    s.loop = loop
    return s
  }

  start() {
    this.init()
    const ctx = this.ctx
    if (!ctx) return
    if (ctx.state === 'suspended' && !this.muted) ctx.resume()
    if (this.started) return
    this.started = true
    this.startOcean()
    this.startWind()
    this.schedule(() => this.breaker(), 6000, 11000)
    this.schedule(() => this.gulls(), 9000, 24000)
    this.schedule(() => this.phrase(), 7000, 13000)
    this.startDrone()
  }

  schedule(fn: () => void, min: number, max: number) {
    const loop = () => {
      const id = window.setTimeout(() => {
        if (!this.muted && this.ctx?.state === 'running') fn()
        loop()
      }, min + Math.random() * (max - min))
      this.timers.push(id)
    }
    loop()
  }

  startOcean() {
    const ctx = this.ctx!
    const src = this.noiseSource(true)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 500
    lp.Q.value = 0.7
    const g = ctx.createGain()
    g.gain.value = 0.3
    const lfo1 = ctx.createOscillator()
    lfo1.frequency.value = 0.09
    const lfo1g = ctx.createGain()
    lfo1g.gain.value = 250
    lfo1.connect(lfo1g).connect(lp.frequency)
    const lfo2 = ctx.createOscillator()
    lfo2.frequency.value = 0.07
    const lfo2g = ctx.createGain()
    lfo2g.gain.value = 0.12
    lfo2.connect(lfo2g).connect(g.gain)
    src.connect(lp).connect(g).connect(this.amb)
    src.start(0, Math.random() * 3)
    lfo1.start()
    lfo2.start()
  }

  breaker() {
    const ctx = this.ctx!
    const t = ctx.currentTime
    const src = this.noiseSource()
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 0.8
    bp.frequency.setValueAtTime(2500, t)
    bp.frequency.exponentialRampToValueAtTime(600, t + 2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.18, t + 0.8)
    g.gain.setTargetAtTime(0, t + 0.8, 1.0)
    src.connect(bp).connect(g).connect(this.amb)
    src.start(t, Math.random() * 2, 3.5)
  }

  startWind() {
    const ctx = this.ctx!
    const src = this.noiseSource(true)
    this.windFilter = ctx.createBiquadFilter()
    this.windFilter.type = 'bandpass'
    this.windFilter.Q.value = 6
    this.windFilter.frequency.value = 400
    this.windGain = ctx.createGain()
    this.windGain.gain.value = 0.05
    const pan = ctx.createStereoPanner()
    src.connect(this.windFilter).connect(this.windGain).connect(pan).connect(this.amb)
    src.start(0, 1.3)
    window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return
      const now = this.ctx.currentTime
      this.windFilter.frequency.setTargetAtTime(300 + Math.random() * 600, now, 0.4)
      this.windGain.gain.setTargetAtTime(0.03 + Math.random() * 0.06 + (this.sailing ? 0.03 : 0), now, 0.5)
      pan.pan.setTargetAtTime(Math.sin(now * 0.1) * 0.6, now, 1)
    }, 300)
  }

  storm(on: boolean) {
    if (!this.ctx) return
    this.windGain.gain.setTargetAtTime(on ? 0.22 : 0.05, this.ctx.currentTime, 0.6)
  }

  gulls() {
    const ctx = this.ctx!
    const n = 2 + Math.floor(Math.random() * 3)
    const pan = ctx.createStereoPanner()
    pan.pan.value = Math.random() * 1.6 - 0.8
    pan.connect(this.amb)
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * 0.32
      const o = ctx.createOscillator()
      o.type = 'triangle'
      const base = 1900 + Math.random() * 300
      o.frequency.setValueAtTime(base, t)
      o.frequency.linearRampToValueAtTime(base + 400, t + 0.03)
      o.frequency.exponentialRampToValueAtTime(1300, t + 0.26)
      const fm = ctx.createOscillator()
      fm.frequency.value = 35
      const fmg = ctx.createGain()
      fmg.gain.value = 60
      fm.connect(fmg).connect(o.frequency)
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1800
      bp.Q.value = 3
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.06, t + 0.02)
      g.gain.setTargetAtTime(0, t + 0.18, 0.06)
      o.connect(bp).connect(g).connect(pan)
      o.start(t)
      fm.start(t)
      o.stop(t + 0.5)
      fm.stop(t + 0.5)
    }
  }

  oar() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const src = this.noiseSource()
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 900
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2200 + Math.random() * 600
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.1, t + 0.005)
    g.gain.setTargetAtTime(0, t + 0.01, 0.08)
    src.connect(hp).connect(bp).connect(g).connect(this.sfx)
    src.start(t, Math.random() * 3, 0.4)
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(180, t)
    o.frequency.exponentialRampToValueAtTime(60, t + 0.08)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0.12, t)
    og.gain.setTargetAtTime(0, t, 0.04)
    o.connect(og).connect(this.sfx)
    o.start(t)
    o.stop(t + 0.2)
  }

  creak() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(85, t)
    o.frequency.linearRampToValueAtTime(70 + Math.random() * 30, t + 0.4)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 400
    bp.Q.value = 10
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.05, t + 0.08)
    g.gain.setTargetAtTime(0, t + 0.25, 0.08)
    o.connect(bp).connect(g).connect(this.sfx)
    o.start(t)
    o.stop(t + 0.7)
  }

  pluck(freq: number, when = 0, vel = 0.4, bus: GainNode = this.music) {
    if (!this.ctx) return
    const nearest = SCALE.reduce((a, b) => (Math.abs(b - freq) < Math.abs(a - freq) ? b : a))
    const s = this.ctx.createBufferSource()
    s.buffer = this.plucks.get(nearest)!
    s.playbackRate.value = freq / nearest
    const g = this.ctx.createGain()
    g.gain.value = vel
    s.connect(g).connect(bus)
    s.start(this.ctx.currentTime + when)
  }

  startDrone() {
    const ctx = this.ctx!
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 600
    const g = ctx.createGain()
    g.gain.value = 0.035
    ;[110, 110.5, 165].forEach((f) => {
      const o = ctx.createOscillator()
      o.frequency.value = f
      o.connect(lp)
      o.start()
    })
    lp.connect(g).connect(this.music)
  }

  // A short random-walk phrase over the scale, ending on A or E.
  phrase() {
    if (!this.musicOn) return
    let idx = 3 + Math.floor(Math.random() * 4)
    let t = 0
    const len = 5 + Math.floor(Math.random() * 4)
    for (let i = 0; i < len; i++) {
      this.pluck(SCALE[idx], t, 0.25 + Math.random() * 0.25)
      const r = Math.random()
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + (r < 0.7 ? (Math.random() < 0.5 ? -1 : 1) : r < 0.9 ? (Math.random() < 0.5 ? -2 : 2) : 3 - idx)))
      t += [0.5, 0.75, 1, 1.5][Math.floor(Math.random() * 4)] * 0.9
    }
    this.pluck(Math.random() < 0.5 ? 220 : 330, t, 0.3)
  }

  // ---------- UI sounds ----------
  click() {
    this.pluck(330, 0, 0.12, this.sfx)
  }
  submit() {
    this.pluck(220, 0, 0.25, this.sfx)
    this.pluck(330, 0.12, 0.25, this.sfx)
  }
  success() {
    ;[165, 220, 260.7, 330].forEach((f, i) => this.pluck(f, i * 0.09, 0.35, this.sfx))
  }
  laurel() {
    this.success()
    this.pluck(660, 0.42, 0.25, this.sfx)
    if (!this.ctx) return
    const t = this.ctx.currentTime + 0.4
    const src = this.noiseSource()
    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7000
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.04, t)
    g.gain.setTargetAtTime(0, t, 0.4)
    src.connect(hp).connect(g).connect(this.sfx)
    src.start(t, 0, 1.5)
  }
  wrong() {
    this.pluck(247.5, 0, 0.2, this.sfx)
    this.pluck(220, 0.16, 0.2, this.sfx)
  }

  thunder() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const crack = this.noiseSource()
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2000
    const cg = ctx.createGain()
    cg.gain.setValueAtTime(0.4, t)
    cg.gain.setTargetAtTime(0, t + 0.005, 0.03)
    crack.connect(hp).connect(cg).connect(this.sfx)
    crack.start(t, 0, 0.3)
    for (let i = 0; i < 4; i++) {
      const rt = t + 0.15 + i * (0.3 + Math.random() * 0.5)
      const r = this.noiseSource()
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 180
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, rt)
      g.gain.linearRampToValueAtTime(0.5 * Math.pow(0.6, i), rt + 0.1)
      g.gain.setTargetAtTime(0, rt + 0.1, 1.2)
      r.connect(lp).connect(g).connect(this.sfx)
      r.start(rt, Math.random() * 2, 3.5)
    }
  }

  // knucklebones tumbling on stone
  bones() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    let t = ctx.currentTime
    let gap = 0.18
    let vol = 0.25
    for (let i = 0; i < 6; i++) {
      const s = this.noiseSource()
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 2400 * (0.92 + Math.random() * 0.16)
      bp.Q.value = 12
      const g = ctx.createGain()
      g.gain.setValueAtTime(vol, t)
      g.gain.setTargetAtTime(0, t, 0.015)
      s.connect(bp).connect(g).connect(this.sfx)
      s.start(t, Math.random() * 3, 0.08)
      t += gap
      gap *= 0.62
      vol *= 0.75
    }
  }

  // Sirens: three voices, enharmonic glide, volume by proximity (0..1)
  siren(level: number) {
    if (!this.ctx) return
    const ctx = this.ctx
    if (!this.sirenGain) {
      this.sirenGain = ctx.createGain()
      this.sirenGain.gain.value = 0
      this.sirenGain.connect(this.music)
      const notes = [440, 554, 660]
      notes.forEach((f, i) => {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = f
        const vib = ctx.createOscillator()
        vib.frequency.value = 5.5
        const vg = ctx.createGain()
        vg.gain.value = 4
        vib.connect(vg).connect(o.frequency)
        const f1 = ctx.createBiquadFilter()
        f1.type = 'bandpass'
        f1.frequency.value = 800
        f1.Q.value = 8
        const f2 = ctx.createBiquadFilter()
        f2.type = 'bandpass'
        f2.frequency.value = 1150
        f2.Q.value = 8
        const g = ctx.createGain()
        g.gain.value = 0.25
        o.connect(f1).connect(g)
        o.connect(f2).connect(g)
        g.connect(this.sirenGain!)
        o.start()
        vib.start()
        window.setInterval(() => {
          const now = ctx.currentTime
          o.frequency.setTargetAtTime(f * [1, 1.06, 0.94, 1.12][Math.floor(Math.random() * 4)], now, 0.15 + i * 0.05)
        }, 1400 + i * 300)
      })
    }
    this.sirenGain.gain.setTargetAtTime(level * 0.12, ctx.currentTime, 0.4)
  }

  setMuted(m: boolean) {
    this.muted = m
    if (!this.ctx) return
    const now = this.ctx.currentTime
    this.master.gain.setTargetAtTime(m ? 0 : 0.9, now, 0.05)
    if (m) window.setTimeout(() => this.muted && this.ctx?.suspend(), 200)
    else this.ctx.resume()
  }

  setWax(on: boolean) {
    if (!this.ctx) return
    this.wax.frequency.setTargetAtTime(on ? 400 : 20000, this.ctx.currentTime, 0.2)
  }
}

export const audio = new Engine()
