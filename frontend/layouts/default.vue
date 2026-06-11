<script setup lang="ts">
const route = useRoute()
const store = useMagentoStore()
const { storeName } = useStoreConfig()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

useHead(() => ({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} — ${storeName.value}` : storeName.value
  },
}))

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(async () => {
  await store.fetchCart()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-obscure-bg-primary">
    <header
      class="sticky top-0 z-40 border-b transition-all duration-300"
      :class="isScrolled
        ? 'bg-obscure-bg-primary/95 backdrop-blur-md border-obscure-border'
        : 'bg-transparent border-transparent'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <NuxtLink to="/" class="flex items-center gap-2 shrink-0 group">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span class="text-white text-xs font-bold font-mono tracking-tighter">&lt;/&gt;</span>
            </div>
            <span class="text-xl font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors">
              {{ storeName }}
            </span>
          </NuxtLink>

          <CategoryNav />

          <div class="hidden md:flex flex-1 justify-center max-w-xl">
            <SearchBar />
          </div>

          <nav class="flex items-center gap-3">
            <CartIcon />

            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2 rounded-lg text-obscure-text-muted hover:text-white hover:bg-obscure-bg-elevated transition-colors"
            >
              <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </nav>
        </div>

        <div v-if="isMobileMenuOpen" class="md:hidden pb-4 border-t border-obscure-border mt-2 pt-4">
          <SearchBar />
          <CategoryNav :mobile-open="true" @navigate="isMobileMenuOpen = false" />
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-obscure-border py-12 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span class="text-white text-xs font-bold font-mono tracking-tighter">&lt;/&gt;</span>
              </div>
              <span class="text-lg font-bold text-white">{{ storeName }}</span>
            </div>
            <p class="text-obscure-text-muted text-sm max-w-md">
              A modern headless e-commerce experience powered by Magento 2 and Nuxt 3.
              Built with Vue, TypeScript, and Tailwind CSS.
            </p>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Shop</h4>
            <ul class="space-y-2 text-sm text-obscure-text-muted">
              <li><NuxtLink to="/category/3" class="hover:text-violet-400 transition-colors">Gear</NuxtLink></li>
              <li><NuxtLink to="/category/20" class="hover:text-violet-400 transition-colors">Women</NuxtLink></li>
              <li><NuxtLink to="/category/21" class="hover:text-violet-400 transition-colors">Men</NuxtLink></li>
              <li><NuxtLink to="/category/4" class="hover:text-violet-400 transition-colors">Training</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Account</h4>
            <ul class="space-y-2 text-sm text-obscure-text-muted">
              <li><NuxtLink to="/cart" class="hover:text-violet-400 transition-colors">Cart</NuxtLink></li>
              <li><NuxtLink to="/checkout" class="hover:text-violet-400 transition-colors">Checkout</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Info</h4>
            <ul class="space-y-2 text-sm text-obscure-text-muted">
              <li><NuxtLink to="/page/about-us" class="hover:text-violet-400 transition-colors">About Us</NuxtLink></li>
              <li><NuxtLink to="/page/customer-service" class="hover:text-violet-400 transition-colors">Customer Service</NuxtLink></li>
              <li><NuxtLink to="/page/privacy-policy-cookie-restriction-mode" class="hover:text-violet-400 transition-colors">Privacy Policy</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-obscure-border mt-8 pt-8 text-center text-sm text-obscure-text-muted">
          <p>{{ storeName }} — Headless Magento 2 Demo. Built with Nuxt 3, Vue 3, and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  </div>
</template>