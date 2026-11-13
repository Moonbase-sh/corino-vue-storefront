<script setup lang="ts">
import { useAuth, useProduct, useReviews } from '@moonbase.sh/vue'

const { state, showReviews, hideReviews } = useUi()
const { user } = useAuth()
const { enabled } = useReviews()
// Follows the modal's product
const product = useProduct(() => state.value.reviewsModal?.productId ?? '')

const productId = computed(() => state.value.reviewsModal?.productId ?? '')
const productName = computed(() => product.value?.name ?? 'this product')

// "Your review" is for a signed-in customer who bought the product here, or who has a review of it
const hasOwnTab = computed(() => !!user.value && !!(product.value?.mayReview || product.value?.reviewed))
const tab = computed(() => state.value.reviewsModal?.tab === 'mine' && hasOwnTab.value ? 'mine' : 'all')
</script>

<template>
  <teleport to="body">
    <div v-if="state.reviewsModal" class="modal-mask" @click="hideReviews">
      <div class="modal trial-modal reviews-modal" role="dialog" aria-labelledby="reviews-modal-title" @click.stop>
        <header class="trial-modal-head">
          <h2 id="reviews-modal-title">
            Reviews
          </h2>
          <button class="close-btn" type="button" aria-label="Close" @click="hideReviews">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div v-if="product" class="trial-product">
          <div class="trial-product-icon">
            <img v-if="product.iconUrl" :src="product.iconUrl" :alt="product.name">
          </div>
          <div>
            <h3>{{ product.name }}</h3>
          </div>
        </div>

        <div v-if="hasOwnTab" class="account-tabs reviews-tabs" role="tablist">
          <button type="button" role="tab" :aria-selected="tab === 'all'" :class="{ active: tab === 'all' }" @click="showReviews(productId, 'all')">
            All reviews
          </button>
          <button type="button" role="tab" :aria-selected="tab === 'mine'" :class="{ active: tab === 'mine' }" @click="showReviews(productId, 'mine')">
            Your review
          </button>
        </div>

        <p v-if="!enabled" class="empty">
          Reviews aren't available right now.
        </p>
        <ReviewsList
          v-else-if="tab === 'all'"
          :key="productId"
          :product-id="productId"
          :product-name="productName"
          :may-review="!!user && !!product?.mayReview && !product.reviewed"
          @write="showReviews(productId, 'mine')"
        />
        <ReviewsYourReview v-else :key="productId" :product-id="productId" :product-name="productName" />
      </div>
    </div>
  </teleport>
</template>
