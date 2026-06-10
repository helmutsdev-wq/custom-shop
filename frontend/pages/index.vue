<script setup lang="ts">
const { getCategories, getFeaturedProducts } = useMagento()

const { data: categories, pending: catPending } = await useAsyncData('categories', () =>
  getCategories(),
)

const { data: featured, pending: featPending } = await useAsyncData('featured', () =>
  getFeaturedProducts(8),
)
</script>

<template>
  <div>
    <section class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 class="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Custom Shop
        </h1>
        <p class="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
          A modern headless e-commerce experience built with Magento 2 and Nuxt 3.
        </p>
        <div class="mt-10 flex items-center justify-center gap-4">
          <NuxtLink
            to="/category/3"
            class="bg-black text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Shop Gear
          </NuxtLink>
          <NuxtLink
            to="/category/20"
            class="border border-gray-300 px-8 py-3 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
          >
            Shop Women
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-semibold">Featured Products</h2>
        <NuxtLink to="/category/3" class="text-sm font-medium underline">
          View All
        </NuxtLink>
      </div>

      <div v-if="featPending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-gray-100 rounded-lg" />
          <div class="mt-3 h-4 bg-gray-100 rounded w-3/4" />
          <div class="mt-1 h-4 bg-gray-100 rounded w-1/4" />
        </div>
      </div>

      <div v-else-if="featured && featured.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="product in featured"
          :key="product.sku"
          :to="`/product/${product.sku}`"
          class="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="aspect-square bg-gray-50">
            <img
              v-if="product.image?.url"
              :src="product.image.url"
              :alt="product.image.label || product.name"
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
      <div v-else class="text-gray-400 py-8 text-center">
        No featured products available.
      </div>
    </section>

    <section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold mb-8">Shop by Category</h2>

        <div v-if="catPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="h-24 bg-gray-100 rounded-lg" />
          </div>
        </div>

        <div v-else-if="categories && categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/category/${cat.id}`"
            class="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <h3 class="text-lg font-medium">{{ cat.name }}</h3>
            <p v-if="cat.children_count > 0" class="mt-1 text-sm text-gray-400">
              {{ cat.children_count }} subcategories
            </p>
          </NuxtLink>
        </div>
        <div v-else class="text-gray-400">
          No categories found.
        </div>
      </div>
    </section>
  </div>
</template>
