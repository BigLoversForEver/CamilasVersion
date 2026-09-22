import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { GardenSession } from '../../application/GardenSession.js'
import { createAnimationLoop } from '../../infrastructure/BrowserAnimationLoop.js'
import { GardenAudio } from '../../infrastructure/GardenAudio.js'
import { GardenHistory } from '../../application/GardenHistory.js'
import {
  LocalGardenHistoryRepository,
  GARDEN_HISTORY_KEY,
} from '../../infrastructure/LocalGardenHistoryRepository.js'

export function useGarden(render) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const session = new GardenSession({ reducedMotion: motionPreference.matches })
  const state = shallowRef(session.snapshot)
  const history = new GardenHistory({ repository: new LocalGardenHistoryRepository() })
  const plantedAt = ref(history.plantedAt)
  const age = shallowRef(history.age)
  let ageTimer
  const updateAge = () => {
    plantedAt.value = history.plantedAt
    age.value = history.age
  }
  const refreshHistory = () => {
    history.refresh()
    updateAge()
  }
  const storageChanged = (event) => {
    if (event.key === GARDEN_HISTORY_KEY) refreshHistory()
  }
  const soundEnabled = ref(false)
  const soundPending = ref(false)
  const soundError = ref(false)
  const volume = ref(40)
  let stop,
    audio,
    disposed = false
  const sync = () => {
    state.value = session.snapshot
  }
  const execute = (action) => {
    action()
    if (session.snapshot.playing || session.snapshot.complete) history.recordFirstPlanting()
    updateAge()
    sync()
  }
  const primaryAction = () => execute(() => session.primaryAction())
  const togglePlayback = () => execute(() => session.togglePlayback())
  const restart = () => execute(() => session.plant())
  const selectStage = (index) => execute(() => session.selectStage(index))
  const primaryLabel = computed(() =>
    state.value.complete
      ? 'Volver a florecer'
      : state.value.playing
        ? 'Pausar crecimiento'
        : state.value.progress > 0
          ? 'Continuar crecimiento'
          : 'Sembrar para ti',
  )
  const updateMotion = (event) => {
    session.reducedMotion = event.matches
  }

  async function toggleSound() {
    if (soundPending.value || !audio) return
    soundPending.value = true
    try {
      const enabled = await audio.toggle()
      if (!disposed) {
        soundEnabled.value = enabled
        soundError.value = false
      }
    } catch {
      if (!disposed) soundError.value = true
    } finally {
      if (!disposed) soundPending.value = false
    }
  }

  function setVolume(value) {
    if (!Number.isFinite(value)) return
    volume.value = Math.max(0, Math.min(100, value))
    audio?.setVolume(volume.value)
  }

  onMounted(() => {
    ageTimer = window.setInterval(updateAge, 1000)
    window.addEventListener('storage', storageChanged)
    document.addEventListener('visibilitychange', refreshHistory)
    audio = new GardenAudio()
    audio.setVolume(volume.value)
    motionPreference.addEventListener('change', updateMotion)
    stop = createAnimationLoop((elapsed, time) => {
      if (session.snapshot.playing) {
        session.advance(elapsed)
        sync()
      }
      render(state.value.progress, session.reducedMotion ? 0 : time, session.reducedMotion)
    })
  })
  onUnmounted(() => {
    window.clearInterval(ageTimer)
    window.removeEventListener('storage', storageChanged)
    document.removeEventListener('visibilitychange', refreshHistory)
    disposed = true
    stop?.()
    audio?.dispose()
    motionPreference.removeEventListener('change', updateMotion)
  })
  return {
    plantedAt,
    age,
    state,
    primaryLabel,
    primaryAction,
    togglePlayback,
    restart,
    selectStage,
    soundEnabled,
    soundPending,
    soundError,
    toggleSound,
    volume,
    setVolume,
  }
}
