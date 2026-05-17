<script setup lang="ts">
import { type BundleLineItem, type ProductLineItem, useBundle, useCart, useProduct } from '@moonbase.sh/vue'

const props = defineProps<{
  item: ProductLineItem | BundleLineItem
}>()

const { removeFromCart, currency } = useCart()

const product = computed(() =>
  props.item.type === 'Product' ? useProduct(props.item.productId).value : null,
)
const bundle = computed(() =>
  props.item.type === 'Bundle' ? useBundle(props.item.bundleId).value : null,
)

const fallbackIcons: Record<string, string> = {
  'halo': '/assets/halo.svg',
  'drift': '/assets/drift.svg',
  'duo-bundle': '/assets/bundle.svg',
}

const id = computed(() =>
  props.item.type === 'Product' ? props.item.productId : props.item.bundleId,
)
const name = computed(() =>
  product.value?.name || bundle.value?.name || id.value,
)
const icon = computed(() =>
  product.value?.iconUrl || bundle.value?.iconUrl || fallbackIcons[id.value] || null,
)
const linePrice = computed(() => {
  const amount = props.item.price?.[currency.value]
  if (typeof amount !== 'number')
    return null
  return formatCurrency(amount * props.item.quantity, currency.value)
})
</script>

<template>
  <div class="cart-line">
    <div class="cart-line-product">
      <div class="cart-line-icon">
        <img v-if="icon" :src="icon" :alt="name">
      </div>
      <div class="cart-line-meta">
        <span class="name">{{ name }}</span>
        <span v-if="item.quantity > 1" class="qty">× {{ item.quantity }}</span>
      </div>
    </div>
    <span class="price">{{ linePrice }}</span>
    <button class="remove" type="button" aria-label="Remove" @click="removeFromCart(item)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>
