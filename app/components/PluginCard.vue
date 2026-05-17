<script setup lang="ts">
import { useCart, useProduct } from '@moonbase.sh/vue'

const props = defineProps<{
  productId: string
  variant: 'halo' | 'drift'
  reverse?: boolean
  fallbackPrice: string
  fallbackOriginalPrice?: string
}>()

const product = useProduct(props.productId)
const cart = useCart()
const { showCart, showDownloads } = useUi()

const variation = computed(() => product.value?.defaultVariation || null)
const currency = computed(() => cart.currency.value)

const price = computed(() => {
  const v = variation.value
  if (!v)
    return props.fallbackPrice
  return formatCurrency(v.price[currency.value], currency.value)
})

const originalPrice = computed(() => {
  const v = variation.value
  if (!v)
    return props.fallbackOriginalPrice
  return formatCurrency(v.originalPrice[currency.value], currency.value)
})

const hasDiscount = computed(() => !!variation.value?.hasDiscount)
const discountName = computed(() => variation.value?.discount?.name || 'INTRO')
const owned = computed(() => !!product.value?.owned)

function addToCart() {
  if (!product.value)
    return
  cart.addToCart(product.value)
  showCart()
}
</script>

<template>
  <section class="plugin" :class="{ reverse }">
    <div class="plugin-art" :class="`${variant}-art`">
      <div class="plugin-art-inner">
        <slot name="art" />
      </div>
      <div class="art-chrome" :class="variant">
        <div class="corner tl" /><div class="corner tr" />
        <div class="corner bl" /><div class="corner br" />
        <slot name="chrome" />
      </div>
    </div>
    <div class="plugin-info">
      <div>
        <div class="plugin-meta">
          <slot name="meta" />
        </div>
        <h2 class="plugin-name">
          <span :class="`${variant}-gradient`">{{ variant === 'halo' ? 'HALO' : 'DRIFT' }}</span>
        </h2>
        <p class="plugin-tagline">
          <slot name="tagline" />
        </p>
        <p class="plugin-desc">
          <slot name="desc" />
        </p>

        <div class="spec-strip">
          <slot name="specs" />
        </div>
      </div>

      <div class="purchase">
        <div class="price-block">
          <span v-if="hasDiscount" class="price-old">{{ originalPrice }}</span>
          <span class="price-now"><span>{{ price }}</span></span>
        </div>
        <div class="price-note">
          <span v-if="hasDiscount" class="badge">{{ discountName }}</span>
        </div>
        <button
          v-if="!owned"
          type="button"
          class="add-btn"
          :class="variant"
          :disabled="!product"
          @click="addToCart"
        >
          ADD TO CART
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
          </svg>
        </button>
        <button
          v-else
          type="button"
          class="add-btn"
          :class="variant"
          @click="showDownloads(productId)"
        >
          DOWNLOAD
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M7 2v8M4 7.5L7 10.5l3-3M2.5 12h9" />
          </svg>
        </button>
      </div>
      <div v-if="!owned" class="trial-row">
        <slot name="trial" />
        <span class="trial-note mono">NO CARD · FULL FEATURES</span>
      </div>
    </div>
  </section>
</template>
