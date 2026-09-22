import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { GardenSession } from '../../application/GardenSession.js'
import { createAnimationLoop } from '../../infrastructure/BrowserAnimationLoop.js'
import { GardenAudio } from '../../infrastructure/GardenAudio.js'

export function useGarden(render) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const session = new GardenSession({ reducedMotion: motionPreference.matches })
  const state = shallowRef(session.snapshot)
  const soundEnabled = ref(false)
  const soundPending = ref(false)
  const soundError = ref(false)
  let stop,
    audio,
    disposed = false
  const sync = () => {
    state.value = session.snapshot
  }
  const execute = (action) => {
    action()
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

  onMounted(() => {
    audio = new GardenAudio()
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
    disposed = true
    stop?.()
    audio?.dispose()
    motionPreference.removeEventListener('change', updateMotion)
  })
  return {
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
  }
}
