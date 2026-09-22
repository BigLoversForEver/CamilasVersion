// Original, repeating ambient arrangement. All audio is generated locally,
// scheduled against the audio clock, and starts only after a user gesture.
const BEAT_SECONDS = 60 / 72
const HARMONIES = [
  [48, 55, 59, 64],
  [45, 52, 55, 60],
  [41, 48, 52, 57],
  [43, 50, 55, 59],
]
const MELODY = [
  [0, 76, 1.5],
  [2, 79, 1],
  [3.5, 74, 1.5],
  [5, 72, 2],
  [7, 71, 1],
  [8, 72, 1.5],
  [10, 76, 2],
  [12.5, 74, 1],
  [14, 72, 2],
  [16, 69, 2],
  [18.5, 72, 1],
  [20, 76, 2],
  [23, 74, 1],
  [24, 71, 1.5],
  [26, 67, 2],
  [28, 69, 1],
  [29.5, 71, 1],
  [31, 72, 2.5],
]
const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12)

export class GardenAudio {
  #context
  #master
  #instrument
  #reverb
  #enabled = false
  #disposed = false
  #volume = 0.4
  #timer
  #nextBeat = 0
  #beatIndex = 0
  #sources = new Set()
  #visibilityChanged = () => {
    if (!this.#context || this.#disposed) return
    if (document.hidden) {
      clearInterval(this.#timer)
      this.#context.suspend().catch(() => {})
    } else if (this.#enabled) {
      this.#context
        .resume()
        .then(() => {
          if (this.#enabled && !this.#disposed) this.#startScheduler()
        })
        .catch(() => {})
    }
  }

  constructor() {
    document.addEventListener('visibilitychange', this.#visibilityChanged)
  }

  setVolume(percent) {
    if (!Number.isFinite(percent)) return
    this.#volume = Math.max(0, Math.min(100, percent)) / 100
    if (this.#master && this.#enabled)
      this.#master.gain.setTargetAtTime(this.#volume * 0.65, this.#context.currentTime, 0.06)
  }

  #initialize() {
    this.#context = new (window.AudioContext || window.webkitAudioContext)()
    const context = this.#context
    this.#master = context.createGain()
    this.#master.gain.value = 0
    this.#master.connect(context.destination)
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 3
    compressor.connect(this.#master)
    this.#instrument = context.createGain()
    this.#instrument.gain.value = 0.8
    this.#instrument.connect(compressor)

    // A short stereo room softens the plucked notes without a continuous drone.
    this.#reverb = context.createConvolver()
    const impulse = context.createBuffer(
      2,
      Math.floor(context.sampleRate * 2.4),
      context.sampleRate,
    )
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel)
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3 * 0.35
    }
    this.#reverb.buffer = impulse
    const wet = context.createGain()
    wet.gain.value = 0.24
    this.#instrument.connect(this.#reverb)
    this.#reverb.connect(wet)
    wet.connect(compressor)
    this.#createBreeze()
  }

  #track(source, cleanup) {
    this.#sources.add(source)
    source.onended = () => {
      this.#sources.delete(source)
      source.disconnect()
      cleanup?.()
    }
  }

  #note(midi, time, duration, velocity = 0.1, pan = 0) {
    const context = this.#context
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0, time)
    envelope.gain.linearRampToValueAtTime(velocity, time + 0.012)
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    const stereo = context.createStereoPanner()
    stereo.pan.value = pan
    envelope.connect(stereo)
    stereo.connect(this.#instrument)
    let remaining = 3
    for (const [multiple, level] of [
      [1, 1],
      [2, 0.18],
      [3, 0.035],
    ]) {
      const oscillator = context.createOscillator()
      const harmonic = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency(midi) * multiple
      harmonic.gain.value = level
      oscillator.connect(harmonic)
      harmonic.connect(envelope)
      this.#track(oscillator, () => {
        harmonic.disconnect()
        if (--remaining === 0) {
          envelope.disconnect()
          stereo.disconnect()
        }
      })
      oscillator.start(time)
      oscillator.stop(time + duration + 0.05)
    }
  }

  #bird(time) {
    for (let chirp = 0; chirp < 3; chirp++) {
      const start = time + chirp * 0.17
      const oscillator = this.#context.createOscillator()
      const gain = this.#context.createGain()
      const pan = this.#context.createStereoPanner()
      pan.pan.value = this.#beatIndex % 2 ? -0.7 : 0.65
      oscillator.frequency.setValueAtTime(2100 + chirp * 150, start)
      oscillator.frequency.exponentialRampToValueAtTime(3200, start + 0.065)
      oscillator.frequency.exponentialRampToValueAtTime(2400, start + 0.13)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.009, start + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14)
      oscillator.connect(gain)
      gain.connect(pan)
      pan.connect(this.#instrument)
      this.#track(oscillator, () => {
        gain.disconnect()
        pan.disconnect()
      })
      oscillator.start(start)
      oscillator.stop(start + 0.16)
    }
  }

  #createBreeze() {
    const context = this.#context
    const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
    const data = buffer.getChannelData(0)
    let previous = 0
    for (let i = 0; i < data.length; i++) {
      previous = (previous + (Math.random() * 2 - 1) * 0.015) / 1.015
      data[i] = previous * 2
    }
    const breeze = context.createBufferSource()
    breeze.buffer = buffer
    breeze.loop = true
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 550
    const gain = context.createGain()
    gain.gain.value = 0.045
    breeze.connect(filter)
    filter.connect(gain)
    gain.connect(this.#master)
    this.#track(breeze, () => {
      filter.disconnect()
      gain.disconnect()
    })
    breeze.start()
  }

  #schedule = () => {
    if (!this.#enabled || this.#disposed || document.hidden) return
    const now = this.#context.currentTime
    // A suspended or throttled browser must never schedule a backlog of notes.
    if (this.#nextBeat < now) this.#nextBeat = now + 0.05
    while (this.#nextBeat < now + 0.2) {
      const step = this.#beatIndex % 64
      const beat = step / 2
      const chord = HARMONIES[Math.floor(beat / 8)]
      if (step % 4 === 0) {
        const arpeggio = [0, 2, 1, 3][Math.floor(beat / 2) % 4]
        this.#note(chord[arpeggio] + 12, this.#nextBeat, 3.4, 0.075, -0.22)
      }
      if (step % 16 === 0) this.#note(chord[0], this.#nextBeat, 5, 0.1, -0.08)
      const note = MELODY.find(([at]) => at === beat)
      if (note) this.#note(note[1], this.#nextBeat, note[2] * BEAT_SECONDS + 1.2, 0.12, 0.18)
      if (step === 13 || step === 47) this.#bird(this.#nextBeat)
      this.#beatIndex++
      this.#nextBeat += BEAT_SECONDS / 2
    }
  }

  #startScheduler() {
    clearInterval(this.#timer)
    this.#schedule()
    this.#timer = setInterval(this.#schedule, 80)
  }

  async toggle() {
    if (this.#disposed) return false
    if (!this.#context) this.#initialize()
    if (this.#enabled) {
      this.#enabled = false
      clearInterval(this.#timer)
      this.#master.gain.cancelScheduledValues(this.#context.currentTime)
      this.#master.gain.setValueAtTime(0, this.#context.currentTime)
      await this.#context.suspend()
    } else {
      await this.#context.resume()
      if (this.#disposed) return false
      this.#enabled = true
      this.#master.gain.setTargetAtTime(this.#volume * 0.65, this.#context.currentTime, 0.12)
      this.#startScheduler()
    }
    return this.#enabled
  }

  dispose() {
    this.#disposed = true
    clearInterval(this.#timer)
    document.removeEventListener('visibilitychange', this.#visibilityChanged)
    for (const source of this.#sources) {
      source.onended = null
      source.stop()
      source.disconnect()
    }
    this.#sources.clear()
    this.#context?.close().catch(() => {})
  }
}
