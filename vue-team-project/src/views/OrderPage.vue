<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// const addToOrder = (menuWithQuantity) => {
//   orderStore.addItem(menuWithQuantity)
// }
const addToOrder = (orderData) => {
  // 1. 옵션 문자열 생성 (예: "Large, Bacon")
  const optionLabels = [];
  let optionsPriceSum = 0;
  
  if (orderData.selectedOptions && orderData.options) {
    Object.entries(orderData.selectedOptions).forEach(([groupName, value]) => {
      const optionGroup = orderData.options.find(opt => opt.name === groupName);
      if (!optionGroup) return;
      if (Array.isArray(value)) {
        // 다중 선택
        value.forEach(label => {
          optionLabels.push(label);
          const choice = optionGroup.choices.find(c => c.label === label);
          if (choice) optionsPriceSum += choice.price;
        });
      } else {
        // 단일 선택
        optionLabels.push(value);
        const choice = optionGroup.choices.find(c => c.label === value);
        if (choice) optionsPriceSum += choice.price;
      }
    });
  }
  const optionString = optionLabels.length > 0 ? ` (${optionLabels.join(', ')})` : '';
  
  // 2. 가공된 주문 데이터 준비
  const processedItem = {
    ...orderData,
    id: `${orderData.id}_${JSON.stringify(orderData.selectedOptions)}`, // 옵션별 고유 ID
    name: `${orderData.name}${optionString}`,
    price: orderData.price + optionsPriceSum, // 단가 (옵션 포함)
    quantity: orderData.quantity
  };
  orderStore.addItem(processedItem);
};

// 수량 증가
const increaseItemQuantity = (item) => {
  orderStore.updateQuantity(item.id, item.quantity + 1);
};
// 수량 감소 (1 이하로 내려가지 않게 처리)
const decreaseItemQuantity = (item) => {
  if (item.quantity > 1) {
    orderStore.updateQuantity(item.id, item.quantity - 1);
  } else {
    // 수량이 1일 때 마이너스를 누르면 삭제할지 물어보거나 무시
    // if (confirm('해당 메뉴를 삭제하시겠습니까?')) {
    //   orderStore.removeItem(item.id);
    // }
  }
};
// 항목 삭제
const removeItem = (itemId) => {
  orderStore.removeItem(itemId);
};

// Navigation
const handleCancel = () => {
  router.push('/')
}

const handlePay = () => {
  router.push('/payment-method')
}


const getCategoryIcon = (categoryId) => {
  const iconMap = {
    pizza: '🍕',
    hamburger: '🍔',
    drink: '🥤',
    sandwich: '🥪',
    side: '🍟',
    dessert: '🍰'
  }
  return iconMap[categoryId] || '🍽️'
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
            <img v-if="menu.image" :src="menu.image" :alt="menu.name" class="menu-img" />
            <span v-else class="menu-placeholder-icon">{{ getCategoryIcon(menu.category) }}</span>
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
          <!-- <span class="item-name">{{ item.name }}</span>
          <span class="item-qty">{{ item.quantity }}</span>
          <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }}원</span> -->
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
          </div>
          
          <div class="item-controls">
            <button class="qty-btn" @click="increaseItemQuantity(item)">+</button>
            <span class="item-qty">{{ item.quantity }}</span>
            <button class="qty-btn" @click="decreaseItemQuantity(item)">-</button>
          </div>
  
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

.menu-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  /* grid-template-columns: 2fr 1fr 1fr; */
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  background-color: var(--primary-orange);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.order-list-header .header-name {
  text-align: left;
}

.order-list-header .header-qty {
  text-align: center;
}

.order-list-header .header-price {
  text-align: center;
}

.order-list-body {
  max-height: 120px;
  overflow-y: auto;
}

.order-item {
  display: grid;
  /* grid-template-columns: 2fr 1fr 1fr; */
  grid-template-columns: 2fr 1.2fr 1.2fr;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff5252;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.item-qty {
  text-align: center;
  color: var(--primary-blue);
  font-weight: 600;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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


.timeout-actions {
  display: flex; gap: 10px;
}

.timeout-btn {
  flex: 1; padding: 14px;
  border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600; cursor: pointer;
}

.timeout-btn.cancel {
  background-color: #f0f0f0; color: #666;
}
.timeout-btn.continue {
  background-color: var(--primary-orange); color: white;
}
</style>
