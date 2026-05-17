<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const { user, loaded, signIn } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loggingIn = ref(false)
const error = ref<string | null>(null)

// If the user is already signed in when they land here, send them to their account.
watchEffect(() => {
  if (loaded.value && user.value)
    router.replace('/account')
})

async function submit() {
  loggingIn.value = true
  error.value = null
  try {
    await signIn(email.value, password.value)
    router.replace('/account')
  }
  catch (err) {
    error.value = (err as Error).message
  }
  finally {
    loggingIn.value = false
  }
}
</script>

<template>
  <AuthPage
    eyebrow="LOG IN"
    title="Sign in"
    hint="Sign in to manage your account, downloads, and licenses."
  >
    <ClientOnly>
      <form class="account-form" @submit.prevent="submit">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
        >

        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        >

        <button type="submit" class="submit" :disabled="loggingIn">
          {{ loggingIn ? 'Signing in…' : 'Sign in' }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <NuxtLink to="/forgot-password" class="auth-link">
          Forgot your password?
        </NuxtLink>
      </form>
    </ClientOnly>
  </AuthPage>
</template>
