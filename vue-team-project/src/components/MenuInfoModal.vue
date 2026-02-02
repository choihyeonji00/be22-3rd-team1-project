<script setup>
import { ref } from 'vue'

const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'add'])

const quantity = ref(1)

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleCancel = () => {
  quantity.value = 1
  emit('close')
}

const handleAdd = () => {
  emit('add', { ...props.menu, quantity: quantity.value })
  quantity.value = 1
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <!-- Menu Image -->
        <div class="menu-image">
          <img v-if="menu.image" :src="menu.image" :alt="menu.name" />
          <span v-else class="menu-placeholder-icon">🍕</span>
        </div>

        <!-- Menu Info -->
        <div class="menu-info">
          <h2 class="menu-name">{{ menu.name }}</h2>
          <p class="menu-description">{{ menu.description }}</p>
          <p class="menu-price">{{ menu.price?.toLocaleString() }}원</p>
        </div>

        <!-- Quantity Controls -->
        <div class="quantity-controls">
          <button class="quantity-btn" @click="decreaseQuantity">-</button>
          <span class="quantity-value">{{ quantity }}</span>
          <button class="quantity-btn" @click="increaseQuantity">+</button>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="action-btn cancel-btn" @click="handleCancel">
            취소
          </button>
          <button class="action-btn add-btn" @click="handleAdd">
            담기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
  background-color: #f0c14b;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
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

.menu-image {
  width: 100%;
  height: 200px;
  background-color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder-icon {
  font-size: 64px;
}

.menu-info {
  padding: 20px;
  text-align: center;
}

.menu-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.menu-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.menu-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-dark);
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.3);
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #333;
  border-radius: 8px;
  background-color: white;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity-value {
  font-size: 28px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
}

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

.cancel-btn {
  background-color: #e57373;
  color: white;
}

.cancel-btn:hover {
  background-color: #ef5350;
}

.add-btn {
  background-color: var(--primary-blue);
  color: white;
}

.add-btn:hover {
  background-color: var(--primary-blue-dark);
}

.action-btn:active {
  transform: scale(0.98);
}
</style>
