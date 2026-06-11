import gql from 'graphql-tag'

export const GET_CATEGORY = gql`
  query GetCategory($id: Int!) {
    category(id: $id) {
      id
      name
      url_path
      url_key
      description
      image
      children_count
      children {
        id
        name
        url_path
        url_key
        children_count
      }
      breadcrumbs {
        category_id
        category_name
        category_url_path
      }
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      items {
        id
        name
        url_path
        url_key
        children_count
        children {
          id
          name
          url_path
          url_key
          children_count
          children {
            id
            name
            url_path
            url_key
          }
        }
      }
    }
  }
`

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: String!, $pageSize: Int!, $currentPage: Int!) {
    products(
      filter: { category_id: { eq: $categoryId } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      items {
        __typename
        sku
        name
        url_key
        url_suffix
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
          }
        }
        image {
          url
          label
        }
        small_image {
          url
          label
        }
        stock_status
      }
      total_count
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        sku
        name
        url_key
        url_suffix
        description {
          html
        }
        short_description {
          html
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
          }
          maximum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
          }
        }
        media_gallery_entries {
          id
          label
          position
          file
          types
        }
        image {
          url
          label
        }
        small_image {
          url
          label
        }
        thumbnail {
          url
          label
        }
        stock_status
        categories {
          id
          name
          url_path
          url_key
        }
        ... on ConfigurableProduct {
          configurable_options {
            attribute_code
            attribute_id
            label
            values {
              value_index
              label
              swatch_data {
                value
              }
            }
          }
          variants {
            product {
              sku
              name
              price_range {
                minimum_price {
                  regular_price {
                    value
                    currency
                  }
                  final_price {
                    value
                    currency
                  }
                }
              }
              image {
                url
                label
              }
              stock_status
            }
            attributes {
              code
              value_index
            }
          }
        }
      }
    }
  }
`

export const ADD_TO_CART = gql`
  mutation AddToCart($cartId: String!, $sku: String!, $quantity: Float!) {
    addSimpleProductsToCart(
      input: {
        cart_id: $cartId
        cart_items: [{ data: { sku: $sku, quantity: $quantity } }]
      }
    ) {
      cart {
        id
        items {
          id
          product {
            sku
            name
            price_range {
              minimum_price {
                regular_price {
                  value
                  currency
                }
              }
            }
          }
          quantity
          prices {
            row_total {
              value
              currency
            }
          }
        }
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`

export const CREATE_CART = gql`
  mutation CreateCart {
    createEmptyCart
  }
`

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!, $pageSize: Int!, $currentPage: Int!) {
    products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
      items {
        __typename
        sku
        name
        url_key
        url_suffix
        price_range {
          minimum_price {
            regular_price { value currency }
            final_price { value currency }
          }
        }
        image { url label }
        small_image { url label }
        stock_status
      }
      total_count
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($pageSize: Int!) {
    products(search: "", pageSize: $pageSize) {
      items {
        __typename
        sku
        name
        url_key
        url_suffix
        price_range {
          minimum_price {
            regular_price { value currency }
            final_price { value currency }
          }
        }
        image { url label }
        small_image { url label }
        stock_status
      }
    }
  }
`

export const GET_CART = gql`
  query GetCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      items {
        id
        product {
          sku
          name
          image {
            url
            label
          }
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
            }
          }
        }
        quantity
        prices {
          row_total {
            value
            currency
          }
        }
      }
      prices {
        subtotal_excluding_tax {
          value
          currency
        }
        subtotal_including_tax {
          value
          currency
        }
        grand_total {
          value
          currency
        }
        applied_taxes {
          label
          amount {
            value
            currency
          }
        }
      }
      shipping_addresses {
        firstname
        lastname
        street
        city
        postcode
        country {
          code
          label
        }
        selected_shipping_method {
          carrier_code
          method_code
          carrier_title
          method_title
          amount {
            value
            currency
          }
        }
      }
      billing_address {
        firstname
        lastname
        street
        city
        postcode
        country {
          code
          label
        }
      }
      email
    }
  }
`

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress(
    $cartId: String!
    $firstname: String!
    $lastname: String!
    $street: [String]!
    $city: String!
    $postcode: String!
    $countryCode: String!
    $telephone: String!
  ) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [
          {
            firstname: $firstname
            lastname: $lastname
            street: $street
            city: $city
            postcode: $postcode
            country_code: $countryCode
            telephone: $telephone
          }
        ]
      }
    ) {
      cart {
        id
        shipping_addresses {
          firstname
          lastname
          street
          city
          postcode
          country {
            code
            label
          }
          available_shipping_methods {
            carrier_code
            method_code
            carrier_title
            method_title
            amount {
              value
              currency
            }
          }
        }
      }
    }
  }
`

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod(
    $cartId: String!
    $carrierCode: String!
    $methodCode: String!
  ) {
    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: [
          {
            carrier_code: $carrierCode
            method_code: $methodCode
          }
        ]
      }
    ) {
      cart {
        id
        shipping_addresses {
          selected_shipping_method {
            carrier_code
            method_code
            carrier_title
            method_title
            amount {
              value
              currency
            }
          }
        }
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartId: String!, $itemId: Int!) {
    removeItemFromCart(
      input: {
        cart_id: $cartId
        cart_item_id: $itemId
      }
    ) {
      cart {
        id
        items {
          id
          product {
            sku
            name
            image { url label }
            price_range {
              minimum_price {
                regular_price { value currency }
              }
            }
          }
          quantity
          prices {
            row_total { value currency }
          }
        }
        prices {
          grand_total { value currency }
        }
      }
    }
  }
`
