<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const router = useRouter()
const { confirmAccount, resetPassword, signIn } = useAuth()

const email = computed(() => (route.query.email as string | undefined) || '')
const code = computed(() => (route.query.code as string | undefined) || '')

const status = ref<'confirming' | 'set-password' | 'error'>('confirming')
const error = ref<string | null>(null)

const confirmedEmail = ref('')
const resetPasswordToken = ref('')

const newPassword = ref('')
const saving = ref(false)
const saveError = ref<string | null>(null)

onMounted(async () => {
  if (!email.value || !code.value) {
    status.value = 'error'
    error.value = 'This confirmation link is missing required information.'
    return
  }
  try {
    const result = await confirmAccount(email.value, code.value)
    switch (result.status) {
      case 'PasswordSetupRequired':
        confirmedEmail.value = result.email
        resetPasswordToken.value = result.resetPasswordToken!
        status.value = 'set-password'
        return
      case 'SignedIn':
        await router.replace('/account')
        return
    }
  }
  catch (err) {
    error.value = (err as Error).message
    status.value = 'error'
  }
})

async function submitPassword() {
  saving.value = true
  saveError.value = null
  try {
    await resetPassword(confirmedEmail.value, newPassword.value, resetPasswordToken.value)
    try {
      await signIn(confirmedEmail.value, newPassword.value)
      await router.replace('/account')
      return
    }
    catch {
      await router.replace('/login')
    }
  }
  catch (err) {
    saveError.value = (err as Error).message
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <AuthPage eyebrow="CONFIRM ACCOUNT" title="Welcome to Corino">
    <ClientOnly>
      <p v-if="status === 'confirming'" class="empty">
        Confirming your account…
      </p>

      <form
        v-else-if="status === 'set-password'"
        class="account-form"
        @submit.prevent="submitPassword"
      >
        <p class="hint">
          Your account is confirmed. Choose a password for <strong>{{ confirmedEmail }}</strong> to finish setting up.
        </p>

        <label for="new-password">Password</label>
        <input
          id="new-password"
          v-model="newPassword"
          type="password"
          autocomplete="new-password"
          required
        >

        <button type="submit" class="submit" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save and continue' }}
        </button>

        <p v-if="saveError" class="error">
          {{ saveError }}
        </p>
      </form>

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
