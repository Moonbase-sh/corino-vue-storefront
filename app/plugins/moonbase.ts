import { createStorefront } from '@moonbase.sh/vue'

// Boots the Moonbase storefront client and installs it as a Vue plugin so the
// SDK composables (useAuth, useCart, useProduct, useBundle, useInventory, …)
// can be used anywhere in the app.
//
// Three things worth knowing:
//
// 1. The storefront is backed by Nuxt's `useState` so its data (catalog, user,
//    cart) is serialized from the server to the client. Without this, the
//    client would re-fetch everything on hydration and the first paint would
//    flash empty prices.
//
// 2. On the server we await `updateStorefront()` so the SSR HTML is rendered
//    with the real catalog/user state. On the client we don't need to await —
//    the SDK's reactive state hydrates from the SSR payload.
//
// 3. `onCheckoutCompleted` fires after the Moonbase-hosted checkout overlay
//    completes a purchase. We close the cart drawer and the overlay so the
//    user lands back on the page in a clean state.
export default defineNuxtPlugin(async (nuxtApp) => {
  const storefront = createStorefront(
    nuxtApp.$config.public.moonbaseEndpoint as string,
    (key, state) => useState(key, () => state),
    { persistUtm: true },
  )

  if (import.meta.server) {
    await storefront.updateStorefront()
  }
  else {
    storefront.onCheckoutCompleted(() => {
      const ui = useUi()
      ui.hideCart()
      storefront.closeCheckout()
    })
  }

  nuxtApp.vueApp.use(storefront)
})
