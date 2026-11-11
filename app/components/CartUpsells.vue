<script setup lang="ts">
import { DiscountUtils, formatMoney, MoneyCollectionUtils, useCart, useEligibleOffers } from '@moonbase.sh/vue'

// Offers set up in Moonbase that the cart qualifies for but doesn't hold yet. On the demo store,
// that is "Bundle up and save!": with HALO or DRIFT in the cart, it suggests the Duo Bundle.
const cart = useCart()
const offers = useEligibleOffers()

const upsells = computed(() => offers.value
  // Cart-wide offers ("25% off over €200") apply on their own; only item offers need a card
  .filter(offer => offer.scope === 'Item')
  .flatMap((offer) => {
    const target = offer.targets[0]
    const item = target?.item
    if (!item || item.owned)
      return []
    const variation = (target.variations.length > 0
      ? item.variations?.find(v => target.variations.includes(v.id))
      : null) ?? item.defaultVariation
    if (!variation)
      return []

    const currency = cart.currency.value
    const discounted = MoneyCollectionUtils.subtract(variation.price, DiscountUtils.apply(offer.discount, variation.price))
    const price = discounted[currency]
    if (price === undefined)
      return []

    // A bundle takes the place of the products it includes that are already in the cart
    const replaces = item.type === 'Bundle'
      ? item.products
          .filter(p => p.included !== false && cart.items.value.some(line => line.type === 'Product' && line.productId === p.id))
          .map(p => p.name)
      : []

    return [{
      offer,
      item,
      variation,
      price: formatMoney(price, currency),
      original: price < (variation.price[currency] ?? price) ? formatMoney(variation.price[currency]!, currency) : null,
      replaces,
    }]
  }))

function add(upsell: typeof upsells.value[number]) {
  cart.addToCart(upsell.item, upsell.variation, upsell.offer, { bundleBehaviour: 'replace' })
}
</script>

<template>
  <section v-if="upsells.length > 0" class="cart-upsells" aria-label="Offers">
    <div v-for="upsell in upsells" :key="upsell.offer.id" class="cart-upsell">
      <div class="cart-line-icon">
        <img v-if="upsell.item.iconUrl" :src="upsell.item.iconUrl" :alt="upsell.item.name">
      </div>
      <div class="cart-upsell-meta">
        <span class="offer-name">{{ upsell.offer.discount.name.trim() }}</span>
        <span class="name">{{ upsell.item.name }}</span>
        <span v-if="upsell.replaces.length" class="hint">Replaces {{ upsell.replaces.join(' and ') }} in your cart</span>
      </div>
      <div class="cart-upsell-buy">
        <span class="price">
          <s v-if="upsell.original">{{ upsell.original }}</s>
          {{ upsell.price }}
        </span>
        <button type="button" @click="add(upsell)">
          {{ upsell.replaces.length ? 'Switch' : 'Add' }}
        </button>
      </div>
    </div>
  </section>
</template>
