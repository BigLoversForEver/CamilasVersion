export const GROWTH_DURATION_MS = 28_000
export const GARDEN_STAGES = Object.freeze([
  Object.freeze({ id: 'seed', position: 0, threshold: 0 }),
  Object.freeze({ id: 'sprout', position: 0.32, threshold: 0.2 }),
  Object.freeze({ id: 'growing', position: 0.62, threshold: 0.47 }),
  Object.freeze({ id: 'bloom', position: 1, threshold: 0.78 }),
])

/** Aggregate: owns growth, playback and valid stage transitions. No browser dependencies. */
export class Garden {
  #progress = 0
  #playing = false

  get snapshot() {
    return Object.freeze({
      progress: this.#progress,
      playing: this.#playing,
      complete: this.#progress === 1,
      stageIndex: GARDEN_STAGES.findLastIndex((stage) => this.#progress >= stage.threshold),
    })
  }

  plant() {
    this.#progress = 0
    this.#playing = true
  }
  pause() {
    this.#playing = false
  }
  resume() {
    if (this.#progress < 1) this.#playing = true
  }
  finish() {
    this.#progress = 1
    this.#playing = false
  }

  selectStage(index) {
    const stage = GARDEN_STAGES[index]
    if (!Number.isInteger(index) || !stage) throw new RangeError('Unknown garden stage')
    this.#progress = stage.position
    this.#playing = false
  }

  advance(elapsedMs) {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Invalid elapsed time')
    if (!this.#playing) return
    this.#progress = Math.min(1, this.#progress + elapsedMs / GROWTH_DURATION_MS)
    if (this.#progress === 1) this.#playing = false
  }
}
