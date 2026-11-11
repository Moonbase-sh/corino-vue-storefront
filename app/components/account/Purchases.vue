<script setup lang="ts">
import { type CompletedOrder, formatMoney, useOrders } from '@moonbase.sh/vue'

const { getOrders, downloadReceipt } = useOrders()

const orders = ref<CompletedOrder[] | null>(null)
const next = ref<string | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const downloading = ref<Set<string>>(new Set())
const receiptErrors = ref<Record<string, string>>({})

const firstPageFailed = computed(() => orders.value === null && !!loadError.value)

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

function itemsOf(order: CompletedOrder) {
  return order.items
    .map((item) => {
      const name = (item.type === 'Product' ? item.product?.name : item.bundle?.name) ?? 'Item'
      return item.quantity > 1 ? `${name} × ${item.quantity}` : name
    })
    .join(', ')
}

async function load(nextUrl?: string) {
  loadError.value = null
  loading.value = true
  try {
    let page = await getOrders(nextUrl)
    // The server filters to completed orders after paging, so a page can come back short, or even
    // empty with more after it. Trust `next`, never the item count.
    while (page.items.length === 0 && page.next)
      page = await getOrders(page.next)
    orders.value = [...(orders.value ?? []), ...page.items]
    next.value = page.next
  }
  catch (err) {
    console.error('Failed to load purchases', err)
    loadError.value = 'Could not load your purchases. Try again in a moment.'
  }
  finally {
    loading.value = false
  }
}

async function receipt(order: CompletedOrder) {
  downloading.value.add(order.id)
  delete receiptErrors.value[order.id]
  try {
    await downloadReceipt(order)
  }
  catch (err) {
    console.error('Receipt download failed', err)
    receiptErrors.value[order.id] = 'Could not download the receipt. Try again.'
  }
  finally {
    downloading.value.delete(order.id)
  }
}

onMounted(() => load())
</script>

<template>
  <div class="account-section purchases">
    <p v-if="orders === null && !loadError" class="empty">
      Loading purchases…
    </p>
    <p v-else-if="orders?.length === 0" class="empty">
      No purchases yet.
    </p>
    <ul v-else-if="orders" class="purchase-list">
      <li
        v-for="order in orders"
        :key="order.id"
        class="purchase-row"
      >
        <div class="purchase-meta">
          <span class="name">{{ itemsOf(order) }}</span>
          <span class="caption">
            <time
              v-if="order.completedAt"
              :datetime="order.completedAt.toISOString()"
            >{{ dateFormat.format(order.completedAt) }}</time>
            <span v-if="order.isFullyRefunded" class="badge">Refunded</span>
            <span v-else-if="order.isPartiallyRefunded" class="badge">Partly refunded</span>
          </span>
          <span v-if="receiptErrors[order.id]" class="error">
            {{ receiptErrors[order.id] }}
          </span>
        </div>
        <span class="purchase-total">{{ formatMoney(order.total.due) }}</span>
        <button
          type="button"
          class="download-btn"
          :disabled="downloading.has(order.id)"
          @click="receipt(order)"
        >
          {{ downloading.has(order.id) ? 'Preparing…' : 'Receipt' }}
        </button>
      </li>
    </ul>

    <p v-if="loadError" class="error">
      {{ loadError }}
    </p>
    <button
      v-if="next || firstPageFailed"
      type="button"
      class="show-more"
      :disabled="loading"
      @click="load(next ?? undefined)"
    >
      {{ loading ? 'Loading…' : (next ? 'Show more' : 'Try again') }}
    </button>
  </div>
</template>
