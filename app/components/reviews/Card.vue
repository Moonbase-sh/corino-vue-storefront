<script setup lang="ts">
import { type ProductReview, type ReviewVoteDirection, type ReviewVoteTotals, useAuth, useReviews } from '@moonbase.sh/vue'
import { errorMessage, formatDate } from '~/utils/format'
import { helpfulSentence, languageName, opensTranslated } from '~/utils/reviews'

const props = defineProps<{
  productId: string
  review: ProductReview
  /** Signs the store's reply. */
  storeName: string | null
}>()

const emit = defineEmits<{ voted: [totals: ReviewVoteTotals] }>()

const { user } = useAuth()
const { voteOnReview } = useReviews()
const { showLogin } = useUi()

// A review in another language opens in English, unless the reader's browser reads the original
const translated = ref(!!props.review.translation && opensTranslated(props.review.language))
const shown = computed(() => (translated.value && props.review.translation) || props.review)
const language = computed(() => languageName(props.review.language) ?? 'another language')

const author = computed(() => props.review.author.anonymous || !props.review.author.name ? null : props.review.author.name)
const helpful = computed(() => helpfulSentence(props.review.upVotes))

const voting = ref(false)
const voteError = ref<string | null>(null)

async function vote(direction: 'up' | 'down') {
  // Pressing the vote already cast takes it back
  const next: ReviewVoteDirection = props.review.viewerVote === direction ? 'none' : direction
  voting.value = true
  voteError.value = null
  try {
    emit('voted', await voteOnReview(props.productId, props.review.id, next))
  }
  catch (err) {
    voteError.value = errorMessage(err)
  }
  finally {
    voting.value = false
  }
}
</script>

<template>
  <article class="review-card">
    <header class="review-card-head">
      <ReviewsStars :value="review.rating" :label="`${review.rating} out of 5 stars`" />
      <span class="caption mono">
        {{ formatDate(review.publishedAt) }}<template v-if="review.edited"> · EDITED</template>
      </span>
    </header>

    <h4>{{ shown.title }}</h4>
    <p class="review-body">
      {{ shown.body }}
    </p>
    <p v-if="review.translation" class="review-translation mono">
      {{ translated ? `TRANSLATED FROM ${language.toUpperCase()}` : 'ORIGINAL' }} ·
      <button type="button" @click="translated = !translated">
        {{ translated ? 'SHOW ORIGINAL' : 'SHOW TRANSLATION' }}
      </button>
    </p>

    <p class="review-author">
      <span class="name">{{ author ?? 'Verified owner' }}</span>
      <span v-if="author" class="verified mono">✓ VERIFIED OWNER</span>
      <span v-if="review.isOwn" class="badge mono">YOUR REVIEW</span>
    </p>

    <div v-if="review.reply" class="review-reply">
      <span class="caption mono">{{ (storeName ?? 'The store').toUpperCase() }} REPLIED · {{ formatDate(review.reply.at) }}</span>
      <p>{{ review.reply.body }}</p>
    </div>

    <div class="review-votes">
      <template v-if="user && !review.isOwn">
        <span class="caption">Helpful?</span>
        <button type="button" :aria-pressed="review.viewerVote === 'up'" :disabled="voting" @click="vote('up')">
          Yes · {{ review.upVotes }}
        </button>
        <button type="button" :aria-pressed="review.viewerVote === 'down'" :disabled="voting" @click="vote('down')">
          No · {{ review.downVotes }}
        </button>
      </template>
      <template v-else>
        <span v-if="helpful" class="caption">{{ helpful }}</span>
        <button v-if="!user" type="button" class="review-sign-in" @click="showLogin">
          Sign in to vote
        </button>
      </template>
      <span v-if="voteError" class="error">{{ voteError }}</span>
    </div>
  </article>
</template>
