<script setup lang="ts">
defineProps<{
  error: Error | null
  accept?: string
}>()

const emit = defineEmits<{
  (e: 'input', token: string): void
  (e: 'error', err: Error): void
}>()

const hovering = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function handleFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('input', e.target?.result as string)
  }
  reader.onerror = () => {
    emit('error', new Error('Could not read file.'))
  }
  reader.readAsText(file)
}

function handleDrop(event: DragEvent) {
  hovering.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length !== 1) {
    emit('error', new Error('Drop a single machine file.'))
    return
  }
  handleFile(files[0])
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length !== 1) {
    emit('error', new Error('Choose a single machine file.'))
    return
  }
  handleFile(files[0])
}
</script>

<template>
  <div
    class="device-token-input"
    :class="{ hovering }"
    @drag.prevent.stop
    @dragstart.prevent.stop
    @dragend.prevent.stop="hovering = false"
    @dragover.prevent.stop="hovering = true"
    @dragenter.prevent.stop="hovering = true"
    @dragleave.prevent.stop="hovering = false"
    @drop.prevent.stop="handleDrop"
  >
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 16v-8M8 11.5l4-4 4 4M5 19h14" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <label for="device-token-input">
      <span class="link">Choose a machine file</span> or drag here to upload
    </label>
    <input
      id="device-token-input"
      ref="fileInput"
      type="file"
      :accept="accept || '.dt'"
      @change="handleInput"
    >
    <p v-if="error" class="error">
      {{ error.message }}
    </p>
  </div>
</template>
