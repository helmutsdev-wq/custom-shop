<script setup lang="ts">
import type { Product } from '~/types/magento'

const { getCategories, getFeaturedProducts, addToCart } = useMagento()
const store = useMagentoStore()
const toast = ref<string | null>(null)

const { data: categories, pending: catPending } = await useAsyncData('categories', () =>
  getCategories(),
)

const { data: featured, pending: featPending } = await useAsyncData('featured', () =>
  getFeaturedProducts(8),
)

async function handleAddToCart(sku: string) {
  try {
    await addToCart(sku, 1)
    toast.value = 'Added to cart!'
    setTimeout(() => (toast.value = null), 3000)
  } catch (e) {
    toast.value = 'Failed to add to cart'
    setTimeout(() => (toast.value = null), 3000)
  }
}
</script>

<template>
  <div>
    <section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-hero-glow" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obscure-bg-primary" />

      <div class="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
        <div class="animate-fade-in">
          <span class="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-6 border border-violet-500/20">
            Headless Commerce Demo
          </span>
          <h1 class="text-5xl md:text-7xl font-bold tracking-tight">
            <span class="text-gradient">Obsidian</span>
            <span class="text-white"> Store</span>
          </h1>
          <p class="mt-6 text-lg text-obscure-text-secondary max-w-2xl mx-auto">
            A modern headless e-commerce experience powered by Magento 2 and Nuxt 3.
            Built with Vue 3, TypeScript, and Tailwind CSS.
          </p>
        </div>

        <div class="mt-10 flex items-center justify-center gap-4 animate-fade-in" style="animation-delay: 0.1s;">
          <NuxtLink
            to="/category/3"
            class="btn-primary"
          >
            Shop Gear
          </NuxtLink>
          <NuxtLink
            to="/category/20"
            class="btn-secondary"
          >
            Shop Women
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="section-title">Featured Products</h2>
          <p class="text-obscure-text-muted mt-1">Handpicked items just for you</p>
        </div>
        <NuxtLink to="/category/3" class="btn-ghost text-sm flex items-center gap-1">
          View All
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <div v-if="featPending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square bg-obscure-bg-secondary rounded-xl" />
          <div class="mt-3 h-4 bg-obscure-bg-secondary rounded w-3/4" />
          <div class="mt-1 h-4 bg-obscure-bg-secondary rounded w-1/4" />
        </div>
      </div>

      <div v-else-if="featured && featured.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in featured"
          :key="product.sku"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>
      <div v-else class="text-obscure-text-muted py-8 text-center">
        No featured products available.
      </div>
    </section>

    <section class="py-16 border-t border-obscure-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="section-title">Shop by Category</h2>
          <p class="text-obscure-text-muted mt-2">Explore our collections</p>
        </div>

        <div v-if="catPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="h-32 bg-obscure-bg-secondary rounded-xl" />
          </div>
        </div>

        <div v-else-if="categories && categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="(cat, index) in categories[0]?.children ?? []"
            :key="cat.id"
            :to="`/category/${cat.id}`"
            class="card group cursor-pointer"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="p-6 text-center">
              <div class="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors">
                <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="font-semibold text-white group-hover:text-violet-400 transition-colors">{{ cat.name }}</h3>
              <p v-if="cat.children_count > 0" class="mt-1 text-sm text-obscure-text-muted">
                {{ cat.children_count }} subcategories
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-obscure-text-muted text-center">
          No categories found.
        </div>
      </div>
    </section>

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