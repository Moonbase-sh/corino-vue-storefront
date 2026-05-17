export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  ssr: true,

  nitro: {
    preset: 'github_pages',
  },

  runtimeConfig: {
    public: {
      moonbaseEndpoint: 'https://corino-demo.moonbase.sh',
    },
  },

  css: ['~/assets/global.css'],

  app: {
    head: {
      title: 'Corino — Sound, sculpted.',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='1' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%23F4B96B'/%3E%3Cstop offset='50%25' stop-color='%236CC0DA'/%3E%3Cstop offset='100%25' stop-color='%23F4B96B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23g)'/%3E%3Ccircle cx='11.2' cy='11.2' r='3' fill='%23F4EFE7'/%3E%3C/svg%3E",
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap',
        },
      ],
    },
  },
})
