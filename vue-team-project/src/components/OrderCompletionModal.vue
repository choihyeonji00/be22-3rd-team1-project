<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderNumber: {
    type: String,
    required: true
  },
  orderItems: {
    type: Array,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['goHome', 'complete'])

const handleGoHome = () => {
  emit('goHome')
}

const handleComplete = () => {
  emit('complete')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <!-- Header -->
        <h2 class="modal-title">Order completion Guide</h2>

        <!-- Body -->
        <div class="modal-body">
          <!-- Order Number Section -->
          <div class="order-number-section">
            <span class="order-number-label">주문번호</span>
            <span class="order-number-value">{{ orderNumber }}</span>
          </div>

          <!-- Order Info Section -->
          <div class="order-info-section">
            <span class="order-info-label">주문 정보</span>
            <div class="order-items-list">
              <div
                v-for="item in orderItems"
                :key="item.id"
                class="order-item"
              >
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}원</span>
              </div>
            </div>
          </div>

          <!-- Total Price -->
          <div class="order-total-section">
            <span class="order-total-label">주문 금액 :</span>
            <span class="order-total-value">{{ totalPrice.toLocaleString() }}원</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="action-btn home-btn" @click="handleGoHome">
            처음으로
          </button>
          <button class="action-btn complete-btn" @click="handleComplete">
            완료
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Modal Overlay - matches MenuInfoModal pattern */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: var(--primary-yellow);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  padding: 20px;
  background-color: var(--primary-blue);
  color: var(--text-light);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Order Number Section */
.order-number-section {
  text-align: center;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-bottom: 16px;
}

.order-number-label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.order-number-value {
  display: block;
  font-size: 64px;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: 8px;
}

/* Order Info Section */
.order-info-section {
  background-color: var(--primary-blue);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-info-label {
  display: block;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 12px;
}

.order-items-list {
  min-height: 100px;
  max-height: 180px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-light);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-qty {
  text-align: center;
}

.item-price {
  text-align: right;
  font-weight: 600;
}

/* Order Total Section */
.order-total-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.order-total-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.order-total-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Modal Actions - matches MenuInfoModal */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}

.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn {
  background-color: #e57373;
  color: var(--text-light);
}

.home-btn:hover {
  background-color: #ef5350;
}

.complete-btn {
  background-color: var(--primary-blue);
  color: var(--text-light);
}

.complete-btn:hover {
  background-color: var(--primary-blue-dark);
}

.action-btn:active {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 480px) {
  .order-number-value {
    font-size: 48px;
    letter-spacing: 4px;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
