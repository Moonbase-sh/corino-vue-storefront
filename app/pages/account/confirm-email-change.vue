<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const { confirmEmailChange } = useAuth()

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
    await confirmEmailChange(email.value, code.value)
    status.value = 'success'
  }
  catch (err) {
    error.value = (err as Error).message
    status.value = 'error'
  }
})
</script>

<template>
  <AuthPage eyebrow="CONFIRM EMAIL CHANGE" title="Email change">
    <ClientOnly>
      <p v-if="status === 'pending'" class="empty">
        Confirming your new email…
      </p>
      <div v-else-if="status === 'success'" class="auth-result">
        <p class="success">
          Your email is updated to <strong>{{ email }}</strong>.
        </p>
        <NuxtLink to="/account" class="submit">
          Go to my account
        </NuxtLink>
      </div>
      <div v-else class="auth-result">
        <p class="error">
          {{ error }}
        </p>
        <NuxtLink to="/account" class="auth-link">
          Back to account
        </NuxtLink>
      </div>
    </ClientOnly>
  </AuthPage>
</template>
