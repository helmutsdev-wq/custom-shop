export function useStoreConfig() {
  const { getStoreConfig } = useMagento()

  const { data } = useAsyncData('site-store-config', () => getStoreConfig(), {
    server: true,
  })

  const storeName = computed(() => data.value?.store_name || 'Store')

  return {
    storeName,
    storeConfig: data,
  }
}