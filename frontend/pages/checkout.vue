<script setup lang="ts">
const { setShippingAddress, setShippingMethod, placeOrder } = useMagento()
const store = useMagentoStore()
const router = useRouter()
const orderNumber = ref<string | null>(null)
const submitting = ref(false)

const form = reactive({
  firstname: '',
  lastname: '',
  street: [''],
  city: '',
  postcode: '',
  countryCode: 'US',
  telephone: '',
})

async function handlePlaceOrder() {
  submitting.value = true
  try {
    await setShippingAddress({
      firstname: form.firstname,
      lastname: form.lastname,
      street: form.street,
      city: form.city,
      postcode: form.postcode,
      countryCode: form.countryCode,
      telephone: form.telephone,
    })

    await setShippingMethod('flatrate', 'flatrate')

    const number = await placeOrder()
    orderNumber.value = number
  } catch (e) {
    console.error('Checkout failed', e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-semibold mb-8">Checkout</h1>

    <div v-if="orderNumber" class="text-center py-16">
      <h2 class="text-3xl font-bold text-green-600">Order Placed!</h2>
      <p class="mt-4 text-gray-500">Order #{{ orderNumber }}</p>
      <NuxtLink to="/" class="mt-8 inline-block text-sm underline">Continue shopping</NuxtLink>
    </div>

    <form v-else @submit.prevent="handlePlaceOrder" class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input v-model="form.firstname" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input v-model="form.lastname" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Street Address</label>
        <input v-model="form.street[0]" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">City</label>
          <input v-model="form.city" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Postcode</label>
          <input v-model="form.postcode" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Telephone</label>
        <input v-model="form.telephone" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {{ submitting ? 'Processing...' : 'Place Order' }}
      </button>
    </form>
  </div>
</template>
