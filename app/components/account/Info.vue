<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const { user, update, setPassword, signOut } = useAuth()
const router = useRouter()

const name = ref(user.value?.name ?? '')
const email = ref(user.value?.email ?? '')
const newsletterOptIn = ref(user.value?.communicationPreferences?.newsletterOptIn ?? false)
const productUpdatesOptIn = ref(user.value?.communicationPreferences?.productUpdatesOptIn ?? false)

const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
const emailNeedsConfirmation = ref(false)

watch(user, (u) => {
  if (!u)
    return
  name.value = u.name ?? ''
  email.value = u.email ?? ''
  newsletterOptIn.value = u.communicationPreferences?.newsletterOptIn ?? false
  productUpdatesOptIn.value = u.communicationPreferences?.productUpdatesOptIn ?? false
})

async function save() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  emailNeedsConfirmation.value = false
  try {
    const result = await update(name.value, email.value, undefined, {
      newsletterOptIn: newsletterOptIn.value,
      productUpdatesOptIn: productUpdatesOptIn.value,
    })
    saveSuccess.value = true
    if (result.needsEmailConfirmationToken)
      emailNeedsConfirmation.value = true
  }
  catch (err) {
    saveError.value = (err as Error).message
  }
  finally {
    saving.value = false
  }
}

const oldPassword = ref('')
const newPassword = ref('')
const passwordSaving = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

async function changePassword() {
  passwordSaving.value = true
  passwordError.value = null
  passwordSuccess.value = false
  try {
    await setPassword(oldPassword.value, newPassword.value)
    oldPassword.value = ''
    newPassword.value = ''
    passwordSuccess.value = true
  }
  catch (err) {
    passwordError.value = (err as Error).message
  }
  finally {
    passwordSaving.value = false
  }
}

async function logOut() {
  await signOut()
  router.push('/')
}
</script>

<template>
  <div class="account-section">
    <form class="account-form" @submit.prevent="save">
      <h3>Profile</h3>

      <label for="account-name">Full name</label>
      <input id="account-name" v-model="name" type="text" autocomplete="name" required>

      <label for="account-email">Email</label>
      <input id="account-email" v-model="email" type="email" autocomplete="email" required>

      <label class="checkbox-row">
        <input v-model="newsletterOptIn" type="checkbox">
        <span>Receive updates and offers by email</span>
      </label>

      <label class="checkbox-row">
        <input v-model="productUpdatesOptIn" type="checkbox">
        <span>Receive product updates by email</span>
      </label>

      <button type="submit" class="submit" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save changes' }}
      </button>

      <p v-if="saveError" class="error">
        {{ saveError }}
      </p>
      <p v-else-if="emailNeedsConfirmation" class="notice">
        Please check your inbox to confirm your new email address.
      </p>
      <p v-else-if="saveSuccess" class="success">
        Saved.
      </p>
    </form>

    <form class="account-form" @submit.prevent="changePassword">
      <h3>Change password</h3>

      <label for="account-old-password">Current password</label>
      <input
        id="account-old-password"
        v-model="oldPassword"
        type="password"
        autocomplete="current-password"
        required
      >

      <label for="account-new-password">New password</label>
      <input
        id="account-new-password"
        v-model="newPassword"
        type="password"
        autocomplete="new-password"
        required
      >

      <button type="submit" class="submit" :disabled="passwordSaving">
        {{ passwordSaving ? 'Saving…' : 'Change password' }}
      </button>

      <p v-if="passwordError" class="error">
        {{ passwordError }}
      </p>
      <p v-else-if="passwordSuccess" class="success">
        Password changed.
      </p>
    </form>

    <button type="button" class="logout" @click="logOut">
      Log out
    </button>
  </div>
</template>
