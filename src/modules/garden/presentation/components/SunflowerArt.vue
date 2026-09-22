<script setup>
defineProps({ bouquet: Boolean })
</script>

<template>
  <svg :viewBox="bouquet ? '0 0 280 320' : '0 0 100 100'" fill="none" aria-hidden="true">
    <g v-if="bouquet" stroke="#9aaa70" stroke-width="3">
      <path d="M140 305Q140 190 139 96M140 305Q81 220 63 147M140 305Q177 232 216 159" />
      <path
        d="M136 243Q68 238 72 192q59 3 64 51M146 266q69-10 67-56-62 9-67 56M139 187q47-6 49-38-43 6-49 38"
        fill="#8c9d66"
        stroke="none"
      />
    </g>
    <g
      v-for="(flower, index) in bouquet
        ? [
            { x: 91, y: 42, s: 1 },
            { x: 26, y: 111, s: 0.8 },
            { x: 177, y: 122, s: 0.8 },
          ]
        : [{ x: 0, y: 0, s: 1 }]"
      :key="index"
      :transform="`translate(${flower.x} ${flower.y}) scale(${flower.s})`"
    >
      <ellipse
        v-for="petal in 14"
        :key="petal"
        cx="50"
        cy="25"
        rx="8"
        ry="23"
        :transform="`rotate(${(petal * 360) / 14} 50 50)`"
        :fill="petal % 2 ? '#edc258' : '#dca737'"
      />
      <circle cx="50" cy="50" r="20" fill="#59472d" />
      <circle
        v-for="dot in 30"
        :key="dot"
        :cx="50 + Math.cos(dot * 2.4) * Math.sqrt(dot / 30) * 16"
        :cy="50 + Math.sin(dot * 2.4) * Math.sqrt(dot / 30) * 16"
        r="1.1"
        fill="#b48c45"
      />
    </g>
  </svg>
</template>
