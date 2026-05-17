<script setup lang="ts">
import { type Download, type OwnedProduct, Platform, useInventory } from '@moonbase.sh/vue'

const { state, hideTrial } = useUi()
const { getProduct, downloadProduct } = useInventory()

const product = ref<OwnedProduct | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const downloading = ref<Set<string>>(new Set())

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined')
    return Platform.Universal
  const p = (navigator.platform ?? 'Unknown').toLowerCase()
  if (/mac/.test(p))
    return Platform.Mac
  if (/win/.test(p))
    return Platform.Windows
  if (/linux/.test(p))
    return Platform.Linux
  return Platform.Universal
}

const currentPlatform = ref<Platform>(Platform.Universal)
const platformOrder = [Platform.Windows, Platform.Mac, Platform.Linux, Platform.Universal]

const sortedDownloads = computed(() => {
  if (!product.value?.downloads)
    return []
  const ordered = [currentPlatform.value, ...platformOrder.filter(p => p !== currentPlatform.value)]
  return ordered.flatMap(p => product.value!.downloads!.filter(d => d.platform === p))
})

function formatBytes(bytes: number) {
  if (!bytes)
    return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

watch(() => state.value.trialProductId, async (id) => {
  if (!id) {
    product.value = null
    loadError.value = null
    return
  }
  currentPlatform.value = detectPlatform()
  loading.value = true
  loadError.value = null
  product.value = null
  try {
    product.value = await getProduct(id)
  }
  catch (err) {
    loadError.value = (err as Error).message
  }
  finally {
    loading.value = false
  }
})

async function startDownload(download: Download) {
  downloading.value.add(download.key)
  try {
    await downloadProduct(download)
  }
  catch (err) {
    console.error('Download failed', err)
  }
  finally {
    downloading.value.delete(download.key)
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="state.trialProductId" class="modal-mask" @click="hideTrial">
      <div class="modal trial-modal" @click.stop>
        <header class="trial-modal-head">
          <h2>Free trial · 14 days</h2>
          <button class="close-btn" type="button" aria-label="Close" @click="hideTrial">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <p v-if="loading" class="empty">
          Loading downloads…
        </p>

        <p v-else-if="loadError" class="error">
          {{ loadError }}
        </p>

        <template v-else-if="product">
          <div class="trial-product">
            <div class="trial-product-icon">
              <img v-if="product.iconUrl" :src="product.iconUrl" :alt="product.name">
            </div>
            <div>
              <h3>{{ product.name }}</h3>
              <p v-if="product.version" class="hint">
                Version {{ product.version }}
              </p>
            </div>
          </div>

          <p class="trial-hint">
            Download the installer for your platform. The plugin runs as a 14-day trial — no card needed, all features unlocked. Sign in inside the plugin to extend with a license.
          </p>

          <p v-if="sortedDownloads.length === 0" class="empty">
            No downloadable files available for this product yet.
          </p>
          <ul v-else class="download-list">
            <li
              v-for="download in sortedDownloads"
              :key="download.key"
              class="download-row"
              :class="{ recommended: download.platform === currentPlatform && download.platform !== Platform.Universal }"
            >
              <div>
                <span class="name">{{ download.name }}</span>
                <span class="caption">{{ download.platform }} · {{ formatBytes(download.size) }}</span>
              </div>
              <button
                type="button"
                class="download-btn"
                :class="{ primary: download.platform === currentPlatform }"
                :disabled="downloading.has(download.key)"
                @click="startDownload(download)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M7 2v8M4 7.5L7 10.5l3-3M2.5 12h9" />
                </svg>
                {{ downloading.has(download.key) ? 'Starting…' : (download.platform === Platform.Universal ? 'Download' : `Download for ${download.platform}`) }}
              </button>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </teleport>
</template>
