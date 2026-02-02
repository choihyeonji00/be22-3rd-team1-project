import { reactive, computed } from 'vue'

const state = reactive({
  orderList: [],
  selectedPaymentMethod: null
})

export const orderStore = {
  // Getters
  getOrderList: () => state.orderList,

  getTotalPrice: computed(() => {
    return state.orderList.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }),

  getSelectedPaymentMethod: () => state.selectedPaymentMethod,

  // Actions
  addItem(item) {
    const existingIndex = state.orderList.findIndex(i => i.id === item.id)
    if (existingIndex >= 0) {
      state.orderList[existingIndex].quantity += item.quantity
    } else {
      state.orderList.push({ ...item })
    }
  },

  removeItem(itemId) {
    const index = state.orderList.findIndex(i => i.id === itemId)
    if (index >= 0) {
      state.orderList.splice(index, 1)
    }
  },

  updateQuantity(itemId, quantity) {
    const item = state.orderList.find(i => i.id === itemId)
    if (item) {
      item.quantity = quantity
    }
  },

  setPaymentMethod(method) {
    state.selectedPaymentMethod = method
  },

  clearOrder() {
    state.orderList = []
    state.selectedPaymentMethod = null
  }
}
