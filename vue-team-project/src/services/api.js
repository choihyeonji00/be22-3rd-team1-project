const API_BASE_URL = 'http://localhost:3000'

export const api = {
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)
    return response.json()
  },

  async getMenuItems() {
    const response = await fetch(`${API_BASE_URL}/menuItems`)
    return response.json()
  },

  async getMenuItemsByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/menuItems?category=${category}`)
    return response.json()
  },

  async getPaymentMethods() {
    const response = await fetch(`${API_BASE_URL}/paymentMethods`)
    return response.json()
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    return response.json()
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`)
    return response.json()
  }
}
