export function useStoreConfig() {
  const { getStoreConfig, getThemeConfig } = useMagento()

  const { data: storeData } = useAsyncData('site-store-config', () => getStoreConfig(), {
    server: true,
  })

  const { data: themeData } = useAsyncData('site-theme-config', () => getThemeConfig(), {
    server: true,
  })

  const storeName = computed(() => storeData.value?.store_name || 'Store')
  const activeTheme = computed(() => themeData.value?.active_theme || 'dark')

  useHead({
    htmlAttrs: computed(() => ({
      'data-theme': activeTheme.value,
    })),
  })

  return {
    storeName,
    activeTheme,
    storeConfig: storeData,
  }
}