export const GARDEN_HISTORY_KEY = 'camila.garden.first-planted-at.v1'

export class LocalGardenHistoryRepository {
  load() {
    try {
      const raw = window.localStorage.getItem(GARDEN_HISTORY_KEY)
      if (!raw) return null
      const value = Date.parse(raw)
      return Number.isFinite(value) && new Date(value).toISOString() === raw ? value : null
    } catch {
      return null
    }
  }

  save(plantedAt) {
    try {
      window.localStorage.setItem(GARDEN_HISTORY_KEY, new Date(plantedAt).toISOString())
    } catch {
      /* Restricted storage still allows the current visit to work. */
    }
  }
}
