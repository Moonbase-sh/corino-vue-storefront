<script setup lang="ts">
import { useBundle, useCart, useProduct } from '@moonbase.sh/vue'

const route = useRoute()
const cart = useCart()
const { showCart } = useUi()

onMounted(() => {
  if (route.query.add_bundle) {
    const bundle = useBundle(route.query.add_bundle as string)
    if (bundle.value) {
      cart.addToCart(bundle.value)
      showCart()
    }
  }

  if (route.query.add_product) {
    const product = useProduct(route.query.add_product as string)
    if (product.value) {
      cart.addToCart(product.value)
      showCart()
    }
  }
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
