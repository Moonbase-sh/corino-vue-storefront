<script setup lang="ts">
const N = 32
const bars = Array.from({ length: N }, (_, i) => {
  const t = i / N
  const h = Math.sin(t * Math.PI) ** 0.6 * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.3)))
  return {
    height: `${h * 100}%`,
    background: `oklch(${0.6 + h * 0.25} 0.18 ${50 + i * 1.5} / 0.85)`,
  }
})
</script>

<template>
  <div>
    <div class="halo-grid" />
    <div class="halo-ring" style="width: 2916.67%; opacity: 0.5; border-color: oklch(0.78 0.16 60 / 0.55);" />
    <div class="halo-ring" style="width: 3541.67%; opacity: 0.4; border-color: oklch(0.78 0.16 56 / 0.45);" />
    <div class="halo-ring" style="width: 4166.67%; opacity: 0.3; border-color: oklch(0.78 0.16 52 / 0.35);" />
    <div class="halo-ring" style="width: 4895.83%; opacity: 0.2; border-color: oklch(0.78 0.16 48 / 0.25);" />
    <div class="halo-sun" />
    <div class="halo-horizon" />
    <div class="halo-bars">
      <div
        v-for="(bar, i) in bars"
        :key="i"
        :style="{ height: bar.height, background: bar.background }"
      />
    </div>
  </div>
</template>
