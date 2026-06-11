<script setup lang="ts">
import type { Breadcrumb } from '~/types/magento'

interface Props {
  breadcrumbs: Breadcrumb[]
  currentPage?: string
}

defineProps<Props>()
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" class="flex items-center gap-2 text-sm">
    <NuxtLink
      to="/"
      class="text-obscure-text-muted hover:text-violet-400 transition-colors flex items-center gap-1"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </NuxtLink>

    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.category_id">
      <svg class="w-4 h-4 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>

      <NuxtLink
        v-if="index < breadcrumbs.length - 1"
        :to="`/category/${crumb.category_id}`"
        class="text-obscure-text-muted hover:text-violet-400 transition-colors truncate max-w-[150px]"
      >
        {{ crumb.category_name }}
      </NuxtLink>

      <span v-else class="text-obscure-text-secondary font-medium truncate max-w-[200px]">
        {{ crumb.category_name }}
      </span>
    </template>

    <template v-if="currentPage">
      <svg class="w-4 h-4 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-white font-medium truncate max-w-[200px]">
        {{ currentPage }}
      </span>
    </template>
  </nav>
</template>