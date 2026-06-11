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

const { data: categories } = await useAsyncData('nav-categories-v2', () => getCategories())

const topCategories = computed<Category[]>(() => {
  return (categories.value?.[0]?.children ?? []).filter(
    (cat: any) => Number(cat.product_count) > 0 || Number(cat.children_count) > 0,
  )
})

const activeMega = ref<number | null>(null)
const expandedMobile = ref<Set<number>>(new Set())
let closeTimer: ReturnType<typeof setTimeout> | null = null

const megaCategory = computed(() => {
  if (activeMega.value === null) return null
  return topCategories.value.find(c => Number(c.id) === activeMega.value) ?? null
})

const megaColumns = computed(() => {
  const cat = megaCategory.value as any
  if (!cat?.children) return []
  return cat.children.filter((c: any) => Number(c.product_count) > 0 || Number(c.children_count) > 0)
})

function openMega(id: number) {
  if (closeTimer) clearTimeout(closeTimer)
  activeMega.value = id
}

function scheduleClose() {
  closeTimer = setTimeout(() => { activeMega.value = null }, 200)
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

function isAncestorActive(cat: Category): boolean {
  if (isActive(Number(cat.id))) return true
  return cat.children?.some(c => isAncestorActive(c)) ?? false
}

function handleNavigate() {
  activeMega.value = null
  emit('navigate')
}
</script>

<template>
  <div v-if="topCategories.length > 0">
    <nav class="hidden lg:flex items-center gap-1">
      <button
        v-for="cat in topCategories"
        :key="cat.id"
        class="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        :class="isAncestorActive(cat as Category)
          ? 'text-violet-400 bg-violet-500/10'
          : 'text-obscure-text-secondary hover:text-white hover:bg-obscure-bg-elevated'"
        @mouseenter="openMega(Number(cat.id))"
        @mouseleave="scheduleClose"
        @click="handleNavigate"
      >
        <NuxtLink :to="`/category/${cat.id}`" class="block tracking-wide">
          {{ cat.name }}
        </NuxtLink>
      </button>
    </nav>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="activeMega !== null"
          class="fixed left-0 right-0 z-30"
          style="top: 64px"
          @mouseenter="activeMega && openMega(activeMega)"
          @mouseleave="scheduleClose"
        >
          <div class="bg-obscure-bg-secondary border-b border-obscure-border shadow-2xl shadow-black/10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div class="flex gap-10">
                <div class="w-48 shrink-0">
                  <NuxtLink :to="`/category/${megaCategory?.id}`" class="block" @click="handleNavigate">
                    <h3 class="text-lg font-bold text-white hover:text-violet-400 transition-colors">
                      {{ megaCategory?.name }}
                    </h3>
                    <p class="text-xs text-obscure-text-muted mt-1 hover:text-obscure-text-secondary transition-colors">
                      Shop all &rarr;
                    </p>
                  </NuxtLink>
                </div>

                <div
                  class="flex-1 grid gap-x-10 gap-y-6"
                  :style="{ gridTemplateColumns: `repeat(${Math.min(megaColumns.length || 2, 4)}, 1fr)` }"
                >
                  <div v-for="column in megaColumns" :key="column.id">
                    <NuxtLink
                      :to="`/category/${column.id}`"
                      class="block text-sm font-semibold text-white hover:text-violet-400 transition-colors mb-3"
                      @click="handleNavigate"
                    >
                      {{ column.name }}
                    </NuxtLink>
                    <ul v-if="(column as Category).children?.length" class="space-y-1.5">
                      <li v-for="grandchild in (column as Category).children" :key="grandchild.id">
                        <NuxtLink
                          :to="`/category/${grandchild.id}`"
                          class="text-sm text-obscure-text-muted hover:text-violet-400 transition-colors"
                          @click="handleNavigate"
                        >
                          {{ grandchild.name }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="w-56 shrink-0 hidden xl:block">
                  <div class="rounded-xl bg-violet-500/5 border border-violet-500/10 p-5">
                    <div class="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
                      <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 class="text-sm font-semibold text-white mb-1">{{ megaCategory?.name }}</h4>
                    <p class="text-xs text-obscure-text-muted mb-3">Browse all products</p>
                    <NuxtLink
                      :to="`/category/${megaCategory?.id}`"
                      class="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                      @click="handleNavigate"
                    >
                      Shop now &rarr;
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div v-if="mobileOpen" class="lg:hidden border-t border-obscure-border pt-3 pb-2">
      <div v-for="cat in topCategories" :key="cat.id">
        <button
          class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
          :class="isAncestorActive(cat as Category)
            ? 'text-violet-400 bg-violet-500/10'
            : 'text-obscure-text-secondary hover:text-white hover:bg-obscure-bg-elevated'"
          @click="toggleMobile(Number(cat.id))"
        >
          <NuxtLink :to="`/category/${cat.id}`" class="hover:text-violet-400" @click.stop="handleNavigate">
            {{ cat.name }}
          </NuxtLink>
          <svg
            v-if="((cat as Category).children?.length ?? 0) > 0"
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
            v-if="expandedMobile.has(Number(cat.id)) && ((cat as Category).children?.length ?? 0) > 0"
            class="overflow-hidden"
          >
            <div class="pl-6 py-1 space-y-0.5">
              <div
                v-for="child in (cat as Category).children?.filter((c: any) => Number(c.product_count) > 0 || Number(c.children_count) > 0)"
                :key="child.id"
              >
                <NuxtLink
                  :to="`/category/${child.id}`"
                  class="block px-3 py-2 text-sm text-obscure-text-secondary hover:text-violet-400 rounded-lg hover:bg-obscure-bg-elevated transition-colors"
                  @click="emit('navigate')"
                >
                  {{ child.name }}
                </NuxtLink>
                <div
                  v-if="((child as Category).children?.length ?? 0) > 0"
                  class="pl-6 border-l border-obscure-border ml-3 space-y-0.5"
                >
                  <NuxtLink
                    v-for="grandchild in (child as Category).children"
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