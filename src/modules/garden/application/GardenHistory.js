import { gardenAge } from '../domain/GardenAge.js'

/** A first planting is permanent even when the growth animation is restarted. */
export class GardenHistory {
  #plantedAt
  #repository
  #clock

  constructor({ repository, clock = () => Date.now() }) {
    this.#repository = repository
    this.#clock = clock
    this.#plantedAt = repository.load()
  }

  get plantedAt() {
    return this.#plantedAt
  }
  get age() {
    return gardenAge(this.#plantedAt, this.#clock())
  }

  recordFirstPlanting() {
    if (this.#plantedAt !== null) return
    // Re-read to preserve a first planting made in another open tab.
    this.#plantedAt = this.#repository.load() ?? this.#clock()
    this.#repository.save(this.#plantedAt)
  }

  refresh() {
    const stored = this.#repository.load()
    if (stored !== null && (this.#plantedAt === null || stored < this.#plantedAt))
      this.#plantedAt = stored
  }
}
