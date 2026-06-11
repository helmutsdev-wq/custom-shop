import { defineStore } from 'pinia'
import {
  CREATE_CART,
  ADD_TO_CART,
  GET_CART,
  REMOVE_FROM_CART,
} from '~/graphql/queries'

export const useMagentoStore = defineStore('magento', () => {
  const cartId = useCookie<string | null>('cart_id', {
    maxAge: 60 * 60 * 24 * 30,
  })

  const cart = ref<any>(null)
  const loading = ref(false)

  const nuxtApp = useNuxtApp()
  const client = computed(() => nuxtApp._apolloClients?.default as any)

  const cartItemCount = computed(() =>
    cart.value?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0,
  )

  function getClient() {
    if (!client.value) throw new Error('Apollo client not available')
    return client.value
  }

  async function ensureCart() {
    if (!cartId.value) {
      const result = await getClient().mutate({ mutation: CREATE_CART })
      cartId.value = result?.data?.createEmptyCart
    }
    return cartId.value
  }

  async function fetchCart() {
    if (!cartId.value) {
      cart.value = null
      return
    }
    loading.value = true
    try {
      const result = await getClient().query({
        query: GET_CART,
        variables: { cartId: cartId.value },
        fetchPolicy: 'no-cache',
      })
      cart.value = result?.data?.cart ?? null
    } finally {
      loading.value = false
    }
  }

  async function addToCart(sku: string, quantity = 1) {
    const id = await ensureCart()
    const result = await getClient().mutate({
      mutation: ADD_TO_CART,
      variables: { cartId: id, sku, quantity },
    })
    if (result?.errors?.length) throw new Error(result.errors[0].message)
    cart.value = result?.data?.addSimpleProductsToCart?.cart ?? null
    return cart.value
  }

  async function removeFromCart(itemId: string) {
    const id = await ensureCart()
    const result = await getClient().mutate({
      mutation: REMOVE_FROM_CART,
      variables: { cartId: id, itemId: parseInt(itemId) },
    })
    if (result?.errors?.length) throw new Error(result.errors[0].message)
    cart.value = result?.data?.removeItemFromCart?.cart ?? null
  }

  return {
    cartId,
    cart,
    loading,
    cartItemCount,
    removeFromCart,
    ensureCart,
    fetchCart,
    addToCart,
  }
})