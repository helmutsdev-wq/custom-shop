import {
  GET_CATEGORIES,
  GET_CATEGORY,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_DETAIL,
  GET_FEATURED_PRODUCTS,
  SEARCH_PRODUCTS,
  CREATE_CART,
  ADD_TO_CART,
  GET_CART,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
  PLACE_ORDER,
} from '~/graphql/queries'

export function useMagento() {
  const store = useMagentoStore()

  async function getCategories() {
    const { data } = await useAsyncQuery(GET_CATEGORIES)
    return data.value?.categories?.items ?? []
  }

  async function getCategory(categoryId: string) {
    const { data } = await useAsyncQuery(
      GET_CATEGORY,
      { id: parseInt(categoryId) },
    )
    return data.value?.category ?? null
  }

  async function getProductsByCategory(
    categoryId: string,
    pageSize = 20,
    currentPage = 1,
  ) {
    const { data } = await useAsyncQuery(
      GET_PRODUCTS_BY_CATEGORY,
      { categoryId, pageSize, currentPage },
    )
    return data.value?.products ?? { items: [], total_count: 0 }
  }

  async function getProductDetail(sku: string) {
    const { data } = await useAsyncQuery(
      GET_PRODUCT_DETAIL,
      { sku },
    )
    return data.value?.products?.items?.[0] ?? null
  }

  async function getFeaturedProducts(pageSize = 8) {
    const { data } = await useAsyncQuery(
      GET_FEATURED_PRODUCTS,
      { pageSize },
    )
    return data.value?.products?.items ?? []
  }

  async function searchProducts(search: string, pageSize = 20, currentPage = 1) {
    const { data } = await useAsyncQuery(
      SEARCH_PRODUCTS,
      { search, pageSize, currentPage },
    )
    return data.value?.products ?? { items: [], total_count: 0, page_info: null }
  }

  async function addToCart(sku: string, quantity = 1) {
    return store.addToCart(sku, quantity)
  }

  async function getCart() {
    return store.cart
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
    const { mutate } = useMutation(SET_SHIPPING_ADDRESS)
    const result = await mutate({ cartId: id, ...address })
    if (result?.error) throw new Error(result.error.message)
    return result?.data?.setShippingAddressesOnCart?.cart ?? null
  }

  async function setShippingMethod(carrierCode: string, methodCode: string) {
    const id = await store.ensureCart()
    const { mutate } = useMutation(SET_SHIPPING_METHOD)
    const result = await mutate({ cartId: id, carrierCode, methodCode })
    if (result?.error) throw new Error(result.error.message)
    return result?.data?.setShippingMethodsOnCart?.cart ?? null
  }

  async function placeOrder() {
    const id = await store.ensureCart()
    const { mutate } = useMutation(PLACE_ORDER)
    const result = await mutate({ cartId: id })
    if (result?.error) throw new Error(result.error.message)

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
    setShippingAddress,
    setShippingMethod,
    placeOrder,
  }
}
