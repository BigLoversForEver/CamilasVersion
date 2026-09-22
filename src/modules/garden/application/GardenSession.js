import { Garden } from '../domain/Garden.js'

/** Use cases for one visit. The garden is ephemeral; no persistence is needed. */
export class GardenSession {
  #garden = new Garden()
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion
  }
  get snapshot() {
    return this.#garden.snapshot
  }
  plant() {
    this.#garden.plant()
    if (this.reducedMotion) this.#garden.finish()
  }
  togglePlayback() {
    if (this.snapshot.playing) this.#garden.pause()
    else if (this.snapshot.complete) this.plant()
    else if (this.reducedMotion) this.#garden.finish()
    else this.#garden.resume()
  }
  primaryAction() {
    if (this.snapshot.complete || (this.snapshot.progress === 0 && !this.snapshot.playing))
      this.plant()
    else this.togglePlayback()
  }
  selectStage(index) {
    this.#garden.selectStage(index)
  }
  advance(elapsedMs) {
    this.#garden.advance(elapsedMs)
  }
}
