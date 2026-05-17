<script setup lang="ts">
const route = useRoute()
const productId = computed(() => route.params.id as string)
</script>

<template>
  <AccountProductDetail :product-id="productId" />
</template>
