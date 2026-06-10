<script setup lang="ts">
const route = useRoute()
const categoryId = route.params.id as string

const { getProductsByCategory, getCategory } = useMagento()

const { data: category, pending: catPending } = await useAsyncData(
  `cat-${categoryId}`,
  () => getCategory(categoryId),
)

const { data: products, pending: prodPending } = await useAsyncData(
  `products-${categoryId}`,
  () => getProductsByCategory(categoryId, 20),
)

const pending = computed(() => catPending.value || prodPending.value)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="pending" class="space-y-8">
      <div class="h-8 bg-gray-100 rounded w-48 animate-pulse" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-gray-100 rounded-lg" />
          <div class="mt-3 h-4 bg-gray-100 rounded w-3/4" />
          <div class="mt-1 h-4 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>

    <template v-else>
      <h1 class="text-3xl font-bold mb-2">{{ category?.name || 'Category' }}</h1>
      <p v-if="category?.description" class="text-gray-500 mb-8 prose prose-sm" v-html="category.description" />

      <div v-if="products && products.items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="product in products.items"
          :key="product.sku"
          :to="`/product/${product.sku}`"
          class="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="aspect-square bg-gray-50">
            <img
              v-if="product.small_image?.url"
              :src="product.small_image.url"
              :alt="product.small_image.label || product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              No image
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-sm font-medium truncate">{{ product.name }}</h3>
            <p class="mt-1 text-sm font-semibold">
              {{ product.price_range?.minimum_price?.final_price?.currency }}
              {{ product.price_range?.minimum_price?.final_price?.value?.toFixed(2) }}
            </p>
            <p
              class="mt-1 text-xs"
              :class="product.stock_status === 'IN_STOCK' ? 'text-green-600' : 'text-red-500'"
            >
              {{ product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock' }}
            </p>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="text-gray-400 py-16 text-center">
        No products in this category.
      </div>

      <div v-if="products?.page_info?.total_pages > 1" class="mt-12 text-center">
        <p class="text-sm text-gray-500">
          Page {{ products.page_info.current_page }} of {{ products.page_info.total_pages }}
          ({{ products.total_count }} products)
        </p>
      </div>
    </template>
  </div>
</template>
