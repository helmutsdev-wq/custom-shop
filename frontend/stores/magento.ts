import { defineStore } from 'pinia'
import {
  CREATE_CART,
  ADD_TO_CART,
  GET_CART,
} from '~/graphql/queries'

interface CartItem {
  id: string
  product: {
    sku: string
    name: string
    image?: { url: string; label?: string }
  }
  quantity: number
  prices?: {
    row_total?: { value: number; currency: string }
  }
}

interface Cart {
  id: string
  items: CartItem[]
  prices?: {
    grand_total?: { value: number; currency: string }
    subtotal_excluding_tax?: { value: number; currency: string }
  }
}

export const useMagentoStore = defineStore('magento', () => {
  const cartId = useCookie<string | null>('cart_id', {
    maxAge: 60 * 60 * 24 * 30,
  })

  const cart = ref<Cart | null>(null)
  const loading = ref(false)

  const cartItemCount = computed(() =>
    cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  )

  async function ensureCart() {
    if (!cartId.value) {
      const { mutate } = useMutation(CREATE_CART)
      const result = await mutate()
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
      const { data } = await useAsyncQuery(GET_CART, {
        cartId: cartId.value,
      })
      cart.value = data.value?.cart ?? null
    } finally {
      loading.value = false
    }
  }

  async function addToCart(sku: string, quantity = 1) {
    const id = await ensureCart()
    const { mutate } = useMutation(ADD_TO_CART)
    const result = await mutate({ cartId: id, sku, quantity })
    if (result?.error) throw new Error(result.error.message)
    cart.value = result?.data?.addSimpleProductsToCart?.cart ?? null
    return cart.value
  }

  return {
    cartId,
    cart,
    loading,
    cartItemCount,
    ensureCart,
    fetchCart,
    addToCart,
  }
})
