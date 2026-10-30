import { createStorefront } from '@moonbase.sh/vue'

// Boots the Moonbase storefront client and installs it as a Vue plugin so the
// SDK composables (useAuth, useCart, useProduct, useBundle, useInventory, …)
// can be used anywhere in the app.
//
// Four things worth knowing:
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
//
// 4. The SDK keeps the ad click IDs a visitor arrived with (gclid, fbclid, …)
//    only with their consent to marketing cookies. Until they answer the
//    cookie banner, it follows the store's "Ad and campaign tracking" setting
//    in Moonbase, which the catalog reports for this visitor as
//    `cookieConsentRequired`. We pass on an answer from an earlier visit as
//    `attributionConsent`, and a new one through `setAttributionConsent()`.
export default defineNuxtPlugin(async (nuxtApp) => {
  const cookieConsent = useCookieConsent()
  cookieConsent.hydrate()

  const storefront = createStorefront(
    nuxtApp.$config.public.moonbaseEndpoint as string,
    (key, state) => useState(key, () => state),
    {
      persistUtm: true,
      attributionConsent: cookieConsent.state.value.answer ?? undefined,
    },
  )

  if (import.meta.server) {
    await storefront.updateStorefront()
  }
  else {
    storefront.onCheckoutCompleted(() => {
      const ui = useUi()
      const router = useRouter()
      ui.hideCart()
      storefront.closeCheckout()
      router.push('/order-completed')
    })

    // The catalog in the SSR payload was fetched by the server (at build time,
    // on GitHub Pages), so its `cookieConsentRequired` is about the server's
    // location. This fires for the ones the browser loads for this visitor.
    storefront.onStorefrontUpdated((catalog) => {
      cookieConsent.state.value.required = catalog.cookieConsentRequired !== false
    })

    watch(() => cookieConsent.state.value.answer, (granted) => {
      if (granted !== null)
        storefront.setAttributionConsent(granted)
    })
  }

  nuxtApp.vueApp.use(storefront)
})
