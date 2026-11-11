import { createStorefront, withoutHandshakeParams } from '@moonbase.sh/vue'

// Boots the Moonbase storefront client and installs it as a Vue plugin so the
// SDK composables (useAuth, useCart, useProduct, useBundle, useInventory, …)
// can be used anywhere in the app.
//
// Five things worth knowing:
//
// 1. The storefront is backed by Nuxt's `useState` so its data (catalog, user,
//    cart) is serialized from the server to the client. Without this, the
//    client would re-fetch everything on hydration and the first paint would
//    flash empty prices.
//
// 2. On the server we await `updateStorefront()` so the SSR HTML is rendered
//    with the real catalog/user state. On the client we don't need to await:
//    the SDK's reactive state hydrates from the SSR payload.
//
// 3. It runs before Nuxt's router (`order: -25`: after Nuxt restores the
//    payload at -30, before it creates the router at -20). On a phone the cart
//    sends the customer to Moonbase's own checkout page, which sends them back
//    with `?mb_intent=checkout&mb_complete=…&mb_endpoint=…`. The storefront
//    reads those as it is created and takes them out of the address. A router
//    created before it would have taken the address with them, and put them
//    back on its first navigation, so a reload would reopen the finished
//    checkout.
//
// 4. `onCheckoutCompleted` fires when the checkout completes a purchase,
//    whether it was open over the page or the customer came back from
//    Moonbase's own page. We close the cart drawer and the checkout and show
//    /order-completed.
//
// 5. The SDK keeps the ad click IDs a visitor arrived with (gclid, fbclid, …)
//    only with their consent to marketing cookies. Until they answer the
//    cookie banner, it follows the store's "Ad and campaign tracking" setting
//    in Moonbase, which the catalog reports for this visitor as
//    `cookieConsentRequired`. We pass on an answer from an earlier visit as
//    `attributionConsent`, and a new one through `setAttributionConsent()`.
export default defineNuxtPlugin({
  name: 'moonbase',
  order: -25,
  async setup(nuxtApp) {
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
      // A page rendered on request (as in `nuxt dev`) also carries the address
      // it was rendered for, and the router prefers that one, so tidy it too.
      // A generated page was rendered without the parameters.
      const renderedPath = nuxtApp.payload.path
      if (renderedPath && /[?&]mb_/.test(renderedPath)) {
        const tidy = new URL(withoutHandshakeParams(new URL(renderedPath, window.location.origin).href))
        nuxtApp.payload.path = tidy.pathname + tidy.search + tidy.hash
      }

      storefront.onCheckoutCompleted(() => nuxtApp.runWithContext(() => {
        useUi().hideCart()
        storefront.closeCheckout()
        return navigateTo('/order-completed')
      }))

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
  },
})
