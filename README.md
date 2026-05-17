# Corino

A reference implementation of the [`@moonbase.sh/vue`](https://www.npmjs.com/package/@moonbase.sh/vue) SDK on Nuxt 4, dressed up as the storefront of **Corino Studio** — a fictional Oslo-based audio-plugin company selling two plugins (HALO, a saturator, and DRIFT, a granular reverb) plus a bundle.

It shows what a real, server-rendered Vue site built on Moonbase looks like end-to-end: marketing landing page, cart, checkout, account area, product downloads, license activation, and voucher redemption — all wired with SDK composables, with the catalog and user state hydrated into the SSR payload so the first paint is real data, not a skeleton.

There's also a [single-page HTML version](https://github.com/moonbase-sh/corino-storefront) of the same fictional shop if you want a much smaller integration with no build step.

## What's in the box

Every flow a plugin shop needs, wired with SDK composables:

- **Landing page** with live pricing, discount badges, and an "owned → Download" CTA swap driven by `useProduct` and `useBundle`.
- **Cart drawer** with product icons, names, line totals, and a checkout button that opens Moonbase's hosted checkout overlay via `cart.checkout()`. Cleans up after itself via `onCheckoutCompleted`.
- **Login modal** using `useAuth().signIn()`.
- **Account area** at `/account` with nested Nuxt routes for profile, owned products, and voucher redemption — browser back/forward, deep links, and tab state all work the same way.
- **Product detail** at `/account/products/[id]` showing OS-aware download buttons (`useInventory().downloadProduct`), device activations with revoke (`revokeActivation`), and external licenses rendered for key codes, file downloads, and iLok deposits.
- **License activation** at `/activate` covering both activation modes: the `?token=…` online flow via `useActivationRequest`, and the offline machine-file upload via `activateProduct(token, ActivationMethod.Offline)`.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The site connects to the public `https://corino-demo.moonbase.sh` tenant by default. To point it at your own tenant, drop a `.env` next to `nuxt.config.ts`:

```env
NUXT_PUBLIC_MOONBASE_ENDPOINT=https://your-tenant.moonbase.sh
```

The product and bundle IDs (`halo`, `drift`, `duo-bundle`) are hard-coded in `BundleSection.vue`, `CartLine.vue`, and `pages/index.vue`. If you fork this for a different tenant, those are the strings to change.

## Stack

- **[Nuxt 4](https://nuxt.com)** with SSR enabled (the SDK's data round-trips through `useState`)
- **[`@moonbase.sh/vue`](https://www.npmjs.com/package/@moonbase.sh/vue)** for catalog data, auth, cart, inventory, vouchers, and activation
- Plain CSS in `app/assets/global.css` — no Tailwind, no preprocessor, no design system
- Google Fonts (Space Grotesk, JetBrains Mono, Inter)

## Project layout

```
.
├── app/
│   ├── app.vue                       # root + ?add_product=… / ?add_bundle=… deep links
│   ├── assets/global.css             # all styles
│   ├── layouts/default.vue           # nav + page slot + cart drawer + login modal
│   ├── plugins/moonbase.ts           # SDK boot (see "How it works" below)
│   ├── composables/useUi.ts          # global cart/login open state
│   ├── utils/formatCurrency.ts       # Intl-based money formatter
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
│   │   ├── LoginModal.vue            # email / password sign-in
│   │   ├── TrialDownloadModal.vue    # OS-aware free-trial download list
│   │   ├── AuthPage.vue              # shared shell for callback pages
│   │   ├── account/
│   │   │   ├── Info.vue              # name / email / password / logout
│   │   │   ├── Products.vue          # owned products list
│   │   │   ├── ProductDetail.vue     # downloads + activations + licenses
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
│       ├── sign-up.vue               # ConfirmAccount callback
│       ├── confirm-email.vue         # ConfirmEmail callback
│       ├── forgot-password.vue       # ResetPassword callback (request + reset)
│       ├── download.vue              # DownloadProduct callback
│       ├── subscriptions.vue         # ManageSubscription callback
│       ├── account.vue               # shell: header + tabs + signed-out gate
│       └── account/
│           ├── index.vue             # Account tab
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

Everything flows from one Nuxt plugin and a handful of SDK composables. The SDK is installed as a regular npm dependency and registered once at boot; from there, every component pulls live data or fires actions through the composables.

### 1. Plugin boot — `app/plugins/moonbase.ts`

```ts
const storefront = createStorefront(
  nuxtApp.$config.public.moonbaseEndpoint,
  (key, state) => useState(key, () => state),    // SSR-safe state factory
  { persistUtm: true },
)

if (import.meta.server) {
  await storefront.updateStorefront()             // hydrate catalog into SSR HTML
}
else {
  storefront.onCheckoutCompleted(() => {
    useUi().hideCart()
    storefront.closeCheckout()
  })
}

nuxtApp.vueApp.use(storefront)
```

The SDK accepts a custom state factory — passing Nuxt's `useState` means every reactive store the SDK owns (catalog, current user, cart, inventory) is serialized from the server into the client payload. The first SSR paint already has real prices, names, and login state. On the client, the SDK rehydrates from that payload instead of refetching.

On the server we `await updateStorefront()` so the catalog data is in place before render. On the client we don't need to — the SDK is reactive and will fill in as user actions arrive.

`onCheckoutCompleted` only fires in the browser, so it's inside the `else` branch.

### 2. Reactive composables

Every piece of data the UI reads comes from one of these:

| Composable | Where it's used |
| --- | --- |
| `useProduct(id)` | `PluginCard.vue`, `CartLine.vue`, `ProductDetail.vue` — live `defaultVariation.price`, `hasDiscount`, `owned`, `iconUrl`, `name` |
| `useBundle(id)` | `BundleSection.vue` — bundle pricing and discount math |
| `useCart()` | `SiteNav.vue` (badge), `CartDrawer.vue` (items + `checkout`), button handlers (`addToCart`) |
| `useAuth()` | `SiteNav.vue`, `LoginModal.vue`, `account/Info.vue` — `user`, `loaded`, `signIn`, `update`, `setPassword`, `signOut` |
| `useInventory()` | `account/ProductDetail.vue` — `getProduct`, `downloadProduct`, `getProductActivations`, `revokeActivation`, `getProductLicenses`, `activateProduct` |
| `useVoucher()` | `account/Redeem.vue` — `redeem(code)` |
| `useActivationRequest(token)` | `activation/AutoActivation.vue` — `fulfillLicense`, `fulfillTrial`, `status`, `licenseEligibility`, `trialEligibility` |

### 3. User actions

Every user-facing action calls a single SDK method. There's no command layer or action bus in between — components import the composable they need and call it directly.

| Action | SDK call |
| --- | --- |
| Add product to cart | `cart.addToCart(product.value)` then `useUi().showCart()` |
| Add bundle to cart | `cart.addToCart(bundle.value)` then `useUi().showCart()` |
| Start checkout | `cart.checkout({ redirect: false, returnUrl: route.path })` |
| Sign in | `useAuth().signIn(email, password)` |
| Sign out | `useAuth().signOut()` |
| Update profile | `useAuth().update(name, email, undefined, communicationPreferences)` |
| Change password | `useAuth().setPassword(oldPassword, newPassword)` |
| Download a product | `useInventory().downloadProduct(download)` |
| Revoke an activation | `useInventory().revokeActivation(activation)` |
| Activate (online) | `useActivationRequest(token).fulfillLicense()` or `.fulfillTrial(optIn)` |
| Activate (offline) | `useInventory().activateProduct(token, ActivationMethod.Offline)` returns a `data:` URL for the license file |
| Redeem voucher | `useVoucher().redeem(code)` |

### 4. Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page — hero, HALO + DRIFT cards, bundle, features, trust, footer |
| `/account` | Profile (name / email / newsletter / change password / log out) |
| `/account/products` | List of owned products with icon, name, and license count |
| `/account/products/[id]` | Downloads (with OS detection), device activations with revoke, external licenses (key code / file / iLok) |
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
| `ConfirmAccount` | `/sign-up` | `email`, `code` | `pages/sign-up.vue` — calls `useAuth().confirmAccount(email, code)`; offers a "Set a password" button when the response carries a `resetPasswordToken` |
| `ConfirmEmail` | `/confirm-email` | `email`, `code` | `pages/confirm-email.vue` — calls `useAuth().confirmEmail(email, code)` |
| `ConfirmEmailChange` | `/account/confirm-email-change` | `email`, `code` | `pages/account/confirm-email-change.vue` — calls `useAuth().confirmEmailChange(email, code)` |
| `ResetPassword` | `/forgot-password` | `email`, `code` | `pages/forgot-password.vue` — dual mode: shows a "new password" form when the link carries `email` and `code`; otherwise an "enter email" request form that calls `useAuth().forgotPassword(email)` |
| `DownloadProduct` | `/download` | `product_id`, `version` (optional), `key` (optional) | `pages/download.vue` — redirects authenticated users to `/account/products/[product_id]` where the OS-aware download list lives; prompts sign-in otherwise |
| `Checkout` | _(leave unset)_ | — | This app uses the embedded checkout overlay opened from the cart drawer (`cart.checkout({ redirect: false })`). The `Checkout` URL is optional — leaving it unset lets the backend fall back to its hosted checkout for any flows that need to resume an order (e.g. abandoned-cart emails) |
| `ManageSubscription` | `/subscriptions` | `subscription_id` | `pages/subscriptions.vue` — loads the subscription via `useInventory().getSubscription(id)` and shows basic detail. Corino doesn't sell subscriptions, so this is a stub — extend it for tenants that do |

All callback pages share a small `AuthPage` shell (`app/components/AuthPage.vue`) for the eyebrow + title + panel layout.

### 6. Deep-link handler

`app/app.vue` checks `route.query.add_product` and `route.query.add_bundle` on mount and adds the matching item to the cart automatically. This is what makes marketing links like `/?add_product=halo` work — drop someone into the page with the product already in their cart and the drawer open. Delete the `onMounted` block if you don't need that.

## Theming

The site's own visual language (the dark amber + blue palette, the JetBrains Mono captions, the chrome-corner markers on the plugin art) is all in `app/assets/global.css` — there's no design system to fight with.

The **hosted checkout overlay** (opened by `cart.checkout()`) is themed per-tenant in the Moonbase admin, not from this app. If you want the overlay to match your storefront, configure that in your tenant settings.

## Further reading

- [Moonbase Vue SDK docs](https://moonbase.sh/docs/storefronts/sdks/vue/) — composable reference
- [`@moonbase.sh/vue` on npm](https://www.npmjs.com/package/@moonbase.sh/vue)
- [Moonbase docs home](https://moonbase.sh/docs/)
