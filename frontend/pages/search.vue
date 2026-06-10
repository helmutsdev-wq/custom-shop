<script setup lang="ts">
const route = useRoute()
const query = computed(() => (route.query.q as string) || '')

const { searchProducts } = useMagento()

const { data, pending, error } = await useAsyncData(
  `search-${query.value}`,
  () => searchProducts(query.value, 20),
  { watch: [query] },
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-semibold mb-2">
      Search Results
    </h1>
    <p v-if="query" class="text-gray-500 mb-8">
      Showing results for "{{ query }}"
    </p>

    <div v-if="pending" class="text-gray-400">Searching...</div>
    <div v-else-if="error" class="text-red-500">Search failed.</div>

    <div v-else-if="data && data.items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <NuxtLink
        v-for="product in data.items"
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
        </div>
      </NuxtLink>
    </div>
    <div v-else class="text-gray-400 py-16 text-center">
      No products found for "{{ query }}".
    </div>

    <div v-if="data?.page_info?.total_pages > 1" class="mt-12 text-center">
      <p class="text-sm text-gray-500">
        Page {{ data.page_info.current_page }} of {{ data.page_info.total_pages }}
        ({{ data.total_count }} results)
      </p>
    </div>
  </div>
</template>
