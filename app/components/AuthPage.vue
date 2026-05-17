<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  hint?: string
}>()
</script>

<template>
  <main class="auth-page">
    <div class="auth-head">
      <div class="section-num">[ {{ eyebrow }} ]</div>
      <h1>{{ title }}</h1>
      <p v-if="hint" class="hint">
        {{ hint }}
      </p>
    </div>

    <div class="auth-panel">
      <slot />
    </div>
  </main>
</template>
