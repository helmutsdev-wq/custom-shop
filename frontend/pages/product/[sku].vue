<script setup lang="ts">
const route = useRoute()
const sku = String(route.params.sku)
const config = useRuntimeConfig()
const mediaUrl = config.public.magentoMediaUrl

const { getProductDetail } = useMagento()
const store = useMagentoStore()
const toast = ref<string | null>(null)

const { data: product, pending, error } = await useAsyncData(
  `product-${sku}`,
  () => getProductDetail(sku),
)

const selectedOptions = ref<Record<string, string>>({})
const selectedVariant = ref<any>(null)

function isConfigurableProduct(p: any): p is any {
  return p?.__typename === 'ConfigurableProduct'
}

function getSelectedVariant(p: any) {
  if (!isConfigurableProduct(p) || !p.variants?.length) return null
  return p.variants.find((v: any) =>
    v.attributes?.every((a: any) => selectedOptions.value[a.code] === a.value_index)
  ) ?? null
}

watch(selectedOptions, () => {
  if (isConfigurableProduct(product.value)) {
    selectedVariant.value = getSelectedVariant(product.value)
  }
}, { deep: true })

async function handleAddToCart() {
  try {
    const addSku = selectedVariant.value?.product?.sku ?? sku
    await store.addToCart(addSku, 1)
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
            v-if="selectedVariant?.product?.image?.url || product.image?.url"
            :src="selectedVariant?.product?.image?.url ?? product.image?.url"
            :alt="selectedVariant?.product?.image?.label ?? product.image?.label ?? product.name"
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
            :src="`${mediaUrl}/catalog/product${media.file}`"
            :alt="media.label || product.name"
            class="aspect-square object-cover rounded border border-gray-200 cursor-pointer hover:border-gray-400"
          />
        </div>
      </div>

      <div>
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>

        <p class="mt-4 text-2xl font-semibold">
          {{ selectedVariant?.product?.price_range?.minimum_price?.final_price?.currency ?? product.price_range?.minimum_price?.final_price?.currency }}
          {{ (selectedVariant?.product?.price_range?.minimum_price?.final_price?.value ?? product.price_range?.minimum_price?.final_price?.value)?.toFixed(2) }}
        </p>

        <p
          class="mt-2 text-sm"
          :class="(selectedVariant?.product?.stock_status ?? product.stock_status) === 'IN_STOCK' ? 'text-green-600' : 'text-red-500'"
        >
          {{ (selectedVariant?.product?.stock_status ?? product.stock_status) === 'IN_STOCK' ? 'In Stock' : 'Out of Stock' }}
        </p>

        <div v-if="isConfigurableProduct(product) && product.configurable_options?.length" class="mt-6 space-y-4">
          <div v-for="option in product.configurable_options" :key="option.attribute_code" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">{{ option.label }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="value in option.values"
                :key="value.value_index"
                type="button"
                @click="selectedOptions[option.attribute_code] = value.value_index"
                :class="[
                  'px-3 py-2 text-sm rounded border transition-colors',
                  selectedOptions[option.attribute_code] === value.value_index
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                ]"
                :title="value.label"
                :style="value.swatch_data?.value && value.swatch_data.value.startsWith('#') ? { backgroundColor: value.swatch_data.value, borderColor: value.swatch_data.value } : undefined"
              >
                {{ value.swatch_data?.value && !value.swatch_data.value.startsWith('#') ? '' : value.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 prose prose-sm" v-if="product.short_description?.html" v-html="product.short_description.html" />

        <div class="mt-6 prose prose-sm" v-if="product.description?.html" v-html="product.description.html" />

        <button
          class="mt-8 w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="(selectedVariant?.product?.stock_status ?? product.stock_status) !== 'IN_STOCK'"
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
