<script setup lang="ts">
import { type ProductRating, type ProductReview, ProductReviewSort, type ReviewVoteTotals, useAuth, useReviews, useVendor } from '@moonbase.sh/vue'
import { errorMessage } from '~/utils/format'
import { formatRating, formatReviewCount, REVIEW_SORTS } from '~/utils/reviews'

const props = defineProps<{
  productId: string
  productName: string
  /** Whether the customer may write the first review, for the empty state. */
  mayReview: boolean
}>()

const emit = defineEmits<{ write: [] }>()

const { getReviews, getMoreReviews } = useReviews()
const { user } = useAuth()
// The store's name, which signs its replies
const { vendor } = useVendor()

const sort = ref<ProductReviewSort>(ProductReviewSort.Helpful)
const stars = ref<number | null>(null)

const summary = ref<ProductRating | null>(null)
const items = ref<ProductReview[]>([])
const next = ref<string | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)

// Each load replaces the one before, so a slow answer for an old sort or filter is dropped
let latest = 0

async function load() {
  const request = ++latest
  loading.value = true
  error.value = null
  try {
    const page = await getReviews(props.productId, { sort: sort.value, stars: stars.value })
    if (request !== latest)
      return
    summary.value = page.summary
    items.value = page.items
    next.value = page.hasMore ? page.next : null
  }
  catch (err) {
    if (request === latest)
      error.value = errorMessage(err)
  }
  finally {
    if (request === latest)
      loading.value = false
  }
}

async function loadMore() {
  if (!next.value)
    return
  const request = latest
  loadingMore.value = true
  try {
    const page = await getMoreReviews(next.value)
    if (request !== latest)
      return
    items.value.push(...page.items)
    next.value = page.hasMore ? page.next : null
  }
  catch (err) {
    if (request === latest)
      error.value = errorMessage(err)
  }
  finally {
    loadingMore.value = false
  }
}

// How the reader voted, and which review is theirs, depend on who is signed in
watch([() => props.productId, sort, stars, () => user.value?.id], load, { immediate: true })

// One row per number of stars, which also filters the list to them
const distribution = computed(() => {
  const s = summary.value
  if (!s)
    return []
  const counts = [s.distribution.five, s.distribution.four, s.distribution.three, s.distribution.two, s.distribution.one]
  return counts.map((count, i) => ({ stars: 5 - i, count, share: s.count ? count / s.count : 0 }))
})

function toggleStars(value: number) {
  stars.value = stars.value === value ? null : value
}

// A vote comes back with the review's new totals, so the list isn't read again
function onVoted(id: string, totals: ReviewVoteTotals) {
  const review = items.value.find(r => r.id === id)
  if (review)
    Object.assign(review, totals)
}
</script>

<template>
  <div class="reviews-list">
    <p v-if="error && !summary" class="error">
      {{ error }}
    </p>
    <p v-else-if="!summary" class="empty">
      Loading reviews…
    </p>

    <div v-else-if="summary.count === 0" class="reviews-empty">
      <p>No reviews of {{ productName }} yet.</p>
      <button v-if="mayReview" type="button" class="download-btn primary" @click="emit('write')">
        Write the first one
      </button>
    </div>

    <template v-else>
      <div class="reviews-summary">
        <div class="reviews-score">
          <span class="reviews-average">{{ formatRating(summary.average ?? 0) }}</span>
          <ReviewsStars :value="summary.average ?? 0" :size="16" />
          <span class="caption mono">{{ formatReviewCount(summary.count).toUpperCase() }}</span>
        </div>
        <ul class="reviews-bars" aria-label="Show only reviews with">
          <li v-for="row in distribution" :key="row.stars">
            <button
              type="button"
              :class="{ active: stars === row.stars }"
              :aria-pressed="stars === row.stars"
              :aria-label="`${row.stars} stars, ${formatReviewCount(row.count)}`"
              :disabled="row.count === 0 && stars !== row.stars"
              @click="toggleStars(row.stars)"
            >
              <span class="mono">{{ row.stars }}★</span>
              <span class="reviews-bar"><span :style="{ width: `${row.share * 100}%` }" /></span>
              <span class="mono">{{ row.count }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="reviews-controls">
        <span class="mono">
          <template v-if="stars">
            {{ stars }}-STAR REVIEWS ·
            <button type="button" class="reviews-clear" @click="stars = null">SHOW ALL</button>
          </template>
          <template v-else>ALL REVIEWS</template>
        </span>
        <label class="reviews-sort">
          <span class="visually-hidden">Sort reviews</span>
          <select v-model="sort">
            <option v-for="option in REVIEW_SORTS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <p v-if="error" class="error">
        {{ error }}
      </p>
      <p v-if="!loading && items.length === 0" class="empty">
        No {{ stars }}-star reviews yet.
      </p>
      <ul v-else class="reviews-items" :class="{ loading }">
        <li v-for="review in items" :key="review.id">
          <ReviewsCard
            :product-id="productId"
            :review="review"
            :store-name="vendor?.name ?? null"
            @voted="totals => onVoted(review.id, totals)"
          />
        </li>
      </ul>

      <button v-if="next" type="button" class="revoke-btn reviews-more" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? 'Loading…' : 'Show more' }}
      </button>
    </template>
  </div>
</template>
