export interface Money {
  value: number
  currency: string
}

export interface PriceRange {
  minimum_price: Price
  maximum_price?: Price
}

export interface Price {
  regular_price: Money
  final_price: Money
  discount?: {
    amount_off: number
    percent_off: number
  }
}

export interface ProductImage {
  url: string
  label: string
}

export interface Category {
  id: string
  name: string
  url_path: string
  url_key: string
  description?: string
  image?: string
  children_count: number
  children?: Category[]
  breadcrumbs?: Breadcrumb[]
}

export interface Breadcrumb {
  category_id: number
  category_name: string
  category_url_path: string
}

export interface Product {
  sku: string
  name: string
  url_key: string
  url_suffix?: string
  price_range: PriceRange
  image?: ProductImage
  small_image?: ProductImage
  thumbnail?: ProductImage
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK'
  description?: { html: string }
  short_description?: { html: string }
  media_gallery_entries?: MediaGalleryEntry[]
  categories?: Category[]
}

export interface ConfigurableProduct extends Product {
  configurable_options: ConfigurableOption[]
  variants: ConfigurableVariant[]
}

export interface ConfigurableOption {
  attribute_code: string
  attribute_id: number
  label: string
  values: ConfigurableOptionValue[]
}

export interface ConfigurableOptionValue {
  value_index: number
  label: string
  swatch_data?: {
    value: string
  }
}

export interface ConfigurableVariant {
  product: {
    sku: string
    name: string
    price_range: PriceRange
    image?: ProductImage
    stock_status: 'IN_STOCK' | 'OUT_OF_STOCK'
  }
  attributes: {
    code: string
    value_index: number
  }[]
}

export interface MediaGalleryEntry {
  id: number
  label: string
  position: number
  file: string
  types: string[]
}

export interface ProductsResult {
  items: Product[]
  total_count: number
  page_info: PageInfo | null
}

export interface PageInfo {
  page_size: number
  current_page: number
  total_pages: number
}

export interface CartItem {
  id: string
  product: {
    sku: string
    name: string
    image?: ProductImage
    price_range: PriceRange
  }
  quantity: number
  prices: {
    row_total: Money
  }
}

export interface CartPrices {
  subtotal_excluding_tax?: Money
  subtotal_including_tax?: Money
  grand_total: Money
  applied_taxes?: {
    label: string
    amount: Money
  }[]
}

export interface ShippingAddress {
  firstname: string
  lastname: string
  street: string[]
  city: string
  postcode: string
  country: {
    code: string
    label: string
  }
  telephone: string
  available_shipping_methods?: ShippingMethod[]
  selected_shipping_method?: ShippingMethod
}

export interface ShippingMethod {
  carrier_code: string
  method_code: string
  carrier_title: string
  method_title: string
  amount: Money
}

export interface Cart {
  id: string
  items?: CartItem[]
  prices?: CartPrices
  shipping_addresses?: ShippingAddress[]
  billing_address?: {
    firstname: string
    lastname: string
    street: string[]
    city: string
    postcode: string
    country: {
      code: string
      label: string
    }
  }
  email?: string
}

export interface Order {
  order_number: string
}

export interface AddressInput {
  firstname: string
  lastname: string
  street: string[]
  city: string
  postcode: string
  countryCode: string
  telephone: string
}

export interface FilterInput {
  category_id?: { eq: string }
  name?: { match: string }
  price?: { from?: number; to?: number }
  sku?: { eq: string }
}