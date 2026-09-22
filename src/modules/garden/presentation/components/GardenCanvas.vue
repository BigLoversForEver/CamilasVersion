<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createGardenRenderer } from '../../infrastructure/CanvasGardenRenderer.js'

const canvas = ref(null)
let renderer
onMounted(() => {
  renderer = createGardenRenderer(canvas.value)
})
onUnmounted(() => renderer?.dispose())
defineExpose({
  render: (progress, time, reducedMotion) => renderer?.render(progress, time, reducedMotion),
})
</script>

<template>
  <canvas
    ref="canvas"
    id="garden-canvas"
    role="img"
    aria-label="Ilustración animada de semillas que crecen hasta convertirse en un jardín de girasoles"
  />
</template>
