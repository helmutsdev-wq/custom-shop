<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { getCmsPage } = useMagento()

const { data: page, pending, error } = await useAsyncData(
  `cms-${slug}`,
  () => getCmsPage(slug),
)

useHead(() => ({
  title: page.value?.title || slug,
}))
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="pending" class="space-y-4 animate-pulse">
      <div class="h-10 bg-obscure-bg-secondary rounded-lg w-64" />
      <div class="h-4 bg-obscure-bg-secondary rounded w-full" />
      <div class="h-4 bg-obscure-bg-secondary rounded w-3/4" />
      <div class="h-4 bg-obscure-bg-secondary rounded w-5/6" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-400">Failed to load page.</p>
    </div>

    <article v-else-if="page" class="prose prose-invert max-w-none">
      <h1 class="text-3xl font-bold text-white mb-8">{{ page.content_heading || page.title }}</h1>
      <div v-html="page.content" class="cms-content text-obscure-text-secondary leading-relaxed space-y-4" />
    </article>

    <div v-else class="text-center py-16">
      <h2 class="text-xl font-semibold text-white mb-2">Page Not Found</h2>
      <p class="text-obscure-text-muted mb-6">This page doesn't exist.</p>
      <NuxtLink to="/" class="btn-primary">Go Home</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.cms-content :deep(a) {
  color: #a78bfa;
  text-decoration: underline;
}
.cms-content :deep(a:hover) {
  color: #c4b5fd;
}
.cms-content :deep(h2),
.cms-content :deep(h3) {
  color: #f4f4f5;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.cms-content :deep(ul),
.cms-content :deep(ol) {
  padding-left: 1.5em;
}
.cms-content :deep(li) {
  margin-bottom: 0.25em;
}
.cms-content :deep(p) {
  margin-bottom: 1em;
}
</style>