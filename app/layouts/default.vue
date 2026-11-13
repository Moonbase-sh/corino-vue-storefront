<template>
  <div>
    <DemoBanner />
    <SiteNav />
    <slot />
    <SiteFooter />
    <CartDrawer />
    <ProductDownloadModal />
    <ReviewsModal />
    <!-- Last, so it opens on top of the download and reviews modals, which can ask to sign in -->
    <LoginModal />
    <ClientOnly>
      <CookieBanner />
    </ClientOnly>
  </div>
</template>
