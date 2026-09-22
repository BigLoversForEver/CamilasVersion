<script setup>
import { computed, ref } from 'vue'
import GardenCanvas from './components/GardenCanvas.vue'
import GrowthControls from './components/GrowthControls.vue'
import GardenIcon from './components/GardenIcon.vue'
import BotanicalBranch from './components/BotanicalBranch.vue'
import SunflowerArt from './components/SunflowerArt.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import GardenAgeCounter from './components/GardenAgeCounter.vue'
import { useGarden } from './composables/useGarden.js'
import { gardenCopy } from './gardenCopy.js'

const gardenElement = ref(null)
const gardenCanvas = ref(null)
const noteOpen = ref(false)
const {
  state,
  plantedAt,
  age,
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
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="#" aria-label="Un jardín para Camila, inicio"
        ><SunflowerArt class="brand-flower" /><span
          >Flores Amarillas :D<small>UN RINCONCITO PARA TI</small></span
        ></a
      >
      <nav aria-label="Navegación principal">
        <a href="#garden">El jardín</a><a href="#note">Una notita <GardenIcon name="heart" /></a>
      </nav>
      <span class="header-note"><span class="status-dot"></span> HECHO CON CARIÑO</span>
    </header>
    <main>
      <section class="intro" aria-labelledby="title">
        <div class="hero-botanical botanical-left">
          <BotanicalBranch /><span class="botanical-label">crecer, sin prisa.</span>
        </div>
        <div class="hero-botanical botanical-right"><BotanicalBranch /></div>
        <span class="floating-spark spark-one" aria-hidden="true">✧</span
        ><span class="floating-spark spark-two" aria-hidden="true">✧</span>
        <div class="eyebrow"><GardenIcon name="leaf" /> UN POQUITO DE SOL, UN MONTÓN DE CARIÑO</div>
        <h1 id="title">
          Camila, hay cosas bonitas<br />que <em>crecen contigo.</em
          ><SunflowerArt class="title-flower" />
        </h1>
        <p>
          Hay personas que se sienten como un rayito de sol.<br />Este jardín es para una de ellas.
          Sí, para ti.
        </p>
        <div class="hero-actions">
          <button id="start" class="primary" @click="activate">
            <GardenIcon :name="state.playing ? 'pause' : state.complete ? 'restart' : 'sprout'" />{{
              primaryLabel
            }}<GardenIcon name="arrow" /></button
          ><a class="text-link" href="#note">Tengo algo que decirte <GardenIcon name="heart" /></a>
        </div>
        <div class="intro-caption">
          <span></span> Sin prisa. Las cosas bonitas llevan su tiempo. <span></span>
        </div>
      </section>

      <div class="garden-section" id="garden">
        <div class="section-heading">
          <div>
            <span class="tiny-label">UN LUGAR DONDE SIEMPRE ES PRIMAVERA</span>
            <h2>Tu pequeño <em>refugio.</em></h2>
          </div>
          <span class="garden-tag"><GardenIcon name="sun" /> Luz, calma y girasoles</span>
        </div>
        <div class="garden-frame">
          <section
            ref="gardenElement"
            class="garden"
            :class="{ 'is-complete': state.complete }"
            aria-label="Jardín animado de girasoles"
          >
            <div class="garden-top">
              <span><i></i> EL JARDÍN DE CAMILA</span
              ><span class="season"><GardenIcon name="sun" /> Un día bonito</span>
            </div>
            <div class="sun"></div>
            <div class="sun-halo"></div>
            <div class="cloud cloud-one"></div>
            <div class="cloud cloud-two"></div>
            <div class="stage-copy" aria-live="polite">
              <span id="chapter">{{ copy.chapter }}</span>
              <h2 id="stage-title">{{ copy.title }}</h2>
              <p id="stage-description">{{ copy.description }}</p>
            </div>
            <GardenCanvas ref="gardenCanvas" />
            <div class="garden-bottom">
              <span><GardenIcon name="leaf" /> CULTIVADO CON AMOR</span
              ><span
                >{{
                  state.complete
                    ? '58 girasoles. Todos para ti.'
                    : 'Aquí está creciendo algo bonito.'
                }}
                <span aria-hidden="true">♡</span></span
              >
            </div>
          </section>
          <GrowthControls
            :state="state"
            @select-stage="selectStage"
            @toggle-playback="togglePlayback"
            @restart="restart"
          />
        </div>
        <MusicPlayer
          :enabled="soundEnabled"
          :pending="soundPending"
          :error="soundError"
          :volume="volume"
          @toggle="toggleSound"
          @volume="setVolume"
        />
        <GardenAgeCounter :age="age" :planted-at="plantedAt" />
      </div>

      <section class="little-things" aria-label="Pequeños recordatorios">
        <span class="tiny-label">UN JARDÍN TAMBIÉN SE CUIDA CON…</span>
        <div class="little-things-grid">
          <div>
            <GardenIcon name="sun" /><span>Un poquito de luz</span>
            <p>De esa que tú tienes.</p>
          </div>
          <div>
            <GardenIcon name="heart" /><span>Mucho, mucho cariño</span>
            <p>En los detalles pequeños.</p>
          </div>
          <div>
            <GardenIcon name="sprout" /><span>Tiempo para florecer</span>
            <p>A tu ritmo. Siempre.</p>
          </div>
        </div>
      </section>

      <section id="note" class="dedication" aria-labelledby="note-title">
        <BotanicalBranch class="note-branch" />
        <div class="note-content">
          <span class="tiny-label"><GardenIcon name="mail" /> DE MI CORAZÓN, PARA TI</span>
          <h2 id="note-title">Que nunca te falten<br />razones para <em>florecer.</em></h2>
          <p>
            Ni alguien que te recuerde lo mucho que brillas.<br />Ojalá este pedacito de primavera
            te saque una sonrisa,<br class="desktop-break" />
            hoy y cada vez que vuelvas.
          </p>
          <button
            class="note-button"
            :aria-expanded="noteOpen"
            aria-controls="personal-note"
            @click="noteOpen = !noteOpen"
          >
            {{ noteOpen ? 'Guardar la notita' : 'Te dejé una notita'
            }}<GardenIcon :name="noteOpen ? 'check' : 'heart'" />
          </button>
          <div v-if="noteOpen" id="personal-note" class="personal-note">
            <p>
              Camila, si hoy el mundo va demasiado rápido, quédate aquí un ratito. No tienes que
              florecer todos los días para ser alguien maravilloso. Este jardín, y todo el cariño
              con el que está hecho, siempre serán para ti.
            </p>
            <span>Con mucho cariño, siempre. ♡</span>
          </div>
        </div>
        <div class="note-art">
          <span class="note-orbit"></span><SunflowerArt bouquet /><span class="handwritten"
            >para ti, Camila ♡</span
          >
        </div>
      </section>
    </main>
    <footer>
      <a class="footer-brand" href="#"><SunflowerArt /> Un jardín que siempre será tuyo.</a
      ><span>Hecho con calma. Y con mucho cariño. <GardenIcon name="heart" /></span
      ><a class="back-top" href="#" aria-label="Volver arriba">↑</a>
    </footer>
  </div>
</template>
