<script setup lang="ts">
const route = useRoute()
const query = computed(() => (route.query.q as string) || '')

const { searchProducts, addToCart } = useMagento()
const toast = ref<string | null>(null)

const currentPage = ref(1)
const pageSize = 12

const { data, pending, error, refresh } = await useAsyncData(
  `search-${query.value}-${currentPage.value}`,
  () => searchProducts(query.value, pageSize, currentPage.value),
  { watch: [query, currentPage] },
)

watch(currentPage, () => {
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

async function handleAddToCart(sku: string) {
  try {
    await addToCart(sku, 1)
    toast.value = 'Added to cart!'
    setTimeout(() => (toast.value = null), 3000)
  } catch {
    toast.value = 'Failed to add to cart'
    setTimeout(() => (toast.value = null), 3000)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-white mb-2">Search Results</h1>
    <p v-if="query" class="text-obscure-text-muted mb-8">
      Showing {{ data?.total_count ?? 0 }} results for "<span class="text-violet-400">{{ query }}</span>"
    </p>
    <p v-else class="text-obscure-text-muted mb-8">Enter a search term to find products.</p>

    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="aspect-square bg-obscure-bg-secondary rounded-xl" />
        <div class="mt-3 h-4 bg-obscure-bg-secondary rounded w-3/4" />
        <div class="mt-1 h-4 bg-obscure-bg-secondary rounded w-1/4" />
      </div>
    </div>
    <div v-else-if="error" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-400">Search failed. Please try again.</p>
    </div>

    <div v-else-if="data && data.items.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in data.items"
        :key="product.sku"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>
    <div v-else class="text-center py-20">
      <svg class="w-16 h-16 mx-auto text-obscure-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h2 class="text-xl font-semibold text-white mb-2">No products found</h2>
      <p class="text-obscure-text-muted">Try adjusting your search terms.</p>
    </div>

    <div v-if="data?.page_info && data.page_info.total_pages > 1" class="mt-12">
      <Pagination
        :page-info="data.page_info"
        :loading="pending"
        @page-change="(page) => currentPage = page"
      />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="toast"
          class="fixed bottom-6 right-6 bg-violet-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30 z-50 flex items-center gap-3"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ toast }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>