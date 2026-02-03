<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { orderStore } from '../stores/orderStore'
import { api } from '../services/api'
import OrderCompletionModal from '../components/OrderCompletionModal.vue'

const router = useRouter()

// Get data from order store
const selectedPaymentMethod = computed(() => orderStore.getSelectedPaymentMethod() || '카드결제')
const orderItems = computed(() => orderStore.getOrderList())
const totalPrice = orderStore.getTotalPrice
const totalDiscount = computed(() => orderStore.getTotalDiscount())
const finalPrice = computed(() => totalPrice.value - totalDiscount.value)

const isProcessing = ref(false)

// Modal state
const showModal = ref(false)
const completedOrderNumber = ref('')
const completedOrderItems = ref([])
const completedTotalPrice = ref(0)

const handleCancel = () => {
  router.push('/order')
}

// Generate 4-digit order number
const generate4DigitOrderNumber = () => {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0')
}

// Generate full order number for API (format: yyyyMMddHHmmss + random 4 digits)
const generateFullOrderNumber = () => {
  const now = new Date()
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  const random = generate4DigitOrderNumber()
  return { full: `ORD-${dateStr}-${random}`, short: random }
}

const handlePay = async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const orderNumbers = generateFullOrderNumber()
    const orderData = {
      orderNumber: orderNumbers.full,
      paymentMethod: selectedPaymentMethod.value,
      items: orderItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: finalPrice.value,
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    await api.createOrder(orderData)

    // Store completed order info for modal
    completedOrderNumber.value = orderNumbers.short
    completedOrderItems.value = [...orderItems.value]
    completedTotalPrice.value = totalPrice.value

    // Show completion modal
    showModal.value = true
  } catch (error) {
    console.error('Failed to save order:', error)
    showMessage('alert','결제 처리 실패','결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    isProcessing.value = false
  }
}

const handleGoHome = () => {
  orderStore.clearOrder()
  showModal.value = false
  router.push('/')
}

const handleComplete = () => {
  orderStore.clearOrder()
  showModal.value = false
  router.push('/')
}
</script>

<template>
  <div class="payment-confirm-page">
    <!-- Header -->
    <header class="page-header">
      <h1>결제 확인</h1>
    </header>

    <!-- Content -->
    <div class="page-content">
      <!-- Payment Method -->
      <div class="info-section payment-method-section">
        <span class="section-label">Payment :</span>
        <span class="payment-badge">{{ selectedPaymentMethod }}</span>
      </div>

      <!-- Menu List -->
      <div class="info-section menu-list-section">
        <span class="section-label">Menu :</span>

        <div class="menu-list-container">
          <div class="menu-list">
            <div
              v-for="item in orderItems"
              :key="item.id"
              class="menu-item"
            >
              <span class="menu-name">{{ item.name }}</span>
              <span class="menu-qty">x{{ item.quantity }}</span>
              <span class="menu-price">{{ (item.price * item.quantity).toLocaleString() }}원</span>
            </div>
          </div>

          <div class="total-row raw-total">
            <span class="total-label">total items :</span>
            <span class="total-value">{{ totalPrice.toLocaleString() }}원</span>
          </div>
          <div v-if="totalDiscount > 0" class="total-row discount-row">
            <span class="total-label">discount :</span>
            <span class="total-value">- {{ totalDiscount.toLocaleString() }}원</span>
          </div>
          <div class="total-row final-total">
            <span class="total-label">total payment :</span>
            <span class="total-value">{{ finalPrice.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <footer class="action-footer">
      <button class="footer-btn cancel" @click="handleCancel">
        취소
      </button>
      <button
        class="footer-btn pay"
        :disabled="isProcessing"
        @click="handlePay"
      >
        {{ isProcessing ? '처리중...' : '결제' }}
      </button>
    </footer>

    <!-- Order Completion Modal -->
    <OrderCompletionModal
      :is-open="showModal"
      :order-number="completedOrderNumber"
      :order-items="completedOrderItems"
      :total-price="completedTotalPrice"
      @go-home="handleGoHome"
      @complete="handleComplete"
    />
  </div>

    <MessageModal
    v-bind="modal"
    @close="modal.isOpen = false"
    @confirm="modal.onConfirm ? modal.onConfirm() : modal.isOpen = false"
  />
</template>

<style scoped>
.payment-confirm-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.page-header {
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Content */
.page-content {
  flex: 1;
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

/* Payment Method Section */
.payment-method-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payment-method-section .section-label {
  margin-bottom: 0;
}

.payment-badge {
  padding: 10px 20px;
  background-color: var(--primary-blue);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

/* Menu List Section */
.menu-list-section {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-list-container {
  background-color: var(--primary-blue);
  border-radius: 12px;
  overflow: hidden;
}

.menu-list {
  padding: 16px;
  max-height: 250px;
  overflow-y: auto;
}

.menu-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 0;
  color: white;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-name {
  font-weight: 500;
}

.menu-qty {
  text-align: center;
}

.menu-price {
  text-align: right;
  font-weight: 600;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.1);
  color: white;
}

.total-label {
  font-size: 14px;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
}

/* Action Footer */
.action-footer {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.footer-btn {
  flex: 1;
  padding: 20px 24px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn.cancel {
  background-color: var(--primary-blue);
  color: white;
}

.footer-btn.cancel:hover {
  background-color: var(--primary-blue-dark);
}

.footer-btn.pay {
  background-color: var(--primary-blue);
  color: white;
}

.footer-btn.pay:hover {
  background-color: var(--primary-blue-dark);
}

.footer-btn:active {
  transform: scale(0.98);
}

/* Scrollbar for menu list */
.menu-list::-webkit-scrollbar {
  width: 4px;
}

.menu-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.menu-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 480px) {
  .payment-method-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .footer-btn {
    padding: 16px 20px;
    font-size: 16px;
  }
}
</style>
