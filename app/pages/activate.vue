<script setup lang="ts">
const route = useRoute()
const token = computed(() => (route.query.token as string | undefined) || null)
</script>

<template>
  <main class="activation-page">
    <div class="activation-head">
      <div class="section-num">[ ACTIVATION ]</div>
      <h1>Activate {{ token ? 'product' : 'offline device' }}</h1>
      <p class="hint">
        {{ token
          ? 'Finish setting up the device that opened this page.'
          : 'Activate a device that isn\'t connected to the internet.' }}
      </p>
    </div>

    <ClientOnly>
      <div class="activation-panel">
        <ActivationAutoActivation v-if="token" :token="token" />
        <ActivationManualActivation v-else />
      </div>
    </ClientOnly>

    <SiteFooter />
  </main>
</template>
