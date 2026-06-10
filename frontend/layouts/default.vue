<script setup lang="ts">
const route = useRoute()
const store = useMagentoStore()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchOpen = ref(false)
let searchDebounce: ReturnType<typeof setTimeout> | null = null

async function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  const { searchProducts } = useMagento()
  const result = await searchProducts(q, 5)
  searchResults.value = result?.items ?? []
}

function onSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(handleSearch, 300)
}

function selectProduct(sku: string) {
  searchQuery.value = ''
  searchResults.value = []
  searchOpen.value = false
}

onMounted(async () => {
  await store.fetchCart()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <header class="border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <NuxtLink to="/" class="text-xl font-bold tracking-tight shrink-0">
            Custom Shop
          </NuxtLink>

          <div class="flex-1 max-w-md relative">
            <input
              v-model="searchQuery"
              placeholder="Search products..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              @input="onSearchInput"
              @focus="searchOpen = true"
              @blur="setTimeout(() => (searchOpen = false), 200)"
            />
            <div
              v-if="searchOpen && searchResults.length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              <NuxtLink
                v-for="p in searchResults"
                :key="p.sku"
                :to="`/product/${p.sku}`"
                class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                @click="selectProduct(p.sku)"
              >
                <img
                  v-if="p.small_image?.url"
                  :src="p.small_image.url"
                  :alt="p.small_image.label || p.name"
                  class="w-10 h-10 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ p.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ p.price_range?.minimum_price?.final_price?.currency }}
                    {{ p.price_range?.minimum_price?.final_price?.value?.toFixed(2) }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>

          <nav class="flex items-center gap-4">
            <NuxtLink
              to="/cart"
              class="relative text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Cart
              <span
                v-if="store.cartItemCount > 0"
                class="absolute -top-2 -right-4 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
              >
                {{ store.cartItemCount > 9 ? '9+' : store.cartItemCount }}
              </span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        Custom Shop — Headless Magento 2 Demo
      </div>
    </footer>
  </div>
</template>
