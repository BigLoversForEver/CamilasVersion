<script setup>
import { gardenCopy } from '../gardenCopy.js'
defineProps({ state: { type: Object, required: true } })
defineEmits(['select-stage', 'toggle-playback', 'restart'])
</script>

<template>
  <section class="journey" aria-label="Etapas del crecimiento">
    <div class="steps">
      <template v-for="(stage, index) in gardenCopy" :key="stage.chapter">
        <span v-if="index" class="connector" aria-hidden="true"></span>
        <button
          class="step"
          :class="{ active: index <= state.stageIndex }"
          :data-step="index"
          :aria-current="index === state.stageIndex ? 'step' : undefined"
          @click="$emit('select-stage', index)"
        >
          <span class="step-icon" aria-hidden="true">{{ stage.icon }}</span>
          <span
            ><small>0{{ index + 1 }}</small
            >{{ stage.label }}</span
          >
        </button>
      </template>
    </div>
    <div class="playback">
      <button
        id="pause"
        :disabled="state.complete || (!state.playing && state.progress === 0)"
        @click="$emit('toggle-playback')"
      >
        {{ state.playing ? 'Ⅱ Pausar' : '▷ Continuar' }}
      </button>
      <div
        class="progress"
        role="progressbar"
        aria-label="Crecimiento del jardín"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(state.progress * 100)"
      >
        <div id="progress-fill" :style="{ width: `${state.progress * 100}%` }"></div>
      </div>
      <button id="restart" @click="$emit('restart')">↺ Volver a sembrar</button>
    </div>
  </section>
</template>
