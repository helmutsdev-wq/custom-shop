<script setup lang="ts">
const store = useMagentoStore()

const itemCount = computed(() => store.cartItemCount)
const showCount = computed(() => itemCount.value > 0)
</script>

<template>
  <NuxtLink
    to="/cart"
    class="relative flex items-center gap-2 text-obscure-text-secondary hover:text-white transition-colors duration-200 group"
  >
    <div class="relative p-2 rounded-lg bg-obscure-bg-secondary group-hover:bg-obscure-bg-elevated transition-colors duration-200">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="scale-0 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-0 opacity-0"
      >
        <span
          v-if="showCount"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                 bg-violet-600 text-white text-[10px] font-bold rounded-full
                 flex items-center justify-center shadow-lg shadow-violet-500/30"
        >
          {{ itemCount > 99 ? '99+' : itemCount }}
        </span>
      </Transition>
    </div>

    <span class="hidden sm:inline text-sm font-medium">Cart</span>
  </NuxtLink>
</template>