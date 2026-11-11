# Corino

A reference implementation of the [`@moonbase.sh/vue`](https://www.npmjs.com/package/@moonbase.sh/vue) SDK on Nuxt 4, dressed up as the storefront of **Corino Studio** — a fictional Oslo-based audio-plugin company selling two plugins (HALO, a saturator, and DRIFT, a granular reverb) plus a bundle.

It shows what a real, server-rendered Vue site built on Moonbase looks like end-to-end: marketing landing page, cart, checkout, account area, product downloads, license activation, and voucher redemption — all wired with SDK composables, with the catalog and user state hydrated into the SSR payload so the first paint is real data, not a skeleton.

There's also a [single-page HTML version](https://github.com/moonbase-sh/corino-storefront) of the same fictional shop if you want a much smaller integration with no build step.

## What's in the box

Every flow a plugin shop needs, wired with SDK composables:

- **Landing page** with live pricing, discount badges, and an "owned → Download" CTA swap driven by `useProduct` and `useBundle`.
- **Cart drawer** with product icons, names, line totals, and a checkout button: `cart.checkout({ redirect: 'auto' })` opens Moonbase's checkout over the page on a computer, and sends a phone to Moonbase's own checkout page, where Apple Pay and Google Pay work. Cleans up after itself via `onCheckoutCompleted` either way.
- **Offers in the cart**: the totals broken down with `cart.breakdown` (discounts and the cart offer's saving on their own rows), how far the cart is from the next cart offer with `useCartOffer()` ("Add €71 more for Big Spender"), and item offers it qualifies for with `useEligibleOffers()`, such as switching HALO for the Duo Bundle. A bundle added to the cart replaces the products it includes (`bundleBehaviour: 'replace'`).
- **Sign-in and sign-up**: a login modal using `useAuth().signIn()`, and a sign-up form at `/sign-up` using `signUp()`, including the email confirmation it can wait on and an address that already has an account from checkout.
- **Account area** at `/account` with nested Nuxt routes for profile, owned products, purchase history with PDF receipts, and voucher redemption. Browser back/forward, deep links, and tab state all work the same way.
- **Product detail** at `/account/products/[id]` showing OS-aware download buttons (`useInventory().downloadProduct`), device activations with revoke (`revokeActivation`), and external licenses rendered for key codes, file downloads, and iLok deposits.
- **License activation** at `/activate` covering both activation modes: the `?token=…` online flow via `useActivationRequest`, and the offline machine-file upload via `activateProduct(token, ActivationMethod.Offline)`.
- **Cookie consent** banner that asks only the visitors the store needs consent from, and tells the SDK their answer with `setAttributionConsent()` so it knows whether to keep the ad click IDs they arrived with.

## Run it locally

```bash
npm install
npm run dev
```

`npm run typecheck` type-checks the app with `vue-tsc`.

Then open <http://localhost:3000>.

The site connects to the public `https://corino-demo.moonbase.sh` tenant by default. To point it at your own tenant, drop a `.env` next to `nuxt.config.ts`:

```env
NUXT_PUBLIC_MOONBASE_ENDPOINT=https://your-tenant.moonbase.sh
```

The product and bundle IDs (`halo`, `drift`, `duo-bundle`) are hard-coded in `BundleSection.vue`, `CartLine.vue`, and `pages/index.vue`. If you fork this for a different tenant, those are the strings to change.

## Deployment

The site is hosted on [Vercel](https://vercel.com) (project `corino-vue-storefront` in the Moonbase team) at <https://corino-vue.moonbase.sh>. Every push to `main` deploys to production, and every pull request gets a preview deployment.

[`vercel.json`](vercel.json) holds the build: `npm ci`, then `npm run generate` (a static site, with Nitro's `static` preset) served from `.output/public`. The home page and the other prerendered pages are files of their own. The account area and the email callback pages render in the browser only (`ssr: false` in `nuxt.config.ts`), and `/account/*` paths that have no file, like `/account/products/[id]`, are served Nuxt's `200.html` shell.

Moonbase only answers a site on its allow list, so a preview deployment's `*.vercel.app` address can't load the catalog or sign in until it is added under Account settings > Storefront > "Domain configuration" in the Moonbase account.

To deploy your own fork, import the repo into Vercel (the settings come from `vercel.json`), set `NUXT_PUBLIC_MOONBASE_ENDPOINT` to your store if it isn't the one in `nuxt.config.ts`, and add the site's address to your store's domain configuration. Any static host works too: serve `.output/public`, and answer paths with no file with `200.html`.

## Stack

- **[Nuxt 4](https://nuxt.com)** with SSR enabled (the SDK's data round-trips through `useState`)
- **[`@moonbase.sh/nuxt`](https://www.npmjs.com/package/@moonbase.sh/nuxt)**, which sets up **[`@moonbase.sh/vue`](https://www.npmjs.com/package/@moonbase.sh/vue)** for catalog data, auth, cart, inventory, order history, vouchers, activation, and price formatting
- Hosted on Vercel as a static site
- Plain CSS in `app/assets/global.css` — no Tailwind, no preprocessor, no design system
- Google Fonts (Space Grotesk, JetBrains Mono, Inter)

## Project layout

```
.
├── app/
│   ├── app.vue                       # root + ?add_product=… / ?add_bundle=… deep links
│   ├── assets/global.css             # all styles
│   ├── layouts/default.vue           # nav + page slot + cart drawer + login modal
│   ├── moonbase.config.ts            # storefront options only the browser knows (cookie answer)
│   ├── plugins/moonbase.client.ts    # checkout completion + cookie banner hooks
│   ├── composables/useUi.ts          # global cart/login open state
│   ├── composables/useCookieConsent.ts  # cookie banner state + remembered answer
│   ├── components/
│   │   ├── DemoBanner.vue            # "this is a demo" strip
│   │   ├── SiteNav.vue               # auth-aware nav with cart badge
│   │   ├── SiteFooter.vue
│   │   ├── HeroSection.vue           # animated spectrum bars
│   │   ├── PluginCard.vue            # reusable card, used by HALO + DRIFT
│   │   ├── HaloArt.vue / DriftArt.vue
│   │   ├── BundleSection.vue
│   │   ├── FeaturesSection.vue
│   │   ├── TrustSection.vue
│   │   ├── CartDrawer.vue            # right-side cart + checkout button
│   │   ├── CartLine.vue              # icon + name + price line
│   │   ├── CartUpsells.vue           # offers the cart qualifies for (useEligibleOffers)
│   │   ├── LoginModal.vue            # email / password sign-in
│   │   ├── ProductDownloadModal.vue  # OS-aware trial + owned downloads, gated on downloadsAllowed
│   │   ├── CookieBanner.vue          # ad tracking consent, reopened from the footer
│   │   ├── AuthPage.vue              # shared shell for callback pages
│   │   ├── account/
│   │   │   ├── Info.vue              # name / email / password / logout
│   │   │   ├── Products.vue          # owned products list
│   │   │   ├── ProductDetail.vue     # downloads + activations + licenses
│   │   │   ├── Purchases.vue         # order history + PDF receipts
│   │   │   └── Redeem.vue            # voucher redemption form
│   │   └── activation/
│   │       ├── AutoActivation.vue    # ?token= flow (buy / sign in / trial)
│   │       ├── ManualActivation.vue  # offline machine-file upload
│   │       ├── DeviceTokenInput.vue  # drag-and-drop file input
│   │       └── ProductCard.vue       # product header used by both flows
│   └── pages/
│       ├── index.vue                 # landing page
│       ├── activate.vue              # license activation (auto + manual)
│       ├── login.vue                 # LogIn callback
│       ├── sign-up.vue               # sign-up form + ConfirmAccount callback
│       ├── confirm-email.vue         # ConfirmEmail callback
│       ├── forgot-password.vue       # ResetPassword callback (request + reset)
│       ├── download.vue              # DownloadProduct callback
│       ├── subscriptions.vue         # ManageSubscription callback
│       ├── account.vue               # shell: header + tabs + signed-out gate
│       └── account/
│           ├── index.vue             # Account tab
│           ├── purchases.vue         # Purchases tab
│           ├── redeem.vue            # Redeem tab
│           ├── confirm-email-change.vue  # ConfirmEmailChange callback (standalone)
│           └── products/
│               ├── index.vue         # Products list
│               └── [id].vue          # Product detail
├── public/assets/                    # plugin artwork (SVG + PNG)
├── nuxt.config.ts
└── package.json
```

## How it works

Everything flows from the `@moonbase.sh/nuxt` module and a handful of SDK composables. The module creates the storefront once at boot; from there, every component pulls live data or fires actions through the composables.

### 1. Setup: `@moonbase.sh/nuxt`

The [Nuxt module](https://www.npmjs.com/package/@moonbase.sh/nuxt) creates the storefront, so `nuxt.config.ts` only names the store:

```ts
export default defineNuxtConfig({
  modules: ['@moonbase.sh/nuxt'],
  moonbase: {
    endpoint: 'https://corino-demo.moonbase.sh',   // NUXT_PUBLIC_MOONBASE_ENDPOINT overrides it
    persistUtm: true,
  },
})
```

The module creates the storefront with Nuxt's `useState` as its state factory, so the catalog, the signed-in customer and the cart are serialized from the server into the page, and the first paint already has real prices, names and login state. On the server it waits for the catalog before rendering. It auto-imports the composables (`useCart`, `useProduct`, `useAuth`, …) and `formatMoney`; this site still imports them from `@moonbase.sh/vue` explicitly, so each file says where they come from.

It also creates the storefront before Nuxt's router starts. On a phone, the cart sends the customer to Moonbase's own checkout page, which sends them back with `?mb_intent=checkout&mb_complete=…&mb_endpoint=…`. The storefront reads those as it is created, reopens the finished checkout over the page, and takes them out of the address. Created any later, the router would put them back, and a reload or Back would reopen the finished checkout.

Options only the browser knows go in [`app/moonbase.config.ts`](app/moonbase.config.ts), which the module calls just before it creates the storefront. Corino passes the visitor's answer to the cookie banner from an earlier visit there (see [Cookie consent](#7-cookie-consent)):

```ts
export default defineMoonbaseConfig(() => {
  const cookieConsent = useCookieConsent()
  cookieConsent.hydrate()
  return { attributionConsent: cookieConsent.state.value.answer ?? undefined }
})
```

The site's own reactions live in [`app/plugins/moonbase.client.ts`](app/plugins/moonbase.client.ts), which runs after the module and takes the storefront from `useNuxtApp().$moonbase`. `onCheckoutCompleted` fires whether the checkout was open over the page or the customer came back from Moonbase's page, and it is called from a browser event, so `runWithContext` gives `navigateTo` the app's context:

```ts
const { $moonbase } = useNuxtApp()

$moonbase.onCheckoutCompleted(() => nuxtApp.runWithContext(() => {
  useUi().hideCart()
  $moonbase.closeCheckout()
  return navigateTo('/order-completed')
}))
```

### 2. Reactive composables

Every piece of data the UI reads comes from one of these:

| Composable | Where it's used |
| --- | --- |
| `useProduct(id)` | `PluginCard.vue`, `CartLine.vue`, `ProductDetail.vue` — live `defaultVariation.price`, `hasDiscount`, `owned`, `iconUrl`, `name` |
| `useBundle(id)` | `BundleSection.vue` — bundle pricing and discount math |
| `useCart()` | `SiteNav.vue` (badge), `CartDrawer.vue` (`items`, `breakdown`, `checkout`), button handlers (`addToCart`) |
| `useCartOffer()` | `CartDrawer.vue`: the cart offer it is closest to reaching, with its progress |
| `useEligibleOffers()` | `CartUpsells.vue`: item offers the cart qualifies for but doesn't hold yet |
| `useAuth()` | `SiteNav.vue`, `LoginModal.vue`, `pages/sign-up.vue`, `account/Info.vue`: `user`, `loaded`, `signIn`, `signUp`, `confirmAccount`, `update`, `setPassword`, `signOut` |
| `useInventory()` | `account/ProductDetail.vue` — `getProduct`, `downloadProduct`, `getProductActivations`, `revokeActivation`, `getProductLicenses`, `activateProduct` |
| `useOrders()` | `account/Purchases.vue`: `getOrders` (a page at a time, following `next`), `downloadReceipt` |
| `useVoucher()` | `account/Redeem.vue` — `redeem(code)` |
| `useActivationRequest(token)` | `activation/AutoActivation.vue` — `fulfillLicense`, `fulfillTrial`, `status`, `licenseEligibility`, `trialEligibility` |

`useProduct`, `useBundle` and `useOffer` also take a ref or a getter and follow it. `CartLine.vue` uses that to look up whichever kind of line it renders, `useProduct(() => props.item.type === 'Product' ? props.item.productId : '')`, and `AutoActivation.vue` to follow the product of the activation request once it loads. Call them once in `setup` rather than inside a `computed`: they find the storefront with `inject()`, which Vue only allows during setup, so a `computed` that calls one throws when something other than the render (a watcher, a click handler) reads it.

Every price on the site is written with the SDK's `formatMoney`, as `formatMoney(amount, currency)` or `formatMoney({ amount, currency })` (`PluginCard.vue`, `BundleSection.vue`, `CartLine.vue`, `CartDrawer.vue`, `AutoActivation.vue`, `account/Purchases.vue`). It writes prices the way Moonbase's checkout does, so the site and the checkout overlay agree, and for a currency `Intl` doesn't know (such as the empty one a cart has before the catalog arrives) it gives the bare amount instead of throwing out of a render.

### 3. User actions

Every user-facing action calls a single SDK method. There's no command layer or action bus in between — components import the composable they need and call it directly.

| Action | SDK call |
| --- | --- |
| Add product to cart | `cart.addToCart(product.value)` then `useUi().showCart()` |
| Add bundle to cart | `cart.addToCart(bundle.value)` then `useUi().showCart()` |
| Start checkout | `cart.checkout({ redirect: 'auto', returnUrl: route.path })` |
| Sign in | `useAuth().signIn(email, password)` |
| Sign up | `useAuth().signUp(name, email, password, null, true, true, newsletterOptIn)` |
| Take an offer | `cart.addToCart(item, variation, offer, { bundleBehaviour: 'replace' })` |
| Sign out | `useAuth().signOut()` |
| Update profile | `useAuth().update(name, email, undefined, communicationPreferences)` |
| Change password | `useAuth().setPassword(oldPassword, newPassword)` |
| Download a product | `useInventory().downloadProduct(download)` |
| Revoke an activation | `useInventory().revokeActivation(activation)` |
| Activate (online) | `useActivationRequest(token).fulfillLicense()` or `.fulfillTrial(optIn)` |
| Activate (offline) | `useInventory().activateProduct(token, ActivationMethod.Offline)` returns a `data:` URL for the license file |
| Download a receipt | `useOrders().downloadReceipt(order)` |
| Redeem voucher | `useVoucher().redeem(code)` |

### 4. Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page — hero, HALO + DRIFT cards, bundle, features, trust, footer |
| `/account` | Profile (name / email / newsletter / change password / log out) |
| `/account/products` | List of owned products with icon, name, and license count |
| `/account/products/[id]` | Downloads (with OS detection), device activations with revoke, external licenses (key code / file / iLok) |
| `/account/purchases` | Completed orders, newest first: date, what was bought, total, refund status, and a PDF receipt for each. "Show more" loads the next page |
| `/account/redeem` | Voucher code input |
| `/activate` | License activation. With `?token=…` shows the auto flow; without (or via the toggle) shows the offline machine-file upload flow |

The cart drawer and login modal are mounted globally in `layouts/default.vue` and opened from anywhere via `useUi().showCart()` / `useUi().showLogin()`.

### 5. Tenant callback URLs (custom storefront mode)

When a Moonbase tenant is in **custom storefront mode**, the backend redirects users to a set of merchant-configured URLs for activation, authentication, downloads, and order/subscription flows. The tenant settings map to the `CustomStorefrontLocations` shape in the backend. This app provides handlers for every one of them.

Configure the following paths on your tenant — the backend appends them to your storefront origin:

| Tenant setting | Path to configure | Query parameters the backend appends | Page that handles it |
| --- | --- | --- | --- |
| `AutoActivation` | `/activate` | `token` | `pages/activate.vue` — auto flow via `useActivationRequest(token)` |
| `OfflineActivation` | `/activate` | _(none)_ | `pages/activate.vue` — manual machine-file upload via `useInventory().activateProduct(token, ActivationMethod.Offline)` |
| `LogIn` | `/login` | _(none)_ | `pages/login.vue` — email/password sign-in, redirects to `/account` on success |
| `ConfirmAccount` | `/sign-up` | `email`, `code` | `pages/sign-up.vue`: with the link's parameters it calls `useAuth().confirmAccount(email, code)` and asks for a password when the response carries a `resetPasswordToken`; without them it is the sign-up form |
| `ConfirmEmail` | `/confirm-email` | `email`, `code` | `pages/confirm-email.vue` — calls `useAuth().confirmEmail(email, code)` |
| `ConfirmEmailChange` | `/account/confirm-email-change` | `email`, `code` | `pages/account/confirm-email-change.vue` — calls `useAuth().confirmEmailChange(email, code)` |
| `ResetPassword` | `/forgot-password` | `email`, `code` | `pages/forgot-password.vue` — dual mode: shows a "new password" form when the link carries `email` and `code`; otherwise an "enter email" request form that calls `useAuth().forgotPassword(email)` |
| `DownloadProduct` | `/download` | `product_id`, `version` (optional), `key` (optional) | `pages/download.vue` — redirects authenticated users to `/account/products/[product_id]` where the OS-aware download list lives; prompts sign-in otherwise |
| `Checkout` | _(leave unset)_ | | The cart drawer opens Moonbase's checkout itself (`cart.checkout({ redirect: 'auto' })`). The `Checkout` URL is optional: leaving it unset lets the backend fall back to its hosted checkout for any flows that need to resume an order (such as abandoned-cart emails) |
| `ManageSubscription` | `/subscriptions` | `subscription_id` | `pages/subscriptions.vue` — loads the subscription via `useInventory().getSubscription(id)` and shows basic detail. Corino doesn't sell subscriptions, so this is a stub — extend it for tenants that do |

All callback pages share a small `AuthPage` shell (`app/components/AuthPage.vue`) for the eyebrow + title + panel layout.

### 6. Deep-link handler

`app/app.vue` checks `route.query.add_product` and `route.query.add_bundle` on mount and adds the matching item to the cart automatically. This is what makes marketing links like `/?add_product=halo` work — drop someone into the page with the product already in their cart and the drawer open. Delete the `onMounted` block if you don't need that.

### 7. Cookie consent

The SDK picks up the UTM tags, referrer and ad click IDs (`gclid`, `fbclid`, `msclkid`, …) a visitor arrives with, and sends them with the cart, checkout and sign-up so sales can be put down to the campaign that brought them. A click ID identifies the visitor's click, so the SDK only keeps one once the visitor has agreed to marketing cookies. Without consent it still keeps the UTM tags, the referring site, and which ad platform the click came from, for the tab.

Who has to be asked is a store setting in Moonbase (Account settings > Storefront > Features > "Ad and campaign tracking": always, only outside the EEA, the UK and Switzerland, or only with cookie consent). The catalog reports the answer for each visitor as `cookieConsentRequired`, and the SDK follows it until you tell it otherwise. This app wires that to a banner:

```ts
// plugins/moonbase.client.ts
$moonbase.onStorefrontUpdated((catalog) => {
  cookieConsent.state.value.required = catalog.cookieConsentRequired !== false
})

watch(() => cookieConsent.state.value.answer, (granted) => {
  if (granted !== null)
    $moonbase.setAttributionConsent(granted)
})
```

- `CookieBanner.vue` shows when the store needs consent from this visitor and they haven't answered. "Cookie settings" in the footer opens it again, for anyone, so an answer can be changed later.
- The answer is remembered in `localStorage` and, on the next visit, passed as `attributionConsent` from `app/moonbase.config.ts` when the storefront is created, so the SDK knows it from the first page load.
- `required` is set from `onStorefrontUpdated`, not from the catalog in the SSR payload: that one was fetched when the site was generated, so it describes the build server's location, not the visitor's.

If your site already has a consent manager (Cookiebot, OneTrust, …), drop the banner and call `useNuxtApp().$moonbase.setAttributionConsent(granted)` from its marketing-consent callback instead.

## Theming

The site's own visual language (the dark amber + blue palette, the JetBrains Mono captions, the chrome-corner markers on the plugin art) is all in `app/assets/global.css` — there's no design system to fight with.

The **hosted checkout overlay** (opened by `cart.checkout()`) is themed per-tenant in the Moonbase admin, not from this app. If you want the overlay to match your storefront, configure that in your tenant settings.

## Further reading

- [Moonbase Vue SDK docs](https://moonbase.sh/docs/storefronts/sdks/vue/) — composable reference
- [`@moonbase.sh/vue` on npm](https://www.npmjs.com/package/@moonbase.sh/vue)
- [Moonbase docs home](https://moonbase.sh/docs/)
