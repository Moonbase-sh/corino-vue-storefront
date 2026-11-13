<script setup lang="ts">
import { RATING_WORDS, ratingWord, STAR_PATH } from '~/utils/reviews'

defineProps<{ invalid?: boolean }>()

const rating = defineModel<number | null>({ required: true })

// The stars light up to the one under the pointer, as a preview of picking it
const hovered = ref<number | null>(null)
const lit = computed(() => hovered.value ?? rating.value ?? 0)
const name = useId()
</script>

<template>
  <div
    class="star-input"
    role="radiogroup"
    aria-label="Your rating"
    :aria-invalid="invalid || undefined"
    @mouseleave="hovered = null"
  >
    <label v-for="(word, i) in RATING_WORDS" :key="word" :class="{ lit: i < lit }" @mouseenter="hovered = i + 1">
      <input v-model="rating" type="radio" class="visually-hidden" :name="name" :value="i + 1">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR_PATH" /></svg>
      <span class="visually-hidden">{{ i + 1 }} {{ i === 0 ? 'star' : 'stars' }}, {{ word }}</span>
    </label>
    <span class="star-input-word mono" aria-hidden="true">{{ ratingWord(hovered ?? rating) || 'Choose a rating' }}</span>
  </div>
</template>
