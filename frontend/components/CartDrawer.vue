<script setup lang="ts">
const store = useMagentoStore()
const router = useRouter()

const isOpen = ref(false)

const cartItems = computed(() => store.cart?.items ?? [])
const cartTotal = computed(() => {
  const grand = store.cart?.prices?.grand_total
  if (!grand) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: grand.currency,
  }).format(grand.value)
})

const isEmpty = computed(() => cartItems.value.length === 0)

async function removeItem(itemId: string) {
  // TODO: Implement remove from cart
  console.log('Remove item:', itemId)
}

function goToCart() {
  isOpen.value = false
  router.push('/cart')
}

function goToCheckout() {
  isOpen.value = false
  router.push('/checkout')
}

defineExpose({ open: () => (isOpen.value = true) })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        @click="isOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-obscure-bg-secondary border-l border-obscure-border z-50 shadow-2xl"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-5 border-b border-obscure-border">
            <h2 class="text-lg font-bold text-white">Your Cart</h2>
            <button
              @click="isOpen = false"
              class="p-2 rounded-lg text-obscure-text-muted hover:text-white hover:bg-obscure-bg-elevated transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full p-8 text-center">
              <div class="w-20 h-20 rounded-full bg-obscure-bg-elevated flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p class="text-obscure-text-secondary mb-4">Your cart is empty</p>
              <button @click="isOpen = false" class="btn-primary">
                Continue Shopping
              </button>
            </div>

            <div v-else class="p-5 space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="flex gap-4 p-3 rounded-lg bg-obscure-bg-card border border-obscure-border"
              >
                <img
                  v-if="item.product.image?.url"
                  :src="item.product.image.url"
                  :alt="item.product.name"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <div v-else class="w-20 h-20 rounded-lg bg-obscure-bg-elevated flex items-center justify-center">
                  <svg class="w-8 h-8 text-obscure-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <NuxtLink
                    :to="`/product/${item.product.sku}`"
                    class="font-medium text-obscure-text-primary hover:text-violet-400 transition-colors line-clamp-2"
                    @click="isOpen = false"
                  >
                    {{ item.product.name }}
                  </NuxtLink>

                  <p class="text-sm text-obscure-text-muted mt-1">
                    Qty: {{ item.quantity }}
                  </p>

                  <p class="text-sm font-semibold text-white mt-1">
                    {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: item.prices.row_total.currency }).format(item.prices.row_total.value) }}
                  </p>
                </div>

                <button
                  @click="removeItem(item.id)"
                  class="self-start p-1.5 rounded-lg text-obscure-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="!isEmpty" class="p-5 border-t border-obscure-border bg-obscure-bg-card">
            <div class="flex items-center justify-between mb-4">
              <span class="text-obscure-text-secondary">Subtotal</span>
              <span class="text-xl font-bold text-white">{{ cartTotal }}</span>
            </div>
            <div class="space-y-3">
              <button @click="goToCart" class="btn-secondary w-full">
                View Cart
              </button>
              <button @click="goToCheckout" class="btn-primary w-full">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>