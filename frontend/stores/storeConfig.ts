import { defineStore } from 'pinia'
import { GET_STORE_CONFIG } from '~/graphql/queries'

export const useStoreConfigStore = defineStore('storeConfig', () => {
  const storeConfig = ref<any>(null)
  const pending = ref(false)

  const storeName = computed(() => storeConfig.value?.store_name || 'helmutsDev Store')

  async function fetchConfig() {
    if (storeConfig.value) return
    const nuxtApp = useNuxtApp()
    const client = nuxtApp._apolloClients?.default as any
    if (!client) return

    pending.value = true
    try {
      const result = await client.query({
        query: GET_STORE_CONFIG,
        fetchPolicy: 'no-cache',
      })
      storeConfig.value = result?.data?.storeConfig ?? null
    } catch {
      // Silently fail, fallback storeName will be used
    } finally {
      pending.value = false
    }
  }

  return {
    storeConfig,
    storeName,
    pending,
    fetchConfig,
  }
})