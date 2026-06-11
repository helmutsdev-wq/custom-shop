<script setup lang="ts">
import type { ConfigurableProduct } from '~/types/magento'

const route = useRoute()
const sku = String(route.params.sku)
const config = useRuntimeConfig()
const mediaUrl = config.public.magentoMediaUrl

const { getProductDetail, addToCart } = useMagento()
const store = useMagentoStore()
const toast = ref<string | null>(null)

const { data: product, pending, error } = await useAsyncData(
  `product-${sku}`,
  () => getProductDetail(sku),
)

const selectedOptions = ref<Record<string, number>>({})
const selectedVariant = ref<any>(null)
const selectedImage = ref<string | null>(null)

const isConfigurable = computed(() => product.value?.__typename === 'ConfigurableProduct')

function getSelectedVariant(p: any) {
  if (!isConfigurable.value || !p.variants?.length) return null
  return p.variants.find((v: any) =>
    v.attributes?.every((a: any) => selectedOptions.value[a.code] === a.value_index)
  ) ?? null
}

watch(selectedOptions, () => {
  if (isConfigurable.value && product.value) {
    selectedVariant.value = getSelectedVariant(product.value)
    if (selectedVariant.value?.product?.image?.url) {
      selectedImage.value = selectedVariant.value.product.image.url
    }
  }
}, { deep: true })

watch(product, (p) => {
  if (p?.__typename === 'ConfigurableProduct' && p.configurable_options) {
    p.configurable_options.forEach((opt: any) => {
      if (!selectedOptions.value[opt.attribute_code] && opt.values?.length > 0) {
        selectedOptions.value[opt.attribute_code] = opt.values[0].value_index
      }
    })
  }
}, { immediate: true })

const currentImage = computed(() => {
  if (selectedImage.value) return selectedImage.value
  if (selectedVariant.value?.product?.image?.url) return selectedVariant.value.product.image.url
  return product.value?.image?.url ?? null
})

const currentPrice = computed(() => {
  const price = selectedVariant.value?.product?.price_range?.minimum_price?.final_price
    ?? product.value?.price_range?.minimum_price?.final_price
  return price
})

const currentStock = computed(() => {
  return selectedVariant.value?.product?.stock_status ?? product.value?.stock_status ?? 'OUT_OF_STOCK'
})

const isOutOfStock = computed(() => currentStock.value === 'OUT_OF_STOCK')

async function handleAddToCart() {
  if (isOutOfStock) return
  try {
    const addSku = selectedVariant.value?.product?.sku ?? sku
    await addToCart(addSku, 1)
    toast.value = 'Added to cart!'
    setTimeout(() => (toast.value = null), 3000)
  } catch {
    toast.value = 'Failed to add to cart'
    setTimeout(() => (toast.value = null), 3000)
  }
}

function formatPrice(price: any): string {
  if (!price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(price.value)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Breadcrumbs
      v-if="product?.categories?.length"
      :breadcrumbs="product.categories[0].breadcrumbs ?? []"
      :current-page="product.name"
    />

    <div v-if="pending" class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="aspect-square bg-obscure-bg-secondary rounded-xl animate-pulse" />
      <div class="space-y-4">
        <div class="h-10 bg-obscure-bg-secondary rounded w-3/4 animate-pulse" />
        <div class="h-8 bg-obscure-bg-secondary rounded w-1/4 animate-pulse" />
        <div class="h-4 bg-obscure-bg-secondary rounded w-1/6 animate-pulse" />
        <div class="h-24 bg-obscure-bg-secondary rounded animate-pulse" />
        <div class="h-14 bg-obscure-bg-secondary rounded animate-pulse" />
      </div>
    </div>

    <div v-else-if="error" class="mt-8 text-center py-16">
      <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-400">Failed to load product.</p>
    </div>

    <div v-else-if="product" class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="space-y-4">
        <div class="aspect-square bg-obscure-bg-secondary rounded-xl overflow-hidden">
          <img
            v-if="currentImage"
            :src="currentImage"
            :alt="product.image?.label ?? product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-20 h-20 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div v-if="product.media_gallery_entries?.length > 1" class="grid grid-cols-5 gap-2">
          <button
            v-for="media in product.media_gallery_entries"
            :key="media.id"
            @click="selectedImage = `${mediaUrl}/catalog/product${media.file}`"
            class="aspect-square rounded-lg overflow-hidden border-2 transition-all"
            :class="selectedImage === `${mediaUrl}/catalog/product${media.file}` || (!selectedImage && media.file === product.image?.url)
              ? 'border-violet-500'
              : 'border-obscure-border hover:border-obscure-border-hover'"
          >
            <img
              :src="`${mediaUrl}/catalog/product${media.file}`"
              :alt="media.label || product.name"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ product.name }}</h1>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-3xl font-bold text-white">{{ formatPrice(currentPrice) }}</span>
          <span
            class="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
            :class="isOutOfStock
              ? 'bg-red-500/10 text-red-400'
              : 'bg-green-500/10 text-green-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="isOutOfStock ? 'bg-red-400' : 'bg-green-400'" />
            {{ isOutOfStock ? 'Out of Stock' : 'In Stock' }}
          </span>
        </div>

        <div v-if="isConfigurable && (product as ConfigurableProduct).configurable_options?.length" class="space-y-5">
          <div v-for="option in (product as ConfigurableProduct).configurable_options" :key="option.attribute_code" class="space-y-3">
            <label class="text-sm font-medium text-obscure-text-secondary">
              {{ option.label }}
              <span class="text-obscure-text-muted ml-1">
                ({{ option.values.find((v: any) => v.value_index === selectedOptions[option.attribute_code])?.label }})
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="value in option.values"
                :key="value.value_index"
                type="button"
                @click="selectedOptions[option.attribute_code] = value.value_index"
                :class="[
                  'px-4 py-2 text-sm rounded-lg border font-medium transition-all duration-200',
                  selectedOptions[option.attribute_code] === value.value_index
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20'
                    : 'bg-obscure-bg-secondary text-obscure-text-secondary border-obscure-border hover:border-violet-500 hover:text-white'
                ]"
                :title="value.label"
                :style="value.swatch_data?.value && value.swatch_data.value.startsWith('#') ? { backgroundColor: value.swatch_data.value, borderColor: selectedOptions[option.attribute_code] === value.value_index ? value.swatch_data.value : 'transparent', color: value.swatch_data.value ? '#fff' : undefined } : undefined"
              >
                <template v-if="!value.swatch_data?.value || !value.swatch_data.value.startsWith('#')">
                  {{ value.label }}
                </template>
              </button>
            </div>
          </div>
        </div>

        <div v-if="product.short_description?.html" class="prose prose-invert prose-sm max-w-none" v-html="product.short_description.html" />

        <div class="pt-4">
          <button
            class="btn-primary w-full text-lg py-4"
            :disabled="isOutOfStock"
            @click="handleAddToCart"
          >
            <span v-if="isOutOfStock">Out of Stock</span>
            <span v-else>Add to Cart</span>
          </button>
        </div>

        <div v-if="product.description?.html" class="pt-6 border-t border-obscure-border">
          <h3 class="font-semibold text-white mb-3">Description</h3>
          <div class="prose prose-invert prose-sm max-w-none text-obscure-text-secondary" v-html="product.description.html" />
        </div>
      </div>
    </div>
    <div v-else class="mt-8 text-center py-16">
      <svg class="w-16 h-16 mx-auto text-obscure-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-obscure-text-muted">Product not found.</p>
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