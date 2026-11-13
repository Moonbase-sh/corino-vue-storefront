<script setup lang="ts">
import { type MyProductReview, type MyProductReviewDetails, REVIEW_LIMITS, useAuth, useReviews, useVendor } from '@moonbase.sh/vue'
import { errorMessage } from '~/utils/format'
import { checkReview, describeReviewLength, type ReviewErrors, reviewTermsUrl } from '~/utils/reviews'

const props = defineProps<{
  productId: string
  /** The review they already have, in whatever state, which posting rewrites. */
  existing: MyProductReviewDetails | null
  supportEmail: string | null
  cancellable: boolean
}>()

const emit = defineEmits<{ saved: [mine: MyProductReview], cancel: [] }>()

const { user } = useAuth()
const { saveReview } = useReviews()
const { vendor } = useVendor()
const termsUrl = reviewTermsUrl(useRuntimeConfig().public.moonbase.endpoint ?? '')

const rating = ref<number | null>(props.existing?.rating ?? null)
const title = ref(props.existing?.title ?? '')
const body = ref(props.existing?.body ?? '')
const anonymous = ref(props.existing?.anonymous ?? false)
const displayName = ref(props.existing?.displayName ?? user.value?.name ?? '')

const attempted = ref(false)
const serverErrors = ref<ReviewErrors>({})
const saving = ref(false)
const saveError = ref<string | null>(null)

const draft = computed(() => ({
  rating: rating.value,
  title: title.value,
  body: body.value,
  displayName: displayName.value,
  anonymous: anonymous.value,
}))
// Once they have tried to post, each field says what is wrong with it until it is fixed
const errors = computed<ReviewErrors>(() => attempted.value ? { ...checkReview(draft.value).errors, ...serverErrors.value } : {})
const length = computed(() => describeReviewLength(body.value.trim().length))
const ids = { title: useId(), body: useId(), name: useId(), showAs: useId() }

async function submit() {
  attempted.value = true
  serverErrors.value = {}
  const { request } = checkReview(draft.value)
  if (!request)
    return

  saving.value = true
  saveError.value = null
  try {
    // A review that exists is rewritten, whatever state it is in: a second one is refused
    emit('saved', await saveReview(props.productId, request, !!props.existing))
  }
  catch (err) {
    // The backend's word on a field goes next to that field
    const fields = (err as { errors?: ReviewErrors }).errors
    if (fields)
      serverErrors.value = fields
    saveError.value = errorMessage(err)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="account-form review-form" novalidate @submit.prevent="submit">
    <div class="review-field">
      <span class="review-label">Your rating</span>
      <ReviewsStarInput v-model="rating" :invalid="!!errors.rating" />
      <p v-if="errors.rating" class="error">
        {{ errors.rating }}
      </p>
    </div>

    <div class="review-field">
      <label :for="ids.title">Headline</label>
      <input
        :id="ids.title"
        v-model="title"
        type="text"
        :maxlength="REVIEW_LIMITS.titleMax"
        placeholder="Sum it up in a few words"
        :aria-invalid="!!errors.title || undefined"
      >
      <p v-if="errors.title" class="error">
        {{ errors.title }}
      </p>
    </div>

    <div class="review-field">
      <label :for="ids.body">Review</label>
      <textarea
        :id="ids.body"
        v-model="body"
        rows="6"
        :maxlength="REVIEW_LIMITS.bodyMax"
        placeholder="What would you tell the next customer?"
        :aria-invalid="!!errors.body || undefined"
      />
      <div class="review-length" :class="{ met: length.met }">
        <span class="review-length-bar"><span :style="{ width: `${length.fill * 100}%` }" /></span>
        <span class="mono">{{ length.text }}</span>
      </div>
      <p v-if="errors.body" class="error">
        {{ errors.body }}
      </p>
    </div>

    <fieldset class="review-field review-show-as">
      <legend class="review-label">
        Show it as
      </legend>
      <label class="checkbox-row">
        <input v-model="anonymous" type="radio" :name="ids.showAs" :value="false">
        Your name
      </label>
      <input
        v-if="!anonymous"
        :id="ids.name"
        v-model="displayName"
        type="text"
        aria-label="Name to show"
        :maxlength="REVIEW_LIMITS.displayNameMax"
        :aria-invalid="!!errors.displayName || undefined"
      >
      <label class="checkbox-row">
        <input v-model="anonymous" type="radio" :name="ids.showAs" :value="true">
        Verified owner, with no name
      </label>
      <p v-if="errors.displayName" class="error">
        {{ errors.displayName }}
      </p>
    </fieldset>

    <p class="hint review-terms">
      Checked before it appears. By posting, you agree {{ vendor?.name ?? 'the store' }} may use it in marketing
      (<a :href="termsUrl" target="_blank" rel="noopener">terms</a>).
      <template v-if="supportEmail">
        For help with the product, email <a :href="`mailto:${supportEmail}`">{{ supportEmail }}</a>.
      </template>
    </p>

    <p v-if="saveError" class="error">
      {{ saveError }}
    </p>

    <div class="your-review-actions">
      <button type="submit" class="submit" :disabled="saving">
        {{ saving ? 'Posting…' : existing ? 'Post changes' : 'Post review' }}
      </button>
      <button v-if="cancellable" type="button" class="revoke-btn" @click="emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>
