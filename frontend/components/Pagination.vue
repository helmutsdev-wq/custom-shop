<script setup lang="ts">
import type { PageInfo } from '~/types/magento'

interface Props {
  pageInfo: PageInfo
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const { current_page, total_pages } = toRefs(props.pageInfo)

const visiblePages = computed(() => {
  const total = total_pages.value
  const current = current_page.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)

    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (current < total - 2) pages.push('...')

    pages.push(total)
  }

  return pages
})

function goToPage(page: number) {
  if (page < 1 || page > total_pages.value || page === current_page.value || props.loading) return
  emit('pageChange', page)
}
</script>

<template>
  <nav v-if="total_pages > 1" class="flex items-center justify-center gap-1">
    <button
      @click="goToPage(current_page - 1)"
      :disabled="current_page === 1 || loading"
      class="p-2 rounded-lg text-obscure-text-muted hover:text-white hover:bg-obscure-bg-elevated
             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <template v-for="(page, index) in visiblePages" :key="index">
      <span
        v-if="page === '...'"
        class="px-3 py-2 text-obscure-text-muted"
      >
        ...
      </span>

      <button
        v-else
        @click="goToPage(page as number)"
        :disabled="loading"
        class="min-w-[40px] h-10 rounded-lg font-medium transition-all duration-200"
        :class="[
          page === current_page
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
            : 'text-obscure-text-secondary hover:text-white hover:bg-obscure-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed'
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="goToPage(current_page + 1)"
      :disabled="current_page === total_pages || loading"
      class="p-2 rounded-lg text-obscure-text-muted hover:text-white hover:bg-obscure-bg-elevated
             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </nav>
</template>