<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MenuInfoModal from '../components/MenuInfoModal.vue'
import { api } from '../services/api'
import { orderStore } from '../stores/orderStore'

const router = useRouter()

// Data fetched from JSON Server
const categories = ref([])
const menuItems = ref([])
const activeCategory = ref('pizza')
const isLoading = ref(true)

// Fetch data on component mount
onMounted(async () => {
  try {
    const [categoriesData, menuItemsData] = await Promise.all([
      api.getCategories(),
      api.getMenuItems()
    ])
    categories.value = categoriesData
    menuItems.value = menuItemsData
    if (categoriesData.length > 0) {
      activeCategory.value = categoriesData[0].id
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
})

// Pagination
const currentPage = ref(0)
const itemsPerPage = 6

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => item.category === activeCategory.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMenuItems.value.length / itemsPerPage)
})

const paginatedMenuItems = computed(() => {
  const start = currentPage.value * itemsPerPage
  const end = start + itemsPerPage
  return filteredMenuItems.value.slice(start, end)
})

const selectCategory = (categoryId) => {
  activeCategory.value = categoryId
  currentPage.value = 0
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

// Order list from store (shared state)
const orderList = computed(() => orderStore.getOrderList())
const totalPrice = orderStore.getTotalPrice

// Modal state
const isModalOpen = ref(false)
const selectedMenu = ref(null)

const openMenuModal = (menu) => {
  selectedMenu.value = menu
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMenu.value = null
}

const addToOrder = (menuWithQuantity) => {
  orderStore.addItem(menuWithQuantity)
}

// Navigation
const handleCancel = () => {
  router.push('/')
}

const handlePay = () => {
  router.push('/payment-method')
}
</script>

<template>
  <div class="order-page">
    <!-- Header with Logo -->
    <header class="order-header">
      <div class="logo">
        <span class="logo-text">KIOSK</span>
      </div>
    </header>

    <!-- Category Navigation -->
    <nav class="category-nav">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="['category-btn', { active: activeCategory === category.id }]"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </nav>

    <!-- Menu Grid -->
    <section class="menu-section">
      <div class="menu-grid">
        <button
          v-for="menu in paginatedMenuItems"
          :key="menu.id"
          class="menu-card"
          @click="openMenuModal(menu)"
        >
          <div class="menu-card-image">
            <span class="menu-placeholder-icon">🍕</span>
          </div>
          <div class="menu-card-info">
            <p class="menu-card-name">{{ menu.name }}</p>
            <p class="menu-card-price">{{ menu.price.toLocaleString() }}원</p>
          </div>
        </button>

        <!-- Empty slots to maintain grid -->
        <div
          v-for="n in (itemsPerPage - paginatedMenuItems.length)"
          :key="'empty-' + n"
          class="menu-card empty"
        ></div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="page-btn prev"
          :disabled="currentPage === 0"
          @click="prevPage"
        >
          이전
        </button>

        <div class="page-dots">
          <span
            v-for="(page, index) in totalPages"
            :key="index"
            :class="['dot', { active: currentPage === index }]"
            @click="currentPage = index"
          ></span>
        </div>

        <button
          class="page-btn next"
          :disabled="currentPage >= totalPages - 1"
          @click="nextPage"
        >
          다음
        </button>
      </div>
    </section>

    <!-- Order List -->
    <section class="order-list-section">
      <div class="order-list-header">
        <span class="header-name">메뉴명</span>
        <span class="header-qty">수량</span>
        <span class="header-price">가격</span>
      </div>

      <div class="order-list-body">
        <div
          v-for="item in orderList"
          :key="item.id"
          class="order-item"
        >
          <span class="item-name">{{ item.name }}</span>
          <span class="item-qty">{{ item.quantity }}</span>
          <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}원</span>
        </div>

        <div v-if="orderList.length === 0" class="empty-order">
          주문 내역이 없습니다
        </div>
      </div>
    </section>

    <!-- Bottom Action Bar -->
    <footer class="action-bar">
      <div class="total-price">
        <span class="total-label">주문 금액</span>
        <span class="total-value">{{ totalPrice.toLocaleString() }}원</span>
      </div>

      <div class="action-buttons">
        <button class="action-btn cancel" @click="handleCancel">
          취소
        </button>
        <button
          class="action-btn pay"
          :disabled="orderList.length === 0"
          @click="handlePay"
        >
          결제
        </button>
      </div>
    </footer>

    <!-- Menu Info Modal -->
    <MenuInfoModal
      v-if="selectedMenu"
      :menu="selectedMenu"
      :isOpen="isModalOpen"
      @close="closeModal"
      @add="addToOrder"
    />
  </div>
</template>

<style scoped>
.order-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.order-header {
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-blue);
  background-color: var(--primary-blue);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

/* Category Navigation */
.category-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn.active {
  background-color: white;
  color: var(--primary-orange);
}

.category-btn:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Menu Section */
.menu-section {
  flex: 1;
  padding: 16px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.menu-card {
  background-color: var(--primary-blue);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-card.empty {
  background-color: transparent;
  cursor: default;
}

.menu-card.empty:hover {
  transform: none;
  box-shadow: none;
}

.menu-card-image {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-placeholder-icon {
  font-size: 36px;
}

.menu-card-info {
  padding: 10px;
  color: white;
}

.menu-card-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-card-price {
  font-size: 12px;
  opacity: 0.9;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.page-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-blue);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--primary-blue-dark);
}

.page-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: var(--text-dark);
}

/* Order List Section */
.order-list-section {
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.order-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.order-list-body {
  max-height: 120px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-qty {
  text-align: center;
  color: var(--primary-blue);
  font-weight: 600;
}

.item-price {
  text-align: right;
  color: var(--primary-green);
  font-weight: 600;
}

.empty-order {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.total-price {
  flex: 1;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  border-radius: 8px;
  color: white;
}

.total-label {
  display: block;
  font-size: 12px;
  opacity: 0.9;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.cancel {
  background-color: var(--primary-orange);
  color: white;
}

.action-btn.pay {
  background-color: var(--primary-green);
  color: white;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
  }

  .total-price {
    width: 100%;
    text-align: center;
  }

  .action-buttons {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }
}
</style>
