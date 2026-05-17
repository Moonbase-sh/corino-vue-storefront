<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const { state, hideLogin } = useUi()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loggingIn = ref(false)
const error = ref<string | null>(null)

async function tryLogin() {
  loggingIn.value = true
  error.value = null
  try {
    await signIn(email.value, password.value)
    hideLogin()
    email.value = ''
    password.value = ''
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
  <teleport to="body">
    <div v-if="state.loginOpen" class="modal-mask" @click="hideLogin">
      <form class="modal" @click.stop @submit.prevent="tryLogin">
        <h2>Sign in</h2>

        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
        >

        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        >

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button type="submit" class="submit" :disabled="loggingIn">
          {{ loggingIn ? 'Signing in…' : 'Sign in' }}
        </button>

        <div class="secondary-row">
          <NuxtLink to="/forgot-password" @click="hideLogin">
            Forgot password?
          </NuxtLink>
          <button type="button" @click="hideLogin">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </teleport>
</template>
