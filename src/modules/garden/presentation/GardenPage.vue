<script setup>
import { computed, ref } from 'vue'
import GardenCanvas from './components/GardenCanvas.vue'
import GrowthControls from './components/GrowthControls.vue'
import { useGarden } from './composables/useGarden.js'
import { gardenCopy } from './gardenCopy.js'

const gardenElement = ref(null)
const gardenCanvas = ref(null)
const {
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
} = useGarden((progress, time, reducedMotion) =>
  gardenCanvas.value?.render(progress, time, reducedMotion),
)
const copy = computed(() => gardenCopy[state.value.stageIndex])
function activate() {
  primaryAction()
  gardenElement.value?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'center',
  })
}
</script>

<template>
  <header>
    <a class="brand" href="#" aria-label="Un jardín para Camila, inicio"
      ><span class="brand-flower">✳</span> algo bonito para ti</a
    ><span class="header-note">HECHO CON CARIÑO <span>♡</span></span>
  </header>
  <main>
    <section class="intro" aria-labelledby="title">
      <div class="eyebrow"><span></span> FLORES AMARILLAS, SOLO PARA TI <span></span></div>
      <h1 id="title">
        Camila, hay cosas bonitas<br />que <em>crecen contigo.</em
        ><svg class="title-flower" viewBox="0 0 100 110" aria-hidden="true">
          <g fill="#e5af32">
            <ellipse cx="50" cy="28" rx="10" ry="24" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(45 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(90 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(135 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(180 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(225 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(270 50 50)" />
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(315 50 50)" />
          </g>
          <circle cx="50" cy="50" r="19" fill="#62422a" />
        </svg>
      </h1>
      <p>
        Este pequeño jardín empieza con una semilla.<br />Un poquito de luz, un poquito de tiempo… y
        muchas ganas de verte sonreír.
      </p>
      <button id="start" class="primary" @click="activate">
        <span aria-hidden="true">✧</span> {{ primaryLabel }}
        <span aria-hidden="true">{{ state.playing ? 'Ⅱ' : '↗' }}</span>
      </button>
      <span class="intro-caption">Lo bonito también está en verlo crecer.</span>
    </section>
    <section ref="gardenElement" class="garden" aria-label="Jardín animado de girasoles">
      <div class="garden-top">
        <span><i></i> NUESTRO PEQUEÑO JARDÍN</span
        ><button
          id="sound"
          :aria-pressed="soundEnabled"
          :disabled="soundPending"
          :title="soundEnabled ? 'Desactivar sonido' : 'Activar sonido'"
          @click="toggleSound"
        >
          ♫
          <span>{{
            soundError
              ? 'Sonido no disponible'
              : soundEnabled
                ? 'Sonido encendido'
                : 'Sonido apagado'
          }}</span>
        </button>
      </div>
      <div class="sun"></div>
      <div class="sun-halo"></div>
      <div class="stage-copy" aria-live="polite">
        <span id="chapter">{{ copy.chapter }}</span>
        <h2 id="stage-title">{{ copy.title }}</h2>
        <p id="stage-description">{{ copy.description }}</p>
      </div>
      <GardenCanvas ref="gardenCanvas" />
      <div class="garden-bottom">
        <span>UN POQUITO DE SOL HACE MAGIA</span><span>cultivado con amor ♡</span>
      </div>
    </section>
    <GrowthControls
      :state="state"
      @select-stage="selectStage"
      @toggle-playback="togglePlayback"
      @restart="restart"
    />
    <section class="dedication">
      <span>UNA FLOR ES BONITA. UN JARDÍN PARA TI, MUCHO MÁS.</span>
      <p>
        Que nunca te falten razones para florecer,<br /><em
          >ni alguien que te recuerde lo mucho que brillas.</em
        >
      </p>
      <div>Para ti, Camila <span>♡</span></div>
    </section>
  </main>
  <footer>
    <span>Un jardín que siempre será tuyo.</span
    ><span>Con todo el cariño del mundo <span class="gold">✳</span></span>
  </footer>
</template>
