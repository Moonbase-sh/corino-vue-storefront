<script setup lang="ts">
import { type MyProductReview, useAuth, useReviews } from '@moonbase.sh/vue'
import { errorMessage, formatDate } from '~/utils/format'
import { describeMyReview, isAwaitingCheck, REVIEW_POLL } from '~/utils/reviews'

const props = defineProps<{
  productId: string
  productName: string
}>()

const { $moonbase } = useNuxtApp()
const { user } = useAuth()
const { getMyReview, withdrawReview } = useReviews()
const { showLogin } = useUi()

const mine = ref<MyProductReview | null>(null)
const loadError = ref<string | null>(null)
const editing = ref(false)
const confirming = ref(false)
const withdrawing = ref(false)
const actionError = ref<string | null>(null)

const summary = computed(() => describeMyReview(mine.value))
// Before they have a review, the form is the whole panel
const showForm = computed(() => !!mine.value?.eligibility.canReview && (editing.value || !mine.value.review))

let latest = 0
let pollTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  const request = ++latest
  clearTimeout(pollTimer)
  mine.value = null
  loadError.value = null
  if (!user.value)
    return
  try {
    const result = await getMyReview(props.productId)
    if (request === latest)
      mine.value = result
  }
  catch (err) {
    if (request === latest)
      loadError.value = errorMessage(err)
  }
}

// A posted review is checked within a minute or two, so ask again until it has been
function poll(attempt = 1) {
  clearTimeout(pollTimer)
  if (!isAwaitingCheck(mine.value) || attempt > REVIEW_POLL.attempts)
    return
  const request = latest
  pollTimer = setTimeout(async () => {
    try {
      const result = await getMyReview(props.productId)
      if (request !== latest)
        return
      mine.value = result
      if (isAwaitingCheck(result))
        poll(attempt + 1)
      else
        refreshCatalog()
    }
    catch {
      // The next visit to this panel asks again
    }
  }, REVIEW_POLL.intervalMs)
}

// The catalog carries each product's rating and whether the customer has a review of it
function refreshCatalog() {
  $moonbase.updateStorefront().catch(err => console.error('Could not refresh the catalog', err))
}

function onSaved(saved: MyProductReview) {
  mine.value = saved
  editing.value = false
  refreshCatalog()
  poll()
}

async function withdraw() {
  withdrawing.value = true
  actionError.value = null
  try {
    await withdrawReview(props.productId)
    confirming.value = false
    refreshCatalog()
    await load()
  }
  catch (err) {
    actionError.value = errorMessage(err)
  }
  finally {
    withdrawing.value = false
  }
}

watch([() => props.productId, () => user.value?.id], () => {
  editing.value = false
  confirming.value = false
  load()
}, { immediate: true })

onBeforeUnmount(() => {
  latest++
  clearTimeout(pollTimer)
})
</script>

<template>
  <div class="your-review">
    <div v-if="!user" class="download-blocked">
      <p>Sign in to review {{ productName }}.</p>
      <button type="button" class="download-btn primary" @click="showLogin">
        Sign in
      </button>
    </div>
    <p v-else-if="loadError" class="error">
      {{ loadError }}
    </p>
    <p v-else-if="!mine" class="empty">
      Loading your review…
    </p>
    <p v-else-if="!summary.visible" class="empty">
      Only customers who bought {{ productName }} here can review it.
    </p>

    <ReviewsForm
      v-else-if="showForm"
      :product-id="productId"
      :existing="mine.review"
      :support-email="mine.supportEmail ?? null"
      :cancellable="!!mine.review"
      @saved="onSaved"
      @cancel="editing = false"
    />

    <template v-else>
      <div class="your-review-status" :data-tone="summary.tone ?? undefined" aria-live="polite">
        <span v-if="summary.tone" class="your-review-dot" aria-hidden="true" />
        <div>
          <strong>{{ summary.headline }}</strong>
          <p v-if="summary.note">
            {{ summary.note }}
          </p>
          <template v-if="summary.needsSupport">
            <p>
              Reviews aren't read by support, so yours hasn't been published.
              <template v-if="!mine.supportEmail">
                For help, contact the store directly.
              </template>
              You can also edit your review to share how {{ productName }} has worked for you.
            </p>
            <p v-if="mine.supportEmail">
              <a :href="`mailto:${mine.supportEmail}`">Email {{ mine.supportEmail }}</a>
            </p>
          </template>
        </div>
      </div>

      <article v-if="mine.review?.title" class="review-card review-sent">
        <header class="review-card-head">
          <ReviewsStars :value="mine.review.rating" :label="`You rated it ${mine.review.rating} out of 5`" />
          <span class="caption mono">SENT {{ formatDate(mine.review.submittedAt) }}</span>
        </header>
        <h4>{{ mine.review.title }}</h4>
        <p class="review-body">
          {{ mine.review.body }}
        </p>
        <p class="review-author">
          <span class="caption">Shown as {{ mine.review.anonymous || !mine.review.displayName ? 'Verified owner' : mine.review.displayName }}</span>
        </p>
      </article>

      <div v-if="confirming" class="your-review-confirm">
        <p>Your review is taken down and stops counting toward the score. You can write a new one later.</p>
        <div class="your-review-actions">
          <button type="button" class="download-btn primary" :disabled="withdrawing" @click="withdraw">
            {{ withdrawing ? 'Withdrawing…' : 'Withdraw' }}
          </button>
          <button type="button" class="revoke-btn" @click="confirming = false">
            Keep it
          </button>
        </div>
      </div>
      <div v-else-if="summary.action || summary.canWithdraw" class="your-review-actions">
        <button v-if="summary.action" type="button" class="download-btn primary" @click="editing = true">
          {{ summary.action }}
        </button>
        <button v-if="summary.canWithdraw" type="button" class="revoke-btn" @click="confirming = true">
          Withdraw
        </button>
      </div>
      <p v-if="actionError" class="error">
        {{ actionError }}
      </p>
    </template>
  </div>
</template>
