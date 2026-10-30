<template>
  <div>
    <DemoBanner />
    <SiteNav />
    <slot />
    <SiteFooter />
    <CartDrawer />
    <LoginModal />
    <ProductDownloadModal />
    <ClientOnly>
      <CookieBanner />
    </ClientOnly>
  </div>
</template>
