<script setup lang="ts">
import { useCart } from '@moonbase.sh/vue'

const { state, hideCart } = useUi()
const { items, total, currency, checkout } = useCart()
const route = useRoute()
const checkingOut = ref(false)

const totalLabel = computed(() => {
  const t = total.value
  if (!t)
    return formatCurrency(0, currency.value)
  return formatCurrency(t.amount, t.currency)
})

async function initCheckout() {
  try {
    checkingOut.value = true
    await checkout({ redirect: false, returnUrl: route.path })
  }
  catch (err) {
    console.error('Could not checkout', err)
  }
  finally {
    checkingOut.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <Transition name="drawer-mask">
      <div v-if="state.cartOpen" class="drawer-mask" @click="hideCart" />
    </Transition>
    <Transition name="drawer">
      <aside v-if="state.cartOpen" class="drawer" @click.stop>
        <header>
          <h2>Basket</h2>
          <button class="close-btn" type="button" aria-label="Close" @click="hideCart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="items">
          <p v-if="items.length === 0" class="empty">
            Your cart is empty.
          </p>
          <CartLine
            v-for="item in items"
            :key="item.id"
            :item="item"
          />
        </div>

        <div v-if="items.length > 0" class="footer-row">
          <div class="total">
            <span class="total-label">Total</span>
            <span class="total-amount">{{ totalLabel }}</span>
          </div>
          <button
            type="button"
            class="checkout-btn"
            :disabled="checkingOut"
            @click="initCheckout"
          >
            {{ checkingOut ? 'Loading…' : 'Checkout' }}
          </button>
        </div>
      </aside>
    </Transition>
  </teleport>
</template>
