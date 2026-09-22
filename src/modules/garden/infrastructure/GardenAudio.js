export class GardenAudio {
  #context
  #master
  #enabled = false
  #disposed = false
  #visibilityChanged = () => {
    if (!this.#context) return
    const action =
      document.hidden || !this.#enabled ? this.#context.suspend() : this.#context.resume()
    action.catch(() => {})
  }

  constructor() {
    document.addEventListener('visibilitychange', this.#visibilityChanged)
  }

  async toggle() {
    if (this.#disposed) return false
    if (!this.#context) {
      this.#context = new (window.AudioContext || window.webkitAudioContext)()
      this.#master = this.#context.createGain()
      this.#master.gain.value = 0
      this.#master.connect(this.#context.destination)
      ;[261.63, 329.63, 392, 523.25].forEach((frequency, index) => {
        const oscillator = this.#context.createOscillator()
        const gain = this.#context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        gain.gain.value = 0.024 / (1 + index * 0.3)
        oscillator.connect(gain)
        gain.connect(this.#master)
        oscillator.start()
      })
    }
    await this.#context.resume()
    if (this.#disposed) return false
    this.#enabled = !this.#enabled
    this.#master.gain.setTargetAtTime(this.#enabled ? 1 : 0, this.#context.currentTime, 0.4)
    return this.#enabled
  }

  dispose() {
    this.#disposed = true
    document.removeEventListener('visibilitychange', this.#visibilityChanged)
    this.#context?.close().catch(() => {})
  }
}
