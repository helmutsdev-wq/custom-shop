import {
  GET_CATEGORIES,
  GET_CATEGORY,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_DETAIL,
  GET_FEATURED_PRODUCTS,
  SEARCH_PRODUCTS,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
  PLACE_ORDER,
} from '~/graphql/queries'

export function useMagento() {
  const store = useMagentoStore()
  const nuxtApp = useNuxtApp()
  const client = computed(() => nuxtApp._apolloClients?.default as any)

  function getClient() {
    if (!client.value) throw new Error('Apollo client not available')
    return client.value
  }

  async function getCategories() {
    const result = await getClient().query({
      query: GET_CATEGORIES,
      fetchPolicy: 'no-cache',
    })
    return result?.data?.categories?.items ?? []
  }

  async function getCategory(categoryId: string) {
    const result = await getClient().query({
      query: GET_CATEGORY,
      variables: { id: parseInt(categoryId) },
    })
    return result?.data?.category ?? null
  }

  async function getProductsByCategory(
    categoryId: string,
    pageSize = 20,
    currentPage = 1,
  ) {
    const result = await getClient().query({
      query: GET_PRODUCTS_BY_CATEGORY,
      variables: { categoryId, pageSize, currentPage },
    })
    return result?.data?.products ?? { items: [], total_count: 0 }
  }

  async function getProductDetail(sku: string) {
    const result = await getClient().query({
      query: GET_PRODUCT_DETAIL,
      variables: { sku },
    })
    const product = result?.data?.products?.items?.[0]
    if (product) return product

    const parts = sku.split('-')
    while (parts.length > 1) {
      parts.pop()
      const parentSku = parts.join('-')
      const retry = await getClient().query({
        query: GET_PRODUCT_DETAIL,
        variables: { sku: parentSku },
      })
      if (retry?.data?.products?.items?.[0]) {
        return retry.data.products.items[0]
      }
    }

    return null
  }

  async function getFeaturedProducts(pageSize = 8) {
    const result = await getClient().query({
      query: GET_FEATURED_PRODUCTS,
      variables: { pageSize },
    })
    return result?.data?.products?.items ?? []
  }

  async function searchProducts(search: string, pageSize = 20, currentPage = 1) {
    const result = await getClient().query({
      query: SEARCH_PRODUCTS,
      variables: { search, pageSize, currentPage },
    })
    return result?.data?.products ?? { items: [], total_count: 0, page_info: null }
  }

  async function addToCart(sku: string, quantity = 1) {
    return store.addToCart(sku, quantity)
  }

  async function getCart() {
    return store.cart
  }

  async function removeFromCart(itemId: string) {
    return store.removeFromCart(itemId)
  }

  async function setShippingAddress(address: {
    firstname: string
    lastname: string
    street: string[]
    city: string
    postcode: string
    countryCode: string
    telephone: string
  }) {
    const id = await store.ensureCart()
    const result = await getClient().mutate({
      mutation: SET_SHIPPING_ADDRESS,
      variables: { cartId: id, ...address },
    })
    if (result?.errors?.length) throw new Error(result.errors[0].message)
    return result?.data?.setShippingAddressesOnCart?.cart ?? null
  }

  async function setShippingMethod(carrierCode: string, methodCode: string) {
    const id = await store.ensureCart()
    const result = await getClient().mutate({
      mutation: SET_SHIPPING_METHOD,
      variables: { cartId: id, carrierCode, methodCode },
    })
    if (result?.errors?.length) throw new Error(result.errors[0].message)
    return result?.data?.setShippingMethodsOnCart?.cart ?? null
  }

  async function placeOrder() {
    const id = await store.ensureCart()
    const result = await getClient().mutate({
      mutation: PLACE_ORDER,
      variables: { cartId: id },
    })
    if (result?.errors?.length) throw new Error(result.errors[0].message)

    store.cartId.value = null
    store.cart = null

    return result?.data?.placeOrder?.order?.order_number ?? null
  }

  return {
    getCategories,
    getCategory,
    getProductsByCategory,
    getProductDetail,
    getFeaturedProducts,
    searchProducts,
    addToCart,
    getCart,
    removeFromCart,
    setShippingAddress,
    setShippingMethod,
    placeOrder,
  }
}