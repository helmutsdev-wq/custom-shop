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

useHead(() => ({
  title: (category.value as any)?.meta_title || category.value?.name || 'Category',
  meta: [
    (category.value as any)?.meta_description ? { name: 'description', content: (category.value as any).meta_description } : null,
    (category.value as any)?.meta_keywords ? { name: 'keywords', content: (category.value as any).meta_keywords } : null,
  ].filter(Boolean),
}))

const { data: productsData, pending: prodPending, refresh } = await useAsyncData(
  `products-${categoryId}-${currentPage.value}`,
  () => getProductsByCategory(categoryId, pageSize, currentPage.value),
)

const pending = computed(() => catPending.value || prodPending.value)

const products = computed(() => productsData.value?.items ?? [])
const totalCount = computed(() => productsData.value?.total_count ?? 0)
const pageInfo = computed(() => productsData.value?.page_info)
const subcategories = computed(() => category.value?.children ?? [])
const hasProducts = computed(() => products.value.length > 0)
const hasSubcategories = computed(() => subcategories.value.length > 0)

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
        <p class="text-obscure-text-muted mt-2">
          <template v-if="hasProducts">{{ totalCount }} products</template>
          <template v-else-if="hasSubcategories">{{ subcategories.length }} subcategories</template>
          <template v-else>Empty</template>
        </p>
      </div>

      <div v-if="hasSubcategories && hasProducts" class="mb-10">
        <h3 class="text-lg font-semibold text-white mb-4">Subcategories</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="sub in subcategories"
            :key="sub.id"
            :to="`/category/${sub.id}`"
            class="p-4 rounded-xl bg-obscure-bg-secondary border border-obscure-border hover:border-violet-500 hover:bg-obscure-bg-elevated transition-all text-center group"
          >
            <div class="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-violet-500/20 transition-colors">
              <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-white group-hover:text-violet-400 transition-colors">{{ sub.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="hasProducts" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.sku"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div v-else-if="hasSubcategories" class="mt-4">
        <h3 class="text-lg font-semibold text-white mb-4">Subcategories</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="sub in subcategories"
            :key="sub.id"
            :to="`/category/${sub.id}`"
            class="card group cursor-pointer"
          >
            <div class="p-6 text-center">
              <div class="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors">
                <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 class="font-semibold text-white group-hover:text-violet-400 transition-colors">{{ sub.name }}</h3>
              <p v-if="sub.children_count > 0" class="text-sm text-obscure-text-muted mt-1">
                {{ sub.children_count }} subcategories
              </p>
            </div>
          </NuxtLink>
        </div>
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