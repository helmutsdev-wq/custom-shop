<script setup lang="ts">
interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000,
})

const emit = defineEmits<{
  close: []
}>()

onMounted(() => {
  setTimeout(() => emit('close'), props.duration)
})

const iconPath = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colorClasses = {
  success: 'bg-green-600 shadow-green-500/30',
  error: 'bg-red-600 shadow-red-500/30',
  info: 'bg-violet-600 shadow-violet-500/30',
}
</script>

<template>
  <div
    class="fixed bottom-6 right-6 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slide-up"
    :class="colorClasses[type]"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath[type]" />
    </svg>
    <span>{{ message }}</span>
    <button
      @click="emit('close')"
      class="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>