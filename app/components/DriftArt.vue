<script setup lang="ts">
const particles = ref<Array<{ left: string, top: string, width: string, height: string, animationDelay: string }>>([])
const wavePath = ref('M 0 15')

onMounted(() => {
  const N = 28
  particles.value = Array.from({ length: N }, () => {
    const size = 2 + Math.random() * 3
    return {
      left: `${15 + Math.random() * 70}%`,
      top: `${15 + Math.random() * 70}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${Math.random() * 3}s`,
    }
  })

  let d = 'M 0 15'
  for (let x = 1; x <= 200; x += 2) {
    const y = 15 + Math.sin(x * 0.15) * 6 * Math.sin(x * 0.04) + Math.sin(x * 0.5) * 2
    d += ` L ${x} ${y}`
  }
  wavePath.value = d
})
</script>

<template>
  <div>
    <div class="drift-line" style="top: 20%; opacity: 0.3;" />
    <div class="drift-line" style="top: 35%; opacity: 0.5;" />
    <div class="drift-line" style="top: 50%; opacity: 0.3;" />
    <div class="drift-line" style="top: 65%; opacity: 0.5;" />
    <div class="drift-line" style="top: 80%; opacity: 0.3;" />
    <div class="drift-orb" style="left: 18%; top: 22%; width: 38%; opacity: 0.85;" />
    <div
      class="drift-orb"
      style="right: 15%; bottom: 20%; width: 28%; opacity: 0.7;
        background: radial-gradient(circle at 40% 35%, oklch(0.8 0.1 220) 0%, oklch(0.5 0.16 250) 50%, transparent 100%);"
    />
    <div
      class="drift-orb"
      style="left: 52%; top: 52%; width: 20%; opacity: 0.6;
        background: radial-gradient(circle at 40% 35%, oklch(0.9 0.06 200) 0%, oklch(0.55 0.14 230) 60%, transparent 100%);"
    />
    <div>
      <div
        v-for="(p, i) in particles"
        :key="i"
        class="drift-particle"
        :style="p"
      />
    </div>
    <svg class="drift-wave" viewBox="0 0 200 30" preserveAspectRatio="none">
      <path :d="wavePath" stroke="oklch(0.78 0.14 230 / 0.7)" stroke-width="1" fill="none" />
    </svg>
  </div>
</template>
