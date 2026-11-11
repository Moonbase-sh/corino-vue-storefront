// Storefront options only the running app knows, read by @moonbase.sh/nuxt just
// before it creates the storefront, on the server and in the browser.
//
// The SDK keeps the ad click IDs a visitor arrived with (gclid, fbclid, …) only
// with their consent to marketing cookies, and decides what to do with them as it
// is created. So the answer the visitor gave on an earlier visit has to be here,
// not set a moment later. It lives in localStorage, so on the server it is unknown
// and the SDK follows the store's "Ad and campaign tracking" setting.
export default defineMoonbaseConfig(() => {
  const cookieConsent = useCookieConsent()
  cookieConsent.hydrate()
  return {
    attributionConsent: cookieConsent.state.value.answer ?? undefined,
  }
})
