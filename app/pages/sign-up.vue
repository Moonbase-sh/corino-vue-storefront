<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const router = useRouter()
const { confirmAccount } = useAuth()

const email = computed(() => (route.query.email as string | undefined) || '')
const code = computed(() => (route.query.code as string | undefined) || '')

const status = ref<'pending' | 'success' | 'error'>('pending')
const error = ref<string | null>(null)
const account = ref<{ name: string, email: string, resetPasswordToken: string | null } | null>(null)

onMounted(async () => {
  if (!email.value || !code.value) {
    status.value = 'error'
    error.value = 'This confirmation link is missing required information.'
    return
  }
  try {
    const result = await confirmAccount(email.value, code.value)
    account.value = result
    status.value = 'success'
  }
  catch (err) {
    error.value = (err as Error).message
    status.value = 'error'
  }
})

function goAccount() {
  router.push('/account')
}

function goReset() {
  if (account.value?.resetPasswordToken) {
    router.push({
      path: '/forgot-password',
      query: { email: account.value.email, code: account.value.resetPasswordToken },
    })
  }
}
</script>

<template>
  <AuthPage eyebrow="CONFIRM ACCOUNT" title="Welcome to Corino">
    <ClientOnly>
      <p v-if="status === 'pending'" class="empty">
        Confirming your account…
      </p>
      <div v-else-if="status === 'success'" class="auth-result">
        <p class="success">
          Your account is confirmed.
        </p>
        <p v-if="account?.resetPasswordToken" class="hint">
          Set a password to finish setting up your account, or jump straight into your account.
        </p>
        <p v-else class="hint">
          You can now sign in and manage your products.
        </p>
        <div class="auth-actions">
          <button
            v-if="account?.resetPasswordToken"
            type="button"
            class="submit"
            @click="goReset"
          >
            Set a password
          </button>
          <button type="button" class="submit secondary" @click="goAccount">
            Go to my account
          </button>
        </div>
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
