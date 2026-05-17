<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const router = useRouter()
const { user, loaded } = useAuth()
const { showLogin } = useUi()

const productId = computed(() => (route.query.product_id as string | undefined) || '')

// Once the user is loaded and signed in, send them straight to the product page.
// Authenticated users see live download buttons there.
watchEffect(() => {
  if (loaded.value && user.value && productId.value)
    router.replace(`/account/products/${productId.value}`)
})
</script>

<template>
  <AuthPage
    eyebrow="DOWNLOAD"
    title="Download product"
    hint="Sign in to access your downloads and license keys."
  >
    <ClientOnly>
      <p v-if="!loaded" class="empty">
        Loading…
      </p>
      <p v-else-if="!productId" class="error">
        This link is missing a product reference.
      </p>
      <p v-else-if="user" class="empty">
        Loading downloads for {{ productId }}…
      </p>
      <div v-else class="auth-result">
        <p class="hint">
          You need to be signed in to download <strong>{{ productId }}</strong>.
        </p>
        <button type="button" class="submit" @click="showLogin">
          Sign in
        </button>
        <p class="hint">
          Don't have an account? Purchase the product to get one.
        </p>
        <NuxtLink to="/" class="auth-link">
          Browse plugins
        </NuxtLink>
      </div>
    </ClientOnly>
  </AuthPage>
</template>
