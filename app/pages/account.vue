<script setup lang="ts">
import { useAuth } from '@moonbase.sh/vue'

const { user, loaded } = useAuth()
const { showLogin } = useUi()
const route = useRoute()

const tabs = [
  { path: '/account', title: 'Account', exact: true },
  { path: '/account/products', title: 'Products', exact: false },
  { path: '/account/redeem', title: 'Redeem', exact: true },
]

function isActive(tab: typeof tabs[number]) {
  if (tab.exact)
    return route.path === tab.path
  return route.path === tab.path || route.path.startsWith(`${tab.path}/`)
}

// Some child routes (e.g. /account/confirm-email-change) are auth callback pages
// that should render standalone, without the account header / tabs / sign-in gate.
const standalonePaths = ['/account/confirm-email-change']
const isStandalone = computed(() => standalonePaths.includes(route.path))
</script>

<template>
  <NuxtPage v-if="isStandalone" />
  <main v-else class="account-page">
    <div class="account-head">
      <div class="section-num">[ ACCOUNT ]</div>
      <h1>{{ user?.name || 'Your account' }}</h1>
      <p v-if="user" class="account-email">
        {{ user.email }}
      </p>
    </div>

    <ClientOnly>
      <div v-if="!loaded" class="account-loading">
        Loading…
      </div>
      <div v-else-if="!user" class="account-signed-out">
        <p>You need to be signed in to view your account.</p>
        <button type="button" class="submit" @click="showLogin">
          Sign in
        </button>
      </div>
      <div v-else class="account-tabs-wrap">
        <nav class="account-tabs" role="tablist">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            role="tab"
            :class="{ active: isActive(tab) }"
            :aria-selected="isActive(tab)"
          >
            {{ tab.title }}
          </NuxtLink>
        </nav>
        <div class="account-panel">
          <NuxtPage />
        </div>
      </div>
    </ClientOnly>

    <SiteFooter />
  </main>
</template>
