<script setup lang="ts">
const N = 64
const W = 360
const H = 80
const bw = W / N - 1.5

const base = Array.from({ length: N }, (_, i) => {
  const t = i / N
  const decay = (1 - t) ** 0.7 * 0.85
  const wobble = Math.sin(i * 0.7) * 0.15 + Math.sin(i * 1.3) * 0.1
  return Math.max(0.05, decay + wobble)
})

const phase = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const bars = computed(() =>
  base.map((b, i) => {
    const animated = b * (0.7 + 0.3 * Math.abs(Math.sin((phase.value + i) * 0.4)))
    return {
      x: i * (W / N),
      width: bw,
      y: H - animated * H,
      height: animated * H,
    }
  }),
)

onMounted(() => {
  timer = setInterval(() => { phase.value++ }, 120)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <header id="top" class="hero">
    <div class="hero-meta">
      <span class="tag">CORINO STUDIO · EST. 2024</span>
      <span class="mono" style="display: inline-flex; align-items: center; gap: 8px;">
        <svg class="flag" width="14" height="10.18" viewBox="0 0 22 16" aria-label="Norway">
          <rect width="22" height="16" fill="#BA0C2F" />
          <rect x="6" width="2" height="16" fill="#fff" />
          <rect y="7" width="22" height="2" fill="#fff" />
          <rect x="6.5" width="1" height="16" fill="#00205B" />
          <rect y="7.5" width="22" height="1" fill="#00205B" />
        </svg>
        SOUND DESIGN · OSLO, NORWAY
      </span>
    </div>
    <h1>
      Sound,<br>
      <span class="italic">sculpted</span> with<br>
      <span class="accent">two plugins.</span>
    </h1>
    <div class="hero-sub">
      <p>
        We make two pieces of software — one to give your audio warmth,
        another to give it space. Built by a small team of mix engineers
        and DSP nerds. Designed to disappear into the music.
      </p>
    </div>
    <svg class="hero-spectrum" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <rect
        v-for="(b, i) in bars"
        :key="i"
        class="hero-spectrum-bar"
        :x="b.x"
        :y="b.y"
        :width="b.width"
        :height="b.height"
      />
    </svg>
  </header>
</template>
