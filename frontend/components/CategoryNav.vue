<script setup lang="ts">
import type { Category } from '~/types/magento'

interface Props {
  mobileOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mobileOpen: false,
})

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const { getCategories } = useMagento()

const { data: categories } = await useAsyncData('nav-categories', () => getCategories())

const topCategories = computed<Category[]>(() => {
  return categories.value?.[0]?.children ?? []
})

const activeDropdown = ref<number | null>(null)
const expandedMobile = ref<Set<number>>(new Set())
let closeTimer: ReturnType<typeof setTimeout> | null = null

function openDropdown(id: number) {
  if (closeTimer) clearTimeout(closeTimer)
  activeDropdown.value = id
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    activeDropdown.value = null
  }, 150)
}

function toggleMobile(categoryId: number) {
  if (expandedMobile.value.has(categoryId)) {
    expandedMobile.value.delete(categoryId)
  } else {
    expandedMobile.value.add(categoryId)
  }
}

function isActive(categoryId: number): boolean {
  return route.params.id === String(categoryId)
}

function isAncestorActive(category: Category): boolean {
  if (isActive(Number(category.id))) return true
  return category.children?.some(c => isAncestorActive(c)) ?? false
}

function handleNavigate() {
  activeDropdown.value = null
  emit('navigate')
}
</script>

<template>
  <div v-if="topCategories.length > 0">
    <!-- Desktop Navigation -->
    <nav class="hidden lg:flex items-center gap-1">
      <button
        v-for="cat in topCategories"
        :key="cat.id"
        class="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        :class="isAncestorActive(cat)
          ? 'text-violet-400 bg-violet-500/10'
          : 'text-obscure-text-secondary hover:text-white hover:bg-obscure-bg-elevated'"
        @mouseenter="openDropdown(Number(cat.id))"
        @mouseleave="scheduleClose"
        @click="handleNavigate"
      >
        <NuxtLink :to="`/category/${cat.id}`" class="block">
          {{ cat.name }}
        </NuxtLink>

        <!-- Dropdown Panel -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="activeDropdown === Number(cat.id) && (cat.children?.length ?? 0) > 0"
            class="absolute top-full left-0 mt-1 bg-obscure-bg-secondary border border-obscure-border rounded-xl shadow-xl shadow-black/20 min-w-[480px] z-50"
            @mouseenter="openDropdown(Number(cat.id))"
            @mouseleave="scheduleClose"
          >
            <div class="p-6 grid gap-6" :style="{ gridTemplateColumns: `repeat(${Math.min(cat.children?.length ?? 1, 4)}, 1fr)` }">
              <div v-for="child in cat.children" :key="child.id" class="min-w-0">
                <NuxtLink
                  :to="`/category/${child.id}`"
                  class="block text-sm font-semibold text-white hover:text-violet-400 transition-colors mb-2"
                  @click="handleNavigate"
                >
                  {{ child.name }}
                </NuxtLink>
                <div v-if="(child.children?.length ?? 0) > 0" class="space-y-1">
                  <NuxtLink
                    v-for="grandchild in child.children"
                    :key="grandchild.id"
                    :to="`/category/${grandchild.id}`"
                    class="block text-sm text-obscure-text-muted hover:text-violet-400 transition-colors truncate"
                    @click="handleNavigate"
                  >
                    {{ grandchild.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </button>
    </nav>

    <!-- Mobile Accordion -->
    <div v-if="mobileOpen" class="lg:hidden border-t border-obscure-border pt-3 pb-2">
      <div v-for="cat in topCategories" :key="cat.id">
        <button
          class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
          :class="isAncestorActive(cat)
            ? 'text-violet-400 bg-violet-500/10'
            : 'text-obscure-text-secondary hover:text-white hover:bg-obscure-bg-elevated'"
          @click="toggleMobile(Number(cat.id))"
        >
          <NuxtLink
            :to="`/category/${cat.id}`"
            class="hover:text-violet-400"
            @click.stop="handleNavigate"
          >
            {{ cat.name }}
          </NuxtLink>
          <svg
            v-if="(cat.children?.length ?? 0) > 0"
            class="w-4 h-4 transition-transform duration-200"
            :class="expandedMobile.has(Number(cat.id)) ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="expandedMobile.has(Number(cat.id)) && (cat.children?.length ?? 0) > 0"
            class="overflow-hidden"
          >
            <div class="pl-6 py-1 space-y-0.5">
              <div v-for="child in cat.children" :key="child.id">
                <NuxtLink
                  :to="`/category/${child.id}`"
                  class="block px-3 py-2 text-sm text-obscure-text-secondary hover:text-violet-400 rounded-lg hover:bg-obscure-bg-elevated transition-colors"
                  @click="emit('navigate')"
                >
                  {{ child.name }}
                </NuxtLink>
                <div
                  v-if="(child.children?.length ?? 0) > 0"
                  class="pl-6 border-l border-obscure-border ml-3 space-y-0.5"
                >
                  <NuxtLink
                    v-for="grandchild in child.children"
                    :key="grandchild.id"
                    :to="`/category/${grandchild.id}`"
                    class="block px-3 py-1.5 text-sm text-obscure-text-muted hover:text-violet-400 rounded-lg hover:bg-obscure-bg-elevated transition-colors"
                    @click="emit('navigate')"
                  >
                    {{ grandchild.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>