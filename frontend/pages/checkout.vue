<script setup lang="ts">
const { setShippingAddress, setShippingMethod, placeOrder } = useMagento()
const store = useMagentoStore()
const router = useRouter()

const step = ref<'shipping' | 'review' | 'confirmation'>('shipping')
const orderNumber = ref<string | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  firstname: '',
  lastname: '',
  street: '',
  city: '',
  postcode: '',
  countryCode: 'US',
  telephone: '',
})

const cartTotal = computed(() => {
  const grand = store.cart?.prices?.grand_total
  if (!grand) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: grand.currency,
  }).format(grand.value)
})

const cartItems = computed(() => store.cart?.items ?? [])

onMounted(async () => {
  await store.fetchCart()
})

function validateForm(): boolean {
  if (!form.firstname || !form.lastname || !form.street || !form.city || !form.postcode || !form.telephone) {
    error.value = 'Please fill in all fields'
    return false
  }
  error.value = null
  return true
}

async function handleContinue() {
  if (!validateForm()) return
  step.value = 'review'
}

async function handlePlaceOrder() {
  submitting.value = true
  error.value = null
  try {
    await setShippingAddress({
      firstname: form.firstname,
      lastname: form.lastname,
      street: [form.street],
      city: form.city,
      postcode: form.postcode,
      countryCode: form.countryCode,
      telephone: form.telephone,
    })

    await setShippingMethod('flatrate', 'flatrate')

    const number = await placeOrder()
    orderNumber.value = number
    step.value = 'confirmation'
  } catch (e) {
    error.value = 'Failed to place order. Please try again.'
    console.error('Checkout failed', e)
  } finally {
    submitting.value = false
  }
}

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

const steps = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'review', label: 'Review' },
  { id: 'confirmation', label: 'Confirmation' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-white mb-8">Checkout</h1>

    <div class="flex items-center justify-center gap-2 mb-10">
      <template v-for="(s, index) in steps" :key="s.id">
        <div
          class="flex items-center gap-2"
          :class="step === s.id || (steps.findIndex(x => x.id === step) > index) ? 'text-violet-400' : 'text-obscure-text-muted'"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            :class="step === s.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
              : steps.findIndex(x => x.id === step) > index
                ? 'bg-green-500/20 text-green-400'
                : 'bg-obscure-bg-secondary text-obscure-text-muted'"
          >
            <svg v-if="steps.findIndex(x => x.id === step) > index" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="hidden sm:inline text-sm font-medium">{{ s.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-8 h-0.5 bg-obscure-border" />
      </template>
    </div>

    <div v-if="error" class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ error }}
    </div>

    <div v-if="step === 'shipping'" class="animate-fade-in">
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-white mb-6">Shipping Address</h2>

        <form @submit.prevent="handleContinue" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="input-label">First Name</label>
              <input
                v-model="form.firstname"
                required
                class="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label class="input-label">Last Name</label>
              <input
                v-model="form.lastname"
                required
                class="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label class="input-label">Street Address</label>
            <input
              v-model="form.street"
              required
              class="input-field"
              placeholder="123 Main Street"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label class="input-label">City</label>
              <input
                v-model="form.city"
                required
                class="input-field"
                placeholder="New York"
              />
            </div>
            <div>
              <label class="input-label">State / Province</label>
              <input
                v-model="form.postcode"
                required
                class="input-field"
                placeholder="NY"
              />
            </div>
            <div>
              <label class="input-label">ZIP / Postal Code</label>
              <input
                v-model="form.postcode"
                required
                class="input-field"
                placeholder="10001"
              />
            </div>
          </div>

          <div>
            <label class="input-label">Telephone</label>
            <input
              v-model="form.telephone"
              required
              type="tel"
              class="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div class="pt-4">
            <button type="submit" class="btn-primary w-full py-4">
              Continue to Review
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="step === 'review'" class="animate-fade-in space-y-6">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Shipping Address</h2>
          <button @click="step = 'shipping'" class="text-sm text-violet-400 hover:text-violet-300">
            Edit
          </button>
        </div>
        <p class="text-obscure-text-secondary">
          {{ form.firstname }} {{ form.lastname }}<br>
          {{ form.street }}<br>
          {{ form.city }}, {{ form.postcode }}<br>
          {{ form.telephone }}
        </p>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Shipping Method</h2>
        <div class="flex items-center justify-between p-4 rounded-lg bg-obscure-bg-secondary">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-white">Flat Rate</p>
              <p class="text-sm text-obscure-text-muted">Fixed shipping rate</p>
            </div>
          </div>
          <span class="font-semibold text-white">$5.00</span>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Order Summary</h2>
        <div class="space-y-3 mb-4">
          <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-obscure-bg-secondary overflow-hidden shrink-0">
              <img
                v-if="item.product.image?.url"
                :src="item.product.image.url"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ item.product.name }}</p>
              <p class="text-xs text-obscure-text-muted">Qty: {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-semibold text-white">
              {{ formatPrice(item.prices?.row_total?.value ?? 0, item.prices?.row_total?.currency ?? 'USD') }}
            </p>
          </div>
        </div>
        <div class="border-t border-obscure-border pt-4">
          <div class="flex items-center justify-between">
            <span class="text-obscure-text-secondary">Subtotal</span>
            <span class="text-white">{{ cartTotal }}</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-obscure-text-secondary">Shipping</span>
            <span class="text-white">$5.00</span>
          </div>
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-obscure-border">
            <span class="text-lg font-semibold text-white">Total</span>
            <span class="text-xl font-bold text-violet-400">{{ cartTotal }}</span>
          </div>
        </div>
      </div>

      <button
        @click="handlePlaceOrder"
        :disabled="submitting"
        class="btn-primary w-full py-4"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </span>
        <span v-else>Place Order</span>
      </button>
    </div>

    <div v-if="step === 'confirmation'" class="animate-fade-in text-center py-12">
      <div class="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
      <p class="text-obscure-text-secondary mb-2">Thank you for your purchase.</p>
      <p class="text-lg text-violet-400 font-semibold mb-8">Order #{{ orderNumber }}</p>

      <div class="card p-6 max-w-md mx-auto mb-8">
        <p class="text-sm text-obscure-text-muted mb-2">Shipping to:</p>
        <p class="text-white">
          {{ form.firstname }} {{ form.lastname }}<br>
          {{ form.street }}<br>
          {{ form.city }}, {{ form.postcode }}
        </p>
      </div>

      <NuxtLink to="/" class="btn-primary">
        Continue Shopping
      </NuxtLink>
    </div>
  </div>
</template>