<script setup lang="ts">
import type { Product } from '~/types/magento'

interface Props {
  placeholder?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search products...',
  autofocus: false,
})

const router = useRouter()

const query = ref('')
const results = ref<Product[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const { searchProducts } = useMagento()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function handleSearch() {
  const q = query.value.trim()

  if (!q) {
    results.value = []
    isOpen.value = false
    return
  }

  isLoading.value = true
  try {
    const result = await searchProducts(q, 5)
    results.value = result?.items ?? []
    isOpen.value = results.value.length > 0
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    isLoading.value = false
  }
}

function handleInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(handleSearch, 300)
}

function selectProduct(product: Product) {
  query.value = ''
  results.value = []
  isOpen.value = false
  router.push(`/product/${product.sku}`)
}

function clearSearch() {
  query.value = ''
  results.value = []
  isOpen.value = false
}

function formatPrice(product: Product): string {
  const price = product.price_range?.minimum_price?.final_price
  if (!price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
  }).format(price.value)
}

function handleFocus() {
  if (results.value.length > 0) {
    isOpen.value = true
  }
}

function handleBlur() {
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

onMounted(() => {
  if (props.autofocus && inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div class="relative w-full max-w-md">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg v-if="!isLoading" class="w-5 h-5 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <svg v-else class="w-5 h-5 text-obscure-text-muted animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full bg-obscure-bg-secondary border border-obscure-border rounded-xl
               pl-12 pr-10 py-3 text-obscure-text-primary placeholder-obscure-text-muted
               transition-all duration-200
               focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-obscure-bg-elevated"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.escape="clearSearch"
      />

      <button
        v-if="query"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-obscure-text-muted hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen && results.length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-obscure-bg-secondary border border-obscure-border
               rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50"
      >
        <div class="max-h-80 overflow-y-auto">
          <NuxtLink
            v-for="product in results"
            :key="product.sku"
            :to="`/product/${product.sku}`"
            class="flex items-center gap-4 p-4 hover:bg-obscure-bg-elevated transition-colors group"
            @click="selectProduct(product)"
          >
            <div class="w-14 h-14 rounded-lg bg-obscure-bg-card overflow-hidden shrink-0">
              <img
                v-if="product.small_image?.url"
                :src="product.small_image.url"
                :alt="product.small_image.label || product.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-6 h-6 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-medium text-obscure-text-primary group-hover:text-violet-400 transition-colors line-clamp-1">
                {{ product.name }}
              </p>
              <p class="text-sm text-obscure-text-muted mt-0.5">
                {{ formatPrice(product) }}
              </p>
            </div>

            <svg class="w-5 h-5 text-obscure-text-muted group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <div class="p-3 border-t border-obscure-border bg-obscure-bg-card">
          <NuxtLink
            :to="`/search?q=${encodeURIComponent(query)}`"
            class="flex items-center justify-center gap-2 text-sm text-obscure-text-secondary hover:text-violet-400 transition-colors"
            @click="isOpen = false"
          >
            <span>View all results for</span>
            <span class="font-medium">"{{ query }}"</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>