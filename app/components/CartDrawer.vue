<script setup lang="ts">
import { formatMoney, type StorefrontOffer, useCart, useCartOffer } from '@moonbase.sh/vue'

const { state, hideCart } = useUi()
const { items, breakdown, checkout } = useCart()
const cartOffer = useCartOffer()
const route = useRoute()
const checkingOut = ref(false)

// `breakdown` adds the cart up: `original` at list prices, `subtotal` after discounts on single
// items, the cart offer's saving, and `amount`, the total the checkout starts from. Taxes, and
// coupon codes, are worked out in the checkout.
const money = (amount: number) => formatMoney(amount, breakdown.value.currency)
const itemDiscounts = computed(() => breakdown.value.original - breakdown.value.subtotal)

function offerLabel(offer: StorefrontOffer) {
  const name = offer.discount.name.trim()
  return offer.discount.type === 'PercentageOffDiscount'
    ? `${name} (${Math.round(offer.discount.percentage * 100)}% off)`
    : name
}

// The cart offer it is closest to reaching, as "Add €71 more for …"
const nextOffer = computed(() => {
  const next = cartOffer.value?.next
  if (!next)
    return null
  const remaining = next.progress.unit === 'Money'
    ? formatMoney(next.progress.remaining, next.progress.currency ?? breakdown.value.currency)
    : `${next.progress.remaining} more item${next.progress.remaining === 1 ? '' : 's'}`
  return { label: offerLabel(next.offer), remaining, fraction: next.progress.fraction }
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
          <CartUpsells />
        </div>

        <div v-if="items.length > 0" class="footer-row">
          <div v-if="nextOffer" class="offer-progress">
            <p>Add {{ nextOffer.remaining }} more for <strong>{{ nextOffer.label }}</strong></p>
            <div class="bar" role="progressbar" :aria-valuenow="Math.round(nextOffer.fraction * 100)" aria-valuemin="0" aria-valuemax="100">
              <span :style="{ width: `${Math.round(nextOffer.fraction * 100)}%` }" />
            </div>
          </div>
          <dl v-if="breakdown.amount !== breakdown.original" class="breakdown">
            <div>
              <dt>Subtotal</dt>
              <dd>{{ money(breakdown.original) }}</dd>
            </div>
            <div v-if="itemDiscounts > 0">
              <dt>Discounts</dt>
              <dd>−{{ money(itemDiscounts) }}</dd>
            </div>
            <div v-if="breakdown.cartOffer">
              <dt>{{ offerLabel(breakdown.cartOffer.offer) }}</dt>
              <dd>−{{ money(breakdown.cartOffer.discount) }}</dd>
            </div>
          </dl>
          <div class="total">
            <span class="total-label">Total</span>
            <span class="total-amount">{{ money(breakdown.amount) }}</span>
          </div>
          <p class="tax-note">
            Coupon codes and tax are handled at checkout.
          </p>
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
