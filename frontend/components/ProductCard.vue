<script setup lang="ts">
import type { Product } from '~/types/magento'

interface Props {
  product: Product
  showAddToCart?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAddToCart: true,
  compact: false,
})

const emit = defineEmits<{
  addToCart: [sku: string]
}>()

const isHovered = ref(false)
const isAdding = ref(false)

const price = computed(() => {
  return props.product.price_range?.minimum_price?.final_price
})

const formattedPrice = computed(() => {
  if (!price.value) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.value.currency,
  }).format(price.value.value)
})

const originalPrice = computed(() => {
  const regular = props.product.price_range?.minimum_price?.regular_price
  if (!regular || regular.value === price.value?.value) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: regular.currency,
  }).format(regular.value)
})

const isOutOfStock = computed(() => props.product.stock_status === 'OUT_OF_STOCK')
const isConfigurable = computed(() => (props.product as any).__typename === 'ConfigurableProduct')

async function handleAddToCart(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  if (isOutOfStock.value || isAdding.value) return
  isAdding.value = true
  emit('addToCart', props.product.sku)
  await new Promise(resolve => setTimeout(resolve, 500))
  isAdding.value = false
}
</script>

<template>
  <div
    class="relative group block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <NuxtLink :to="`/product/${product.sku}`" class="block">
      <div
        class="card relative overflow-hidden transition-all duration-500"
        :class="{ 'shadow-card-hover ring-1 ring-violet-500/30': isHovered }"
      >
        <div class="relative overflow-hidden" :class="compact ? 'aspect-[4/3]' : 'aspect-square'">
          <div class="absolute inset-0 bg-obscure-bg-secondary" />

          <img
            v-if="product.image?.url"
            :src="product.image.url"
            :alt="product.image.label || product.name"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
            :class="{ 'scale-110': isHovered }"
          />
          <div
            v-else
            class="absolute inset-0 flex items-center justify-center"
          >
            <svg class="w-16 h-16 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div
            v-if="isOutOfStock"
            class="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <span class="text-sm font-semibold tracking-wider text-white/80 uppercase">
              Out of Stock
            </span>
          </div>

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                   opacity-0 transition-opacity duration-300"
            :class="{ 'opacity-100': isHovered }"
          />
        </div>

        <div class="card-body" :class="{ '!py-3': compact }">
          <h3
            class="font-medium text-obscure-text-primary line-clamp-2 group-hover:text-violet-400 transition-colors duration-200"
            :class="compact ? 'text-sm' : 'text-base'"
          >
            {{ product.name }}
          </h3>

          <div class="mt-2 flex items-center gap-2">
            <span class="text-lg font-bold text-white">
              {{ formattedPrice }}
            </span>
            <span v-if="originalPrice" class="text-sm text-obscure-text-muted line-through">
              {{ originalPrice }}
            </span>
          </div>

          <div v-if="!compact" class="mt-3 flex items-center gap-1">
            <span
              class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              :class="isOutOfStock
                ? 'bg-red-500/10 text-red-400'
                : 'bg-green-500/10 text-green-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="isOutOfStock ? 'bg-red-400' : 'bg-green-400'" />
              {{ isOutOfStock ? 'Out of Stock' : 'In Stock' }}
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>

    <button
      v-if="showAddToCart && !isOutOfStock && !isConfigurable"
      type="button"
      :disabled="isAdding"
      class="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30
             flex items-center justify-center transition-all duration-200
             hover:bg-violet-500 hover:scale-110 active:scale-95
             disabled:opacity-50 disabled:cursor-not-allowed"
      @click="handleAddToCart($event)"
    >
      <svg v-if="isAdding" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>
  </div>
</template>