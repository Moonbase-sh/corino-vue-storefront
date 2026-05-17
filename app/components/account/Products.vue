<script setup lang="ts">
import { type OwnedProduct, useInventory } from '@moonbase.sh/vue'

const { getProducts } = useInventory()
const products = ref<OwnedProduct[] | null>(null)

onMounted(async () => {
  try {
    let response = await getProducts()
    products.value = response.items
    while (response.hasMore && response.next) {
      response = await getProducts(response.next)
      products.value.push(...response.items)
    }
  }
  catch (err) {
    console.error('Failed to load products', err)
    products.value = []
  }
})
</script>

<template>
  <div class="account-section">
    <p v-if="products === null" class="empty">
      Loading products…
    </p>
    <p v-else-if="products.length === 0" class="empty">
      You don't own any products yet.
    </p>
    <ul v-else class="product-list">
      <li
        v-for="product in products"
        :key="product.id"
        class="product-row"
      >
        <div class="product-icon">
          <img v-if="product.iconUrl" :src="product.iconUrl" :alt="product.name">
        </div>
        <div class="product-meta">
          <span class="name">{{ product.name }}</span>
          <span v-if="product.numberOfLicenses || product.subscriptionLicenses" class="licenses">
            {{ (product.numberOfLicenses ?? 0) + (product.subscriptionLicenses ?? 0) }} license{{ ((product.numberOfLicenses ?? 0) + (product.subscriptionLicenses ?? 0)) === 1 ? '' : 's' }}
          </span>
        </div>
        <NuxtLink class="manage" :to="`/account/products/${product.id}`">
          View
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
          </svg>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
