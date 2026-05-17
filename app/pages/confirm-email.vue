<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const { confirmEmail } = useAuth()

const email = computed(() => (route.query.email as string | undefined) || '')
const code = computed(() => (route.query.code as string | undefined) || '')

const status = ref<'pending' | 'success' | 'error'>('pending')
const error = ref<string | null>(null)

onMounted(async () => {
  if (!email.value || !code.value) {
    status.value = 'error'
    error.value = 'This confirmation link is missing required information.'
    return
  }
  try {
    await confirmEmail(email.value, code.value)
    status.value = 'success'
  }
  catch (err) {
    error.value = (err as Error).message
    status.value = 'error'
  }
})
</script>

<template>
  <AuthPage eyebrow="CONFIRM EMAIL" title="Email confirmation">
    <ClientOnly>
      <p v-if="status === 'pending'" class="empty">
        Confirming your email…
      </p>
      <div v-else-if="status === 'success'" class="auth-result">
        <p class="success">
          Your email address is confirmed.
        </p>
        <NuxtLink to="/account" class="submit">
          Go to my account
        </NuxtLink>
      </div>
      <div v-else class="auth-result">
        <p class="error">
          {{ error }}
        </p>
        <NuxtLink to="/login" class="auth-link">
          Go to sign-in
        </NuxtLink>
      </div>
    </ClientOnly>
  </AuthPage>
</template>
