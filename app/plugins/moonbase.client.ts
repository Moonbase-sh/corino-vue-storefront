// @moonbase.sh/nuxt creates the storefront (see nuxt.config.ts and
// app/moonbase.config.ts). This plugin, which runs after it, wires what is
// Corino's own: the cart and checkout on completion, and the cookie banner.
export default defineNuxtPlugin((nuxtApp) => {
  // A plugin's own argument is typed without other plugins' injections, so
  // take `$moonbase` from useNuxtApp(), which has them.
  const { $moonbase } = useNuxtApp()
  const cookieConsent = useCookieConsent()

  // Fires when the checkout completes a purchase, whether it was open over the
  // page or the customer came back from Moonbase's own checkout page, where the
  // module reopens it. It is called from a browser event, outside the app's
  // context, so `runWithContext` gives composables and navigateTo what they need.
  $moonbase.onCheckoutCompleted(() => nuxtApp.runWithContext(() => {
    useUi().hideCart()
    $moonbase.closeCheckout()
    return navigateTo('/order-completed')
  }))

  // The catalog in the SSR payload was fetched at build time, so its
  // `cookieConsentRequired` is about the build server's location. This fires
  // for the ones the browser loads for this visitor.
  $moonbase.onStorefrontUpdated((catalog) => {
    cookieConsent.state.value.required = catalog.cookieConsentRequired !== false
  })

  // An answer given now, on the banner or from "Cookie settings". One from an
  // earlier visit is passed when the storefront is created (moonbase.config.ts).
  watch(() => cookieConsent.state.value.answer, (granted) => {
    if (granted !== null)
      $moonbase.setAttributionConsent(granted)
  })
})
