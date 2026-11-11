<template>
  <div>
    <DemoBanner />
    <SiteNav />
    <slot />
    <SiteFooter />
    <CartDrawer />
    <ProductDownloadModal />
    <!-- Last, so it opens on top of the download modal, which can ask to sign in -->
    <LoginModal />
    <ClientOnly>
      <CookieBanner />
    </ClientOnly>
  </div>
</template>
