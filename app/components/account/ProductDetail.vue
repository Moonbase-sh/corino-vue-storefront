<script setup lang="ts">
import { type Activation, type Download, type License, type OwnedProduct, Platform, useInventory } from '@moonbase.sh/vue'

const props = defineProps<{
  productId: string
}>()

const { getProduct, downloadProduct, getProductActivations, getProductLicenses, revokeActivation } = useInventory()

const product = ref<OwnedProduct | null>(null)
const loadError = ref<string | null>(null)
const downloading = ref<Set<string>>(new Set())
const revoking = ref<Set<string>>(new Set())

const activations = ref<Activation[] | null>(null)
const licenses = ref<License[] | null>(null)

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

const totalLicenses = computed(() =>
  (product.value?.numberOfLicenses ?? 0) + (product.value?.subscriptionLicenses ?? 0),
)

function formatBytes(bytes: number) {
  if (!bytes)
    return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(value: string | Date | null | undefined) {
  if (!value)
    return ''
  const d = new Date(value)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadAll() {
  currentPlatform.value = detectPlatform()
  try {
    product.value = await getProduct(props.productId)
  }
  catch (err) {
    loadError.value = (err as Error).message
    return
  }

  const p = product.value
  if (!p)
    return

  if (p.maxActivations) {
    let resp = await getProductActivations(p.id)
    activations.value = [...resp.items]
    while (resp.hasMore && resp.next) {
      resp = await getProductActivations(p.id, resp.next)
      activations.value.push(...resp.items)
    }
  }
  if (p.externalLicenses) {
    let resp = await getProductLicenses(p.id)
    licenses.value = [...resp.items]
    while (resp.hasMore && resp.next) {
      resp = await getProductLicenses(p.id, resp.next)
      licenses.value.push(...resp.items)
    }
  }
}

onMounted(loadAll)

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

async function revoke(activation: Activation) {
  revoking.value.add(activation.id)
  try {
    await revokeActivation(activation)
    if (activations.value)
      activations.value = activations.value.filter(a => a.id !== activation.id)
    if (product.value)
      product.value.currentActivations = Math.max(0, (product.value.currentActivations ?? 1) - 1)
  }
  catch (err) {
    console.error('Revoke failed', err)
  }
  finally {
    revoking.value.delete(activation.id)
  }
}
</script>

<template>
  <div class="product-detail">
    <NuxtLink to="/account/products" class="back">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" />
      </svg>
      Back to products
    </NuxtLink>

    <p v-if="loadError" class="error">
      {{ loadError }}
    </p>
    <p v-else-if="!product" class="empty">
      Loading…
    </p>

    <template v-else>
      <header class="product-detail-head">
        <div class="product-icon large">
          <img v-if="product.iconUrl" :src="product.iconUrl" :alt="product.name">
        </div>
        <div>
          <h3>{{ product.name }}</h3>
          <p v-if="product.version" class="hint">
            Version {{ product.version }}
          </p>
        </div>
      </header>

      <!-- Downloads -->
      <section class="detail-section">
        <h4>Downloads</h4>
        <p
          v-if="product.releaseDescription"
          class="release-notes"
        >
          {{ product.releaseDescription }}
        </p>

        <p
          v-if="(product.downloadsNeedsOwnership || product.downloadsNeedsUser) && totalLicenses === 0"
          class="empty"
        >
          This product requires ownership to download.
        </p>
        <p v-else-if="sortedDownloads.length === 0" class="empty">
          No downloadable files for this product.
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
      </section>

      <!-- Licenses -->
      <section class="detail-section">
        <h4>
          Licenses
          <span v-if="product.maxActivations" class="hint">
            {{ product.currentActivations ?? 0 }} of {{ product.maxActivations }} seats used
          </span>
        </h4>

        <p v-if="totalLicenses === 0" class="empty">
          You don't own any licenses for this product yet.
        </p>
        <template v-else>
          <p v-if="product.numberOfLicenses" class="license-summary">
            You own {{ product.numberOfLicenses }} license{{ product.numberOfLicenses === 1 ? '' : 's' }}.
          </p>
          <p v-if="product.subscriptionLicenses" class="license-summary">
            You have {{ product.subscriptionLicenses }} subscription license{{ product.subscriptionLicenses === 1 ? '' : 's' }}.
          </p>

          <div v-if="product.maxActivations && activations" class="activation-list">
            <p v-if="activations.length === 0" class="empty">
              No active devices yet.
            </p>
            <div
              v-for="activation in activations"
              :key="activation.id"
              class="activation-row"
            >
              <div>
                <span class="caption">Device</span>
                <span class="name">{{ activation.name }}</span>
              </div>
              <div>
                <span class="caption">Method</span>
                <span class="value">{{ activation.activationMethod }}</span>
              </div>
              <div v-if="activation.firstValidatedAt">
                <span class="caption">First activated</span>
                <span class="value">{{ formatDate(activation.firstValidatedAt) }}</span>
              </div>
              <button
                type="button"
                class="revoke-btn"
                :disabled="revoking.has(activation.id)"
                @click="revoke(activation)"
              >
                {{ revoking.has(activation.id) ? 'Revoking…' : 'Revoke' }}
              </button>
            </div>
          </div>

          <div v-if="product.externalLicenses && licenses && licenses.length > 0" class="license-list">
            <div
              v-for="license in licenses"
              :key="license.id"
              class="license-row"
            >
              <div class="license-row-head">
                <span class="caption">{{ product.name }} license</span>
                <span
                  v-if="!license.externalFulfillment && !license.requiredConnectedAccount"
                  class="license-id"
                >{{ license.id }}</span>
              </div>

              <!-- String key code -->
              <div
                v-if="typeof license.externalFulfillment === 'string'"
                class="license-fulfillment"
              >
                <span class="caption">Key code</span>
                <code>{{ license.externalFulfillment }}</code>
              </div>

              <!-- File download -->
              <div
                v-else-if="license.externalFulfillment && (license.externalFulfillment as { type?: string }).type === 'file'"
                class="license-fulfillment"
              >
                <span class="caption">License file</span>
                <a
                  class="license-download"
                  :href="`data:${(license.externalFulfillment as { contentType: string }).contentType};base64,${(license.externalFulfillment as { data: string }).data}`"
                  :download="(license.externalFulfillment as { fileName: string }).fileName"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M7 2v8M4 7.5L7 10.5l3-3M2.5 12h9" />
                  </svg>
                  Download {{ (license.externalFulfillment as { fileName: string }).fileName }}
                </a>
              </div>

              <!-- iLok deposit -->
              <div
                v-else-if="license.externalFulfillment && (license.externalFulfillment as { type?: string }).type === 'iLok'"
                class="license-fulfillment ilok"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>Deposited to your iLok account</span>
              </div>

              <p v-if="license.fulfillmentMessage" class="license-message">
                {{ license.fulfillmentMessage }}
              </p>
            </div>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
