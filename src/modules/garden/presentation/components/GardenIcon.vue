<script setup>
defineProps({ name: { type: String, default: 'leaf' } })
const paths = {
  leaf: 'M20 4C10 2 3 6 4 13c1 7 13 8 16-9ZM4 21 15 10M8 17v-5m0 5h5',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  seed: 'M5 18C1 9 10 3 20 4c1 10-5 17-12 15M4 21 15 10',
  sprout: 'M12 21V11M12 16C4 16 3 12 3 8c6 0 9 3 9 8Zm0-5c0-6 4-8 9-8 0 6-3 9-9 8Z',
  flower:
    'M12 8c-5-9-10-1-4 2-10-1-8 8 0 5-5 8 4 11 5 2 4 9 11 3 5-3 10 0 8-9 0-6 5-8-5-10-6 0ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  play: 'm9 5 11 7-11 7Z',
  pause: 'M9 5v14M16 5v14',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  restart: 'M4 10a8 8 0 1 1 0 5M4 4v6h6',
  heart: 'M12 20S2 14 2 8c0-5 7-7 10-1 3-6 10-4 10 1 0 6-10 12-10 12Z',
  sound: 'm11 4-6 5H2v6h3l6 5ZM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14',
  mail: 'M3 5h18v14H3Zm0 0 9 8 9-8',
  check: 'm5 12 4 4L19 6',
  sparkle: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
}
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.35"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.leaf" />
  </svg>
</template>
