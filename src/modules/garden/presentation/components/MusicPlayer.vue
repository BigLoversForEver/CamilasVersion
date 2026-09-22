<script setup>
import GardenIcon from './GardenIcon.vue'
import SunflowerArt from './SunflowerArt.vue'
defineProps({ enabled: Boolean, pending: Boolean, error: Boolean, volume: Number })
defineEmits(['toggle', 'volume'])
</script>

<template>
  <section class="music-player" :class="{ 'is-playing': enabled }" aria-label="Música del jardín">
    <div class="album-art"><SunflowerArt /></div>
    <div class="music-copy">
      <span class="tiny-label">LA BANDA SONORA DE ESTE RATITO</span>
      <h2>
        Donde floreces
        <span class="equalizer" :class="{ active: enabled }" aria-hidden="true"
          ><i></i><i></i><i></i><i></i
        ></span>
      </h2>
      <p aria-live="polite">
        {{
          error
            ? 'No se pudo iniciar el audio. Inténtalo de nuevo.'
            : enabled
              ? 'Melodía suave, brisa y pajaritos'
              : 'Dale play. Quédate un poquito.'
        }}
      </p>
    </div>
    <button
      id="sound"
      class="music-toggle"
      :aria-pressed="enabled"
      :aria-label="enabled ? 'Pausar música' : 'Reproducir música'"
      :disabled="pending"
      @click="$emit('toggle')"
    >
      <GardenIcon :name="enabled ? 'pause' : 'play'" />
    </button>
    <label class="volume-control"
      ><GardenIcon name="sound" /><span class="sr-only">Volumen de la música</span
      ><input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="volume"
        :aria-valuetext="`${volume}%`"
        :style="{ '--volume': `${volume}%` }"
        @input="$emit('volume', Number($event.target.value))"
      /><span class="volume-value">{{ volume }}%</span></label
    >
  </section>
</template>
