<script setup lang="ts">
import { type Voucher, useVoucher } from '@moonbase.sh/vue'

const { redeem } = useVoucher()

const code = ref('')
const redeeming = ref(false)
const error = ref<string | null>(null)
const voucher = ref<Voucher | null>(null)

async function submit() {
  redeeming.value = true
  error.value = null
  try {
    voucher.value = await redeem(code.value)
  }
  catch (err) {
    error.value = (err as Error).message
  }
  finally {
    redeeming.value = false
  }
}

function reset() {
  voucher.value = null
  code.value = ''
  error.value = null
}
</script>

<template>
  <div class="account-section">
    <form v-if="!voucher" class="account-form" @submit.prevent="submit">
      <h3>Redeem voucher</h3>
      <p class="hint">
        Have a voucher code? Enter it below to add licenses to your account.
      </p>

      <label for="voucher-code">Voucher code</label>
      <input
        id="voucher-code"
        v-model="code"
        type="text"
        placeholder="0000-0000-0000-0000"
        required
      >

      <button type="submit" class="submit" :disabled="redeeming">
        {{ redeeming ? 'Redeeming…' : 'Redeem' }}
      </button>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>

    <div v-else class="voucher-success">
      <h3>{{ voucher.name }}</h3>
      <p v-if="voucher.description" class="hint">
        "{{ voucher.description }}"
      </p>
      <p class="success">
        Licenses have been added to your account.
      </p>
      <p class="hint">
        Code: <strong>{{ voucher.code }}</strong>
      </p>
      <button type="button" class="submit" @click="reset">
        Redeem another
      </button>
    </div>
  </div>
</template>
