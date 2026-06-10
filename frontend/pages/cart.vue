<script setup lang="ts">
const store = useMagentoStore()

onMounted(async () => {
  await store.fetchCart()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-semibold mb-8">Shopping Cart</h1>

    <div v-if="store.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg animate-pulse">
        <div class="w-20 h-20 bg-gray-100 rounded flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-100 rounded w-3/4" />
          <div class="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>

    <div v-else-if="store.cart && store.cart.items.length > 0">
      <div class="space-y-4">
        <div
          v-for="item in store.cart.items"
          :key="item.id"
          class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
        >
          <div class="w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
            <img
              v-if="item.product.image?.url"
              :src="item.product.image.url"
              :alt="item.product.image.label || item.product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium truncate">
              <NuxtLink :to="`/product/${item.product.sku}`" class="hover:underline">
                {{ item.product.name }}
              </NuxtLink>
            </h3>
            <p class="mt-1 text-sm text-gray-500">Qty: {{ item.quantity }}</p>
          </div>
          <div class="text-sm font-semibold text-right">
            <p>{{ item.prices?.row_total?.currency }} {{ item.prices?.row_total?.value?.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 p-4 border border-gray-200 rounded-lg">
        <div class="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{{ store.cart.prices?.grand_total?.currency }} {{ store.cart.prices?.grand_total?.value?.toFixed(2) }}</span>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink
          to="/checkout"
          class="inline-block w-full text-center bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Proceed to Checkout
        </NuxtLink>
      </div>
    </div>
    <div v-else class="text-center py-16">
      <p class="text-gray-400">Your cart is empty.</p>
      <NuxtLink to="/" class="mt-4 inline-block text-sm underline">Continue shopping</NuxtLink>
    </div>
  </div>
</template>
