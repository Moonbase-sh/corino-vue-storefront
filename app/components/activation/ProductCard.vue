<script setup lang="ts">
import type { OwnedProduct, StorefrontProduct } from '@moonbase.sh/vue'

defineProps<{
  product: StorefrontProduct | OwnedProduct
}>()
</script>

<template>
  <div class="activation-product-card">
    <div class="activation-product-card-icon">
      <img v-if="product.iconUrl" :src="product.iconUrl" :alt="product.name">
    </div>
    <div class="activation-product-card-content">
      <h2>{{ product.name }}</h2>
      <p v-if="product.tagline" class="tagline">
        {{ product.tagline }}
      </p>
      <slot name="description" />
    </div>
    <slot />
  </div>
</template>
