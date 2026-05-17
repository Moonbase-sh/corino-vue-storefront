<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const route = useRoute()
const router = useRouter()
const { forgotPassword, resetPassword, signIn } = useAuth()

const linkEmail = computed(() => (route.query.email as string | undefined) || '')
const linkCode = computed(() => (route.query.code as string | undefined) || '')
const hasResetLink = computed(() => !!linkEmail.value && !!linkCode.value)

// Request mode state
const requestEmail = ref('')
const requesting = ref(false)
const requestError = ref<string | null>(null)
const requestSent = ref(false)

async function submitRequest() {
  requesting.value = true
  requestError.value = null
  try {
    await forgotPassword(requestEmail.value)
    requestSent.value = true
  }
  catch (err) {
    requestError.value = (err as Error).message
  }
  finally {
    requesting.value = false
  }
}

// Reset mode state
const newPassword = ref('')
const resetting = ref(false)
const resetError = ref<string | null>(null)
const resetDone = ref(false)

async function submitReset() {
  resetting.value = true
  resetError.value = null
  try {
    await resetPassword(linkEmail.value, newPassword.value, linkCode.value)
    try {
      await signIn(linkEmail.value, newPassword.value)
      await router.replace('/account')
      return
    }
    catch {
      resetDone.value = true
    }
  }
  catch (err) {
    resetError.value = (err as Error).message
  }
  finally {
    resetting.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <AuthPage
    eyebrow="RESET PASSWORD"
    :title="hasResetLink ? 'Set a new password' : 'Reset your password'"
  >
    <ClientOnly>
      <!-- Reset mode (came from email link) -->
      <template v-if="hasResetLink">
        <form v-if="!resetDone" class="account-form" @submit.prevent="submitReset">
          <p class="hint">
            Setting a new password for <strong>{{ linkEmail }}</strong>.
          </p>

          <label for="new-password">New password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            required
          >

          <button type="submit" class="submit" :disabled="resetting">
            {{ resetting ? 'Saving…' : 'Save password' }}
          </button>

          <p v-if="resetError" class="error">
            {{ resetError }}
          </p>
        </form>
        <div v-else class="auth-result">
          <p class="success">
            Your password is updated.
          </p>
          <button type="button" class="submit" @click="goLogin">
            Sign in
          </button>
        </div>
      </template>

      <!-- Request mode (user wants a reset email) -->
      <template v-else>
        <form v-if="!requestSent" class="account-form" @submit.prevent="submitRequest">
          <p class="hint">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <label for="request-email">Email</label>
          <input
            id="request-email"
            v-model="requestEmail"
            type="email"
            autocomplete="email"
            required
          >

          <button type="submit" class="submit" :disabled="requesting">
            {{ requesting ? 'Sending…' : 'Send reset link' }}
          </button>

          <p v-if="requestError" class="error">
            {{ requestError }}
          </p>

          <NuxtLink to="/login" class="auth-link">
            Back to sign-in
          </NuxtLink>
        </form>
        <div v-else class="auth-result">
          <p class="success">
            Check your inbox.
          </p>
          <p class="hint">
            If an account exists for <strong>{{ requestEmail }}</strong>, you'll receive a reset link shortly.
          </p>
          <NuxtLink to="/login" class="auth-link">
            Back to sign-in
          </NuxtLink>
        </div>
      </template>
    </ClientOnly>
  </AuthPage>
</template>
