<script setup lang="ts">
const { state, open, answer } = useCookieConsent()
</script>

<template>
  <Transition name="cookie-banner">
    <div v-if="open" class="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
      <h2 id="cookie-banner-title">
        Cookies
      </h2>
      <p>
        Can we remember which ad brought you here? It helps us see which campaigns lead to sales.
        Your cart and account work the same either way.
      </p>
      <p v-if="state.answer !== null" class="current">
        You've {{ state.answer ? 'accepted' : 'declined' }}.
      </p>
      <div class="actions">
        <button type="button" class="decline" @click="answer(false)">
          Decline
        </button>
        <button type="button" class="accept" @click="answer(true)">
          Accept
        </button>
      </div>
    </div>
  </Transition>
</template>
