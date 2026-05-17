<script setup lang="ts">
const { showTrial } = useUi()
</script>

<template>
  <div>
    <HeroSection />

    <div id="plugins" class="section-head">
      <div class="section-num">[01 / PLUGINS]</div>
      <div class="section-title">The instruments — two precise tools for tone and space.</div>
      <div class="section-aside">PAGE 01—02 OF 04</div>
    </div>

    <PluginCard
      product-id="halo"
      variant="halo"
      fallback-price="$129"
      fallback-original-price="$199"
    >
      <template #art>
        <HaloArt />
      </template>
      <template #chrome>
        <div class="label">
          <span class="pulse" />HALO · v2.1 · ACTIVE
        </div>
        <div class="coord tr">
          +12.4 dB
        </div>
        <div class="coord bl">
          2nd · 3rd · 5th
        </div>
        <div class="coord br">
          SR 96k / 32f
        </div>
      </template>
      <template #meta>
        <span>CRN-001</span>
        <span class="dot">/</span>
        <span>HARMONIC SATURATOR</span>
        <span class="dot">/</span>
        <span>VST3 · AU · AAX</span>
      </template>
      <template #tagline>
        Tape, tubes &amp; transformer color in one warm box.
      </template>
      <template #desc>
        A psychoacoustic saturator built from a year of tape machine measurements. Three stages — preamp, head bump, and bias — each modeled with a per-frequency response so the lows breathe and the highs stay glassy. Push it for ten dB of glow on the mix bus, or sit it on a vocal at 1% for the kind of warmth that just gets out of the way.
      </template>
      <template #specs>
        <div class="spec">
          <div class="spec-label">STAGES</div>
          <div class="spec-value">3 + Bias</div>
        </div>
        <div class="spec">
          <div class="spec-label">OVERSAMPLING</div>
          <div class="spec-value">×16</div>
        </div>
        <div class="spec">
          <div class="spec-label">CPU @ 96k</div>
          <div class="spec-value">0.4%</div>
        </div>
        <div class="spec">
          <div class="spec-label">PRESETS</div>
          <div class="spec-value">128</div>
        </div>
      </template>
      <template #trial>
        <button type="button" class="trial-btn" @click="showTrial('halo')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M7 2v8M4 7.5L7 10.5l3-3M2.5 12h9" />
          </svg>
          Try HALO free · 14 days
        </button>
      </template>
    </PluginCard>

    <PluginCard
      product-id="drift"
      variant="drift"
      reverse
      fallback-price="$149"
      fallback-original-price="$229"
    >
      <template #art>
        <DriftArt />
      </template>
      <template #chrome>
        <div class="label">
          <span class="pulse" />DRIFT · v1.4 · LISTENING
        </div>
        <div class="coord tr">
          ∞ TAILS
        </div>
        <div class="coord bl">
          GRAINS 1024
        </div>
        <div class="coord br">
          RT60 14.2s
        </div>
      </template>
      <template #meta>
        <span>CRN-002</span>
        <span class="dot">/</span>
        <span>GRANULAR SPACE</span>
        <span class="dot">/</span>
        <span>VST3 · AU · AAX</span>
      </template>
      <template #tagline>
        A reverb that thinks in particles, not rooms.
      </template>
      <template #desc>
        DRIFT shreds incoming audio into a cloud of 1,024 grains, then suspends them in a tunable field of pitch, time and space. The result sits somewhere between reverb, delay and synthesis — perfect for ambient pads, dimensional vocals, or pulling a kick drum into a 14-second tail without losing its punch. Modulation runs internally so motion is built in, not bolted on.
      </template>
      <template #specs>
        <div class="spec">
          <div class="spec-label">GRAINS</div>
          <div class="spec-value">1024</div>
        </div>
        <div class="spec">
          <div class="spec-label">MAX TAIL</div>
          <div class="spec-value">∞</div>
        </div>
        <div class="spec">
          <div class="spec-label">PITCH RANGE</div>
          <div class="spec-value">±48 st</div>
        </div>
        <div class="spec">
          <div class="spec-label">PRESETS</div>
          <div class="spec-value">160</div>
        </div>
      </template>
      <template #trial>
        <button type="button" class="trial-btn" @click="showTrial('drift')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M7 2v8M4 7.5L7 10.5l3-3M2.5 12h9" />
          </svg>
          Try DRIFT free · 14 days
        </button>
      </template>
    </PluginCard>

    <BundleSection />
    <FeaturesSection />
    <TrustSection />
    <SiteFooter />
  </div>
</template>
