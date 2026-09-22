<script setup>
import { computed } from 'vue'
import GardenIcon from './GardenIcon.vue'
const props = defineProps({
  age: { type: Object, required: true },
  plantedAt: { type: Number, default: null },
})
const units = [
  { key: 'years', label: 'AÑOS' },
  { key: 'months', label: 'MESES' },
  { key: 'days', label: 'DÍAS' },
  { key: 'hours', label: 'HORAS' },
]
const pad = (value) => String(value).padStart(2, '0')
const plantedDate = computed(() =>
  props.plantedAt === null
    ? ''
    : new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        props.plantedAt,
      ),
)
const plantedDateTime = computed(() =>
  props.plantedAt === null ? '' : new Date(props.plantedAt).toISOString(),
)
</script>

<template>
  <section class="garden-age" aria-labelledby="garden-age-title">
    <div class="age-heading">
      <span class="age-sprout"><GardenIcon name="sprout" /></span
      ><span class="tiny-label">EL TIEMPO TAMBIÉN FLORECE</span>
      <h2 id="garden-age-title">Este jardín lleva <em>creciendo…</em></h2>
      <p>
        {{
          plantedAt === null
            ? 'Cada historia bonita empieza con una primera semilla.'
            : 'Y cada instante guarda un poquito más de cariño para ti.'
        }}
      </p>
    </div>
    <dl class="age-units" aria-label="Tiempo desde la primera siembra">
      <div v-for="unit in units" :key="unit.key" class="age-unit">
        <dt>{{ unit.label }}</dt>
        <dd :data-age="unit.key">{{ pad(age[unit.key]) }}</dd>
      </div>
    </dl>
    <div class="age-detail" v-if="plantedAt !== null">
      <span class="age-ticking" aria-hidden="true"
        ><span class="status-dot"></span>{{ pad(age.minutes) }} min · {{ pad(age.seconds) }} s de
        cariño</span
      ><span class="age-since"
        >Desde el <time :datetime="plantedDateTime">{{ plantedDate }}</time>
        <GardenIcon name="heart"
      /></span>
    </div>
    <p v-else class="age-empty">Siembra el jardín y empecemos a contar nuestra primavera.</p>
  </section>
</template>
