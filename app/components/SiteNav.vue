<script setup lang="ts">
import { useAuth, useCart } from '@moonbase.sh/vue'

const { user, loaded } = useAuth()
const cart = useCart()
const { showCart, showLogin } = useUi()

const cartCount = computed(() =>
  cart.items.value.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
)
</script>

<template>
  <nav class="top">
    <div class="nav-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-mark" />
        CORINO
      </NuxtLink>
      <div class="nav-links">
        <a href="#plugins" class="active">Plugins</a>
        <a href="#bundle">Bundle</a>
      </div>
      <div class="nav-right">
        <button v-if="loaded && !user" type="button" class="login-btn" @click="showLogin">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
          </svg>
          Log in
        </button>
        <NuxtLink v-else-if="user" to="/account" class="login-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
          </svg>
          <span>{{ user.name || 'My account' }}</span>
        </NuxtLink>
        <button type="button" class="icon-btn" aria-label="Cart" @click="showCart">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 3h1.5l1.7 7.3a1 1 0 0 0 1 .7h5.5a1 1 0 0 0 1-.75L14 5H4.5" />
            <circle cx="6" cy="13.5" r="0.8" fill="currentColor" />
            <circle cx="11.5" cy="13.5" r="0.8" fill="currentColor" />
          </svg>
          <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>
