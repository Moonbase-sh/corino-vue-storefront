<script setup lang="ts">
import { hasRating, useProduct, useReviews } from '@moonbase.sh/vue'
import { formatRating, formatReviewCount } from '~/utils/reviews'

const props = defineProps<{ productId: string }>()

const product = useProduct(props.productId)
const { enabled } = useReviews()
const { showReviews } = useUi()

// The score comes with the catalog, so the prerendered page already has it
const rating = computed(() => {
  const score = product.value?.rating
  return hasRating(score) ? score : null
})

// Only for a signed-in customer who bought the product here
const writeLabel = computed(() => {
  if (!product.value?.mayReview)
    return null
  return product.value.reviewed ? 'YOUR REVIEW' : 'WRITE A REVIEW'
})
</script>

<template>
  <div v-if="enabled && (rating || writeLabel)" class="rating-line mono">
    <button
      v-if="rating"
      type="button"
      class="rating-summary"
      :aria-label="`Rated ${formatRating(rating.average)} out of 5 from ${formatReviewCount(rating.count)}. Read the reviews`"
      @click="showReviews(productId)"
    >
      <ReviewsStars :value="rating.average" />
      <span>{{ formatRating(rating.average) }}</span>
      <span class="dot">·</span>
      <span>{{ formatReviewCount(rating.count).toUpperCase() }}</span>
    </button>
    <button v-if="writeLabel" type="button" class="rating-write" @click="showReviews(productId, 'mine')">
      {{ writeLabel }}
    </button>
  </div>
</template>
