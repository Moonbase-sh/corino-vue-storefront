<script setup lang="ts">
import { formatMoney, type StorefrontProduct, useBundle, useCart, useProduct } from '@moonbase.sh/vue'

const bundleId = 'duo-bundle'
const haloId = 'halo'
const driftId = 'drift'

const bundle = useBundle(bundleId)
const halo = useProduct(haloId)
const drift = useProduct(driftId)
const cart = useCart()
const { showCart } = useUi()

const currency = computed(() => cart.currency.value)

// A price list has an amount per currency the store sells in. Until the catalog has one in the
// cart's currency, keep the price the page was written with.
function inCurrency(prices: Record<string, number> | undefined, fallback: string) {
  const amount = prices?.[currency.value]
  return amount === undefined ? fallback : formatMoney(amount, currency.value)
}

// Called from the template, where `halo` and `drift` are already unwrapped to the product
function price(p: StorefrontProduct | null, fallback: string) {
  return inCurrency(p?.defaultVariation?.price, fallback)
}
function original(p: StorefrontProduct | null, fallback: string) {
  return inCurrency(p?.defaultVariation?.originalPrice, fallback)
}

const bundleVariation = computed(() => bundle.value?.defaultVariation || null)
const bundlePrice = computed(() => inCurrency(bundleVariation.value?.price, '$249'))
const bundleHasDiscount = computed(() => !!bundleVariation.value?.hasDiscount)
const bundleDiscountTotal = computed(() => {
  const original = bundleVariation.value?.originalPrice[currency.value]
  const price = bundleVariation.value?.price[currency.value]
  if (original === undefined || price === undefined)
    return '$29'
  return formatMoney(original - price, currency.value)
})

function addBundleToCart() {
  if (!bundle.value)
    return
  // 'replace' takes out HALO or DRIFT lines already in the cart, which the bundle includes,
  // instead of selling them twice
  cart.addToCart(bundle.value, undefined, undefined, { bundleBehaviour: 'replace' })
  showCart()
}
</script>

<template>
  <div id="bundle" class="section-head">
    <div class="section-num">[02 / BUNDLE]</div>
    <div class="section-title">Save 38% when you take both.</div>
    <div class="section-aside">PAGE 03 OF 04</div>
  </div>
  <section class="bundle">
    <div class="bundle-inner">
      <div>
        <div
          class="mono"
          style="font-size: 11px; color: var(--fg-3); margin-bottom: 16px; letter-spacing: 0.08em;"
        >
          STUDIO BUNDLE · S/N 002
        </div>
        <h2>Own <span class="both">both plugins.</span><br>Save 38%.</h2>
        <p>
          HALO and DRIFT together at a single price. One checkout, separate licenses for each plugin,
          lifetime updates across both. The complete tone &amp; space pairing.
        </p>
        <ul class="bundle-bullets">
          <li>
            <span class="check">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7.5L6 10.5L11.5 4" />
              </svg>
            </span>
            Both plugins, all formats
          </li>
          <li>
            <span class="check">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7.5L6 10.5L11.5 4" />
              </svg>
            </span>
            Lifetime updates · v3.x roadmap included
          </li>
          <li>
            <span class="check">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7.5L6 10.5L11.5 4" />
              </svg>
            </span>
            3 machine license · transferable
          </li>
        </ul>
      </div>
      <div class="bundle-card">
        <div class="bundle-row">
          <span>HALO Saturator</span>
          <span>
            <span v-if="halo?.defaultVariation?.hasDiscount" class="strike">{{ original(halo, '$199') }}</span>
            <span>{{ price(halo, '$129') }}</span>
          </span>
        </div>
        <div class="bundle-row">
          <span>DRIFT Granular</span>
          <span>
            <span v-if="drift?.defaultVariation?.hasDiscount" class="strike">{{ original(drift, '$229') }}</span>
            <span>{{ price(drift, '$149') }}</span>
          </span>
        </div>
        <div v-if="bundleHasDiscount" class="bundle-row">
          <span>Bundle discount</span>
          <span class="save">−<span>{{ bundleDiscountTotal }}</span></span>
        </div>
        <div class="bundle-row total">
          <span>Studio Bundle</span>
          <span>{{ bundlePrice }}</span>
        </div>
        <button type="button" class="bundle-add" :disabled="!bundle" @click="addBundleToCart">
          ADD BUNDLE TO CART
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
          </svg>
        </button>
        <div class="bundle-fineprint">14-DAY MONEY BACK · INSTANT DOWNLOAD</div>
      </div>
    </div>
  </section>
</template>
