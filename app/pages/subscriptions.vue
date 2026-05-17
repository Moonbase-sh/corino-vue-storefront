<script setup lang="ts">
import { useAuth, useInventory } from '@moonbase.sh/vue'

const route = useRoute()
const { user, loaded } = useAuth()
const { getSubscription } = useInventory()
const { showLogin } = useUi()

const subscriptionId = computed(() => (route.query.subscription_id as string | undefined) || '')

const subscription = ref<Awaited<ReturnType<typeof getSubscription>> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!subscriptionId.value || !user.value)
    return
  loading.value = true
  error.value = null
  try {
    subscription.value = await getSubscription(subscriptionId.value)
  }
  catch (err) {
    error.value = (err as Error).message
  }
  finally {
    loading.value = false
  }
}

watch([loaded, user, subscriptionId], () => {
  if (loaded.value && user.value && subscriptionId.value && !subscription.value)
    load()
}, { immediate: true })
</script>

<template>
  <AuthPage
    eyebrow="SUBSCRIPTION"
    title="Manage subscription"
    hint="View your subscription details."
  >
    <ClientOnly>
      <p v-if="!loaded" class="empty">
        Loading…
      </p>
      <p v-else-if="!subscriptionId" class="error">
        This link is missing a subscription reference.
      </p>
      <div v-else-if="!user" class="auth-result">
        <p class="hint">
          You need to be signed in to manage your subscription.
        </p>
        <button type="button" class="submit" @click="showLogin">
          Sign in
        </button>
      </div>
      <p v-else-if="loading" class="empty">
        Loading subscription…
      </p>
      <p v-else-if="error" class="error">
        {{ error }}
      </p>
      <div v-else-if="subscription" class="auth-result">
        <p class="hint">
          Subscription <strong>{{ subscription.id }}</strong>
        </p>
        <p v-if="subscription.status" class="hint">
          Status: {{ subscription.status }}
        </p>
        <p class="hint">
          Subscription management isn't built out in this reference app. Corino doesn't sell subscription products — your tenant may.
        </p>
        <NuxtLink to="/account" class="submit">
          Go to my account
        </NuxtLink>
      </div>
    </ClientOnly>
  </AuthPage>
</template>
