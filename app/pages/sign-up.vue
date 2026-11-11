<script setup lang="ts">
import { PasswordSetupRequiredError, useAuth } from '@moonbase.sh/vue'

// Two jobs, like /forgot-password: opened from the site it is the sign-up form, and opened from the
// "Confirm account" email (Moonbase appends ?email=&code=) it confirms the account.
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { signUp, confirmAccount, resetPassword, signIn } = useAuth()

const email = computed(() => (route.query.email as string | undefined) || '')
const code = computed(() => (route.query.code as string | undefined) || '')
const hasConfirmLink = computed(() => !!email.value && !!code.value)

// Moonbase hosts the store's terms and privacy policy
const termsUrl = `${config.public.moonbase.endpoint}/terms-of-use`
const privacyUrl = `${config.public.moonbase.endpoint}/privacy-policy`

// Sign-up form
const form = reactive({ name: '', email: '', password: '', newsletter: false })
const signingUp = ref(false)
const signUpError = ref<string | null>(null)
// Where the email went, and why: confirming a new account, or setting a password on one made at checkout
const checkEmail = ref<{ email: string, reason: 'confirm' | 'set-password' } | null>(null)

async function submitSignUp() {
  signingUp.value = true
  signUpError.value = null
  try {
    // The two `true`s: they accept the privacy policy and the terms, as the form says beside the button
    const result = await signUp(form.name, form.email, form.password, null, true, true, form.newsletter)
    if (result.status === 'activation-pending')
      checkEmail.value = { email: result.email, reason: 'confirm' }
    else
      await router.replace('/account')
  }
  catch (err) {
    // The address has an account without a password, made at checkout say. Moonbase emails a link,
    // and opened in this browser it sets the password they just typed.
    if (err instanceof PasswordSetupRequiredError)
      checkEmail.value = { email: form.email, reason: 'set-password' }
    else
      signUpError.value = (err as Error).message
  }
  finally {
    signingUp.value = false
  }
}

// Confirming from the email link
const status = ref<'form' | 'confirming' | 'set-password' | 'error'>('form')
const error = ref<string | null>(null)

const confirmedEmail = ref('')
const resetPasswordToken = ref('')

const newPassword = ref('')
const saving = ref(false)
const saveError = ref<string | null>(null)

onMounted(async () => {
  if (!hasConfirmLink.value)
    return
  status.value = 'confirming'
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
  <AuthPage
    :eyebrow="hasConfirmLink ? 'CONFIRM ACCOUNT' : 'SIGN UP'"
    :title="hasConfirmLink ? 'Welcome to Corino' : 'Create your account'"
  >
    <ClientOnly>
      <template v-if="status === 'form'">
        <div v-if="checkEmail" class="auth-result">
          <p class="success">
            Check your email.
          </p>
          <p v-if="checkEmail.reason === 'confirm'" class="hint">
            We sent a link to <strong>{{ checkEmail.email }}</strong>. Open it to confirm your account and sign in.
          </p>
          <p v-else class="hint">
            <strong>{{ checkEmail.email }}</strong> already has an account, from an earlier order. We sent it a link:
            open it in this browser to keep the password you just chose.
          </p>
        </div>

        <form v-else class="account-form" @submit.prevent="submitSignUp">
          <p class="hint">
            An account keeps your licenses, downloads and receipts in one place.
          </p>

          <label for="sign-up-name">Name</label>
          <input id="sign-up-name" v-model="form.name" type="text" autocomplete="name" required>

          <label for="sign-up-email">Email</label>
          <input id="sign-up-email" v-model="form.email" type="email" autocomplete="email" required>

          <label for="sign-up-password">Password</label>
          <input id="sign-up-password" v-model="form.password" type="password" autocomplete="new-password" required>

          <label class="checkbox-row">
            <input v-model="form.newsletter" type="checkbox">
            <span>Send me news about Corino's plugins</span>
          </label>

          <p class="hint">
            By creating an account you accept the <a :href="termsUrl" target="_blank" rel="noopener">terms of use</a>
            and the <a :href="privacyUrl" target="_blank" rel="noopener">privacy policy</a>.
          </p>

          <button type="submit" class="submit" :disabled="signingUp">
            {{ signingUp ? 'Creating account…' : 'Create account' }}
          </button>

          <p v-if="signUpError" class="error">
            {{ signUpError }}
          </p>

          <NuxtLink to="/login" class="auth-link">
            Already have an account? Sign in
          </NuxtLink>
        </form>
      </template>

      <p v-else-if="status === 'confirming'" class="empty">
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
