<script setup lang="ts">
const store = useMagentoStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchCart()
})

const cartItems = computed(() => store.cart?.items ?? [])
const cartTotal = computed(() => {
  const grand = store.cart?.prices?.grand_total
  if (!grand) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: grand.value > 0 ? grand.currency : 'USD',
  }).format(grand.value)
})

const isEmpty = computed(() => cartItems.value.length === 0)

async function removeItem(itemId: string) {
  console.log('Remove item:', itemId)
}

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

    <div v-if="store.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 card animate-pulse">
        <div class="w-24 h-24 bg-obscure-bg-secondary rounded-xl flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-5 bg-obscure-bg-secondary rounded w-3/4" />
          <div class="h-4 bg-obscure-bg-secondary rounded w-1/4" />
        </div>
      </div>
    </div>

    <template v-else-if="!isEmpty">
      <div class="space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex items-center gap-4 p-4 card"
        >
          <NuxtLink :to="`/product/${item.product.sku}`" class="w-24 h-24 rounded-xl overflow-hidden bg-obscure-bg-secondary shrink-0">
            <img
              v-if="item.product.image?.url"
              :src="item.product.image.url"
              :alt="item.product.image.label || item.product.name"
              class="w-full h-full object-cover hover:scale-105 transition-transform"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-8 h-8 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </NuxtLink>

          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/product/${item.product.sku}`"
              class="font-medium text-white hover:text-violet-400 transition-colors line-clamp-2"
            >
              {{ item.product.name }}
            </NuxtLink>
            <p class="mt-1 text-sm text-obscure-text-muted">Qty: {{ item.quantity }}</p>
          </div>

          <div class="text-right">
            <p class="font-semibold text-white">
              {{ formatPrice(item.prices?.row_total?.value ?? 0, item.prices?.row_total?.currency ?? 'USD') }}
            </p>
          </div>

          <button
            @click="removeItem(item.id)"
            class="p-2 rounded-lg text-obscure-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-8 p-6 card">
        <div class="flex items-center justify-between">
          <span class="text-obscure-text-secondary">Subtotal</span>
          <span class="text-xl font-bold text-white">{{ cartTotal }}</span>
        </div>
        <p class="text-sm text-obscure-text-muted mt-1">Shipping calculated at checkout</p>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-4">
        <NuxtLink to="/" class="btn-secondary flex-1 text-center">
          Continue Shopping
        </NuxtLink>
        <NuxtLink to="/checkout" class="btn-primary flex-1 text-center">
          Proceed to Checkout
        </NuxtLink>
      </div>
    </template>

    <div v-else class="text-center py-20">
      <div class="w-24 h-24 rounded-full bg-obscure-bg-secondary flex items-center justify-center mx-auto mb-6">
        <svg class="w-12 h-12 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
      <p class="text-obscure-text-muted mb-6">Looks like you haven't added anything to your cart yet.</p>
      <NuxtLink to="/" class="btn-primary">
        Start Shopping
      </NuxtLink>
    </div>
  </div>
</template>