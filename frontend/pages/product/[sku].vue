<script setup lang="ts">
const route = useRoute()
const sku = String(route.params.sku)

const { getProductDetail } = useMagento()
const store = useMagentoStore()
const toast = ref<string | null>(null)

const { data: product, pending, error } = await useAsyncData(
  `product-${sku}`,
  () => getProductDetail(sku),
)

async function handleAddToCart() {
  try {
    await store.addToCart(sku, 1)
    toast.value = `Added ${product.value?.name} to cart!`
    setTimeout(() => (toast.value = null), 3000)
  } catch {
    toast.value = 'Failed to add to cart.'
    setTimeout(() => (toast.value = null), 3000)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="aspect-square bg-gray-100 rounded-lg animate-pulse" />
      <div class="space-y-4">
        <div class="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
        <div class="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
        <div class="h-4 bg-gray-100 rounded w-1/6 animate-pulse" />
        <div class="h-20 bg-gray-100 rounded animate-pulse" />
        <div class="h-12 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

    <div v-else-if="error" class="text-red-500">Failed to load product.</div>

    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div class="aspect-square bg-gray-50 rounded-lg overflow-hidden">
          <img
            v-if="product.image?.url"
            :src="product.image.url"
            :alt="product.image.label || product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
            No image
          </div>
        </div>

        <div v-if="product.media_gallery_entries?.length > 1" class="grid grid-cols-4 gap-2 mt-4">
          <img
            v-for="media in product.media_gallery_entries"
            :key="media.id"
            :src="media.url"
            :alt="media.label || product.name"
            class="aspect-square object-cover rounded border border-gray-200 cursor-pointer hover:border-gray-400"
          />
        </div>
      </div>

      <div>
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>

        <p class="mt-4 text-2xl font-semibold">
          {{ product.price_range?.minimum_price?.final_price?.currency }}
          {{ product.price_range?.minimum_price?.final_price?.value?.toFixed(2) }}
        </p>

        <p
          class="mt-2 text-sm"
          :class="product.stock_status === 'IN_STOCK' ? 'text-green-600' : 'text-red-500'"
        >
          {{ product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock' }}
        </p>

        <div class="mt-6 prose prose-sm" v-if="product.short_description?.html" v-html="product.short_description.html" />

        <div class="mt-6 prose prose-sm" v-if="product.description?.html" v-html="product.description.html" />

        <button
          class="mt-8 w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="product.stock_status !== 'IN_STOCK'"
          @click="handleAddToCart"
        >
          Add to Cart
        </button>
      </div>
    </div>
    <div v-else class="text-gray-400">Product not found.</div>

    <Teleport to="body">
      <div
        v-if="toast"
        class="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in"
      >
        {{ toast }}
      </div>
    </Teleport>
  </div>
</template>
