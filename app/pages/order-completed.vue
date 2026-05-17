<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const { user } = useAuth()
</script>

<template>
  <AuthPage eyebrow="ORDER COMPLETE" title="Thanks for your order.">
    <div class="order-complete">
      <div class="order-complete-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M13 20.5 L18 25.5 L27.5 15.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <p class="hint">
        Your purchase is confirmed. Check your email for a receipt, then sign in to your account to download your products.
      </p>

      <div class="auth-actions">
        <NuxtLink v-if="user" to="/account/products" class="submit">
          Go to my products
        </NuxtLink>
        <NuxtLink v-else to="/login" class="submit">
          Sign in
        </NuxtLink>
        <NuxtLink to="/" class="submit secondary">
          Back to home
        </NuxtLink>
      </div>
    </div>
  </AuthPage>
</template>
