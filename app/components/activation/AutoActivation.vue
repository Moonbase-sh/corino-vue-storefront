<script setup lang="ts">
import { ActivationRequestStatus, useActivationRequest, useAuth, useCart, useProduct } from '@moonbase.sh/vue'

const props = defineProps<{
  token: string
}>()

const router = useRouter()
const { user, loaded: userLoaded, signOut } = useAuth()
const { showLogin } = useUi()
const cart = useCart()
const { showCart } = useUi()

const {
  activationRequest,
  loading,
  fulfilling,
  completing,
  error,
  fulfillLicense,
  fulfillTrial,
} = useActivationRequest(props.token)

const newsletterOptIn = ref(false)

// Auto-fulfill the moment the user has an eligible license — same UX as the embedded storefront.
watch(activationRequest, (req) => {
  if (
    !fulfilling.value
    && !completing.value
    && req?.status === ActivationRequestStatus.Requested
    && req?.licenseEligibility?.eligible
  ) {
    fulfillLicense()
  }
}, { deep: true })

const storefrontProduct = computed(() => {
  if (!activationRequest.value)
    return null
  return useProduct(activationRequest.value.product.id).value
})

const purchasable = computed(() => !!storefrontProduct.value?.defaultVariation)
const trial = computed(() => activationRequest.value?.trialEligibility)
const needsNewsletterOptIn = computed(() =>
  !!trial.value?.requiresNewsletterOptIn
  && !user.value?.communicationPreferences?.newsletterOptIn,
)

const ownsProduct = computed(() => {
  const req = activationRequest.value
  if (!req || !user.value)
    return false
  return (
    user.value.ownedProducts?.includes(req.product.id)
    || user.value.subscribedProducts?.includes(req.product.id)
  ) ?? false
})

function buy() {
  if (!storefrontProduct.value)
    return
  const item = cart.addToCart(storefrontProduct.value)
  cart.setQuantity(item, 1)
  showCart()
}

function viewLicenses() {
  router.push('/account')
}

function redeem() {
  router.push('/account')
}

async function logOut() {
  await signOut()
}
</script>

<template>
  <div class="auto-activation">
    <div v-if="loading || !userLoaded" class="activation-loader">
      <p>Loading activation request…</p>
    </div>

    <div v-else-if="error" class="activation-loader">
      <h2>Uh oh</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="!activationRequest" class="activation-loader">
      <h2>Uh oh</h2>
      <p>Could not find activation request</p>
    </div>

    <template v-else>
      <ActivationProductCard :product="activationRequest.product" />

      <div v-if="activationRequest.status === ActivationRequestStatus.Cancelled" class="activation-loader">
        <h2>Cancelled</h2>
        <p>This activation request was cancelled. Open your app and try again.</p>
      </div>

      <div v-else-if="fulfilling || completing" class="activation-loader">
        <p>Activating {{ activationRequest.product.name }}…</p>
      </div>

      <div v-else-if="activationRequest.status === ActivationRequestStatus.Completed" class="activation-loader">
        <h2>Done!</h2>
        <p>Your product is activated. You may close this window and return to the app.</p>
      </div>

      <div v-else class="activation-options">
        <!-- Option: Purchase -->
        <section v-if="purchasable" class="activation-option">
          <h3>Option 1 · Purchase product</h3>
          <p>
            Buy a copy of {{ storefrontProduct!.name }} for
            <strong>{{ formatCurrency(storefrontProduct!.defaultVariation!.price[cart.currency.value], cart.currency.value) }}</strong>.
          </p>
          <button type="button" class="submit" @click="buy">
            Purchase
          </button>
        </section>

        <!-- Option: Use license -->
        <section v-if="!user" class="activation-option">
          <h3>Option {{ purchasable ? '2' : '1' }} · Use license</h3>
          <p>Sign in to use a license you already own.</p>
          <button type="button" class="submit secondary" @click="showLogin">
            Sign in
          </button>
        </section>
        <section v-else-if="!ownsProduct" class="activation-option">
          <h3>Option {{ purchasable ? '2' : '1' }} · Use license</h3>
          <p>You don't own any licenses for this product.</p>
          <p class="hint">
            Signed in as {{ user.email }}. Not you?
            <button type="button" class="link" @click="logOut">
              Sign out
            </button>
          </p>
        </section>
        <section v-else class="activation-option">
          <h3>Option {{ purchasable ? '2' : '1' }} · Use license</h3>
          <p>
            You don't have free seats for this product. Free up a seat in your account or buy another license.
          </p>
          <button type="button" class="submit secondary" @click="viewLicenses">
            View licenses
          </button>
        </section>

        <!-- Option: Trial -->
        <section v-if="trial" class="activation-option">
          <h3>Option {{ purchasable ? '3' : '2' }} · Start trial</h3>

          <p v-if="trial.eligible && trial.requiresAccount && !user">
            You need to be signed in to start a trial.
          </p>
          <p v-else-if="trial.eligible && trial.existing">
            You're eligible for a {{ trial.numberOfDaysPerProduct }}-day trial.
            {{ trial.numberOfDaysRemaining }} days remaining.
          </p>
          <p v-else-if="trial.eligible">
            You're eligible for a {{ trial.numberOfDaysPerProduct }}-day trial.
          </p>
          <p v-else>
            This device or product is not eligible for a trial.
          </p>

          <button
            v-if="trial.eligible && trial.requiresAccount && !user"
            type="button"
            class="submit secondary"
            @click="showLogin"
          >
            Sign in
          </button>
          <template v-else-if="trial.eligible">
            <label v-if="needsNewsletterOptIn" class="checkbox-row">
              <input v-model="newsletterOptIn" type="checkbox">
              <span>Receive updates and offers by email (required to start a trial)</span>
            </label>
            <button
              type="button"
              class="submit secondary"
              :disabled="needsNewsletterOptIn && !newsletterOptIn"
              @click="fulfillTrial(newsletterOptIn)"
            >
              Start trial
            </button>
          </template>
        </section>

        <p class="redeem-row">
          Have a voucher code?
          <button type="button" class="link" @click="redeem">
            Redeem it
          </button>
        </p>
      </div>
    </template>
  </div>
</template>
