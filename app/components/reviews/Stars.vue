<script setup lang="ts">
import { formatRating, STAR_PATH } from '~/utils/reviews'

const props = withDefaults(defineProps<{
  /** From 0 to 5. A fraction fills part of a star. */
  value: number
  size?: number
  /** Read out in place of the stars. */
  label?: string
}>(), { size: 14, label: undefined })

const width = computed(() => `${(Math.max(0, Math.min(5, props.value)) / 5) * 100}%`)
</script>

<template>
  <span class="stars" role="img" :aria-label="label ?? `${formatRating(value)} out of 5 stars`">
    <span class="stars-row" aria-hidden="true">
      <svg v-for="n in 5" :key="n" :width="size" :height="size" viewBox="0 0 24 24"><path :d="STAR_PATH" /></svg>
    </span>
    <span class="stars-row stars-fill" :style="{ width }" aria-hidden="true">
      <svg v-for="n in 5" :key="n" :width="size" :height="size" viewBox="0 0 24 24"><path :d="STAR_PATH" /></svg>
    </span>
  </span>
</template>
