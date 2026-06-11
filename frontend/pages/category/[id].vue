<script setup lang="ts">
import type { Product } from '~/types/magento'

const route = useRoute()
const router = useRouter()
const categoryId = route.params.id as string

const { getProductsByCategory, getCategory, addToCart } = useMagento()

const currentPage = ref(1)
const pageSize = 12

const { data: category, pending: catPending } = await useAsyncData(
  `cat-${categoryId}`,
  () => getCategory(categoryId),
)

const { data: productsData, pending: prodPending, refresh } = await useAsyncData(
  `products-${categoryId}-${currentPage.value}`,
  () => getProductsByCategory(categoryId, pageSize, currentPage.value),
)

const pending = computed(() => catPending.value || prodPending.value)

const products = computed(() => productsData.value?.items ?? [])
const totalCount = computed(() => productsData.value?.total_count ?? 0)
const pageInfo = computed(() => productsData.value?.page_info)

const breadcrumbs = computed(() => category.value?.breadcrumbs ?? [])

const toast = ref<string | null>(null)

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
    <Breadcrumbs :breadcrumbs="breadcrumbs" />

    <div v-if="pending" class="mt-8 space-y-8">
      <div class="h-10 bg-obscure-bg-secondary rounded-lg w-64 animate-pulse" />
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-obscure-bg-secondary rounded-xl" />
          <div class="mt-3 h-4 bg-obscure-bg-secondary rounded w-3/4" />
          <div class="mt-1 h-4 bg-obscure-bg-secondary rounded w-1/4" />
        </div>
      </div>
    </div>

    <template v-else>
      <div class="mt-8 mb-8">
        <h1 class="text-3xl font-bold text-white">{{ category?.name || 'Category' }}</h1>
        <p v-if="category?.description" class="text-obscure-text-muted mt-2 max-w-3xl" v-html="category.description" />
        <p class="text-obscure-text-muted mt-2">{{ totalCount }} products</p>
      </div>

      <div v-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.sku"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div v-else class="text-obscure-text-muted py-16 text-center">
        <svg class="w-16 h-16 mx-auto text-obscure-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        No products in this category.
      </div>

      <div v-if="pageInfo && pageInfo.total_pages > 1" class="mt-12">
        <Pagination
          :page-info="pageInfo"
          :loading="prodPending"
          @page-change="(page) => currentPage = page"
        />
      </div>
    </template>

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