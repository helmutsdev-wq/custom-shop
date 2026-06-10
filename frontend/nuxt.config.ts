export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      magentoGraphqlUrl: process.env.NUXT_PUBLIC_MAGENTO_GRAPHQL_URL || 'https://localhost/graphql',
      magentoMediaUrl: process.env.NUXT_PUBLIC_MAGENTO_MEDIA_URL || 'https://localhost/media',
    },
  },

  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.NUXT_PUBLIC_MAGENTO_GRAPHQL_URL || 'http://nginx/graphql',
        browserHttpEndpoint: 'https://localhost/graphql',
        inMemoryCacheOptions: {
          typePolicies: {
            ProductInterface: {
              keyFields: ['sku'],
            },
            CategoryInterface: {
              keyFields: ['id'],
            },
          },
        },
      },
    },
  },

  tailwindcss: {
    exposeConfig: true,
  },

  nitro: {
    preset: 'node-server',
  },

  compatibilityDate: '2024-11-01',
})
