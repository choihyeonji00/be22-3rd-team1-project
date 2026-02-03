<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const orders = ref([])
const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Fetch data on component mount
onMounted(async () => {
  await refreshData()
})

const refreshData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [ordersData, categoriesData] = await Promise.all([
      api.getSalesStatistics(),
      api.getCategories()
    ])
    orders.value = ordersData
    categories.value = categoriesData
  } catch (error) {
    console.error('Failed to fetch sales data:', error)
    errorMessage.value = '매출 데이터를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '알 수 없음'
}

// Computed properties for statistics
const totalSales = computed(() => {
  return orders.value.reduce((sum, order) => sum + order.totalPrice, 0)
})

const salesByCategory = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      const categoryName = getCategoryName(item.category)
      if (!stats[categoryName]) {
        stats[categoryName] = 0
      }
      stats[categoryName] += item.price * item.quantity
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

const salesByMenuItem = computed(() => {
  const stats = {}
  orders.value.forEach(order => {
    order.items.forEach(item => {
      if (!stats[item.name]) {
        stats[item.name] = 0
      }
      stats[item.name] += item.price * item.quantity
    })
  })
  return Object.entries(stats).sort(([, a], [, b]) => b - a)
})

const goToDashboard = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="admin-sales-stats">
    <header class="admin-header">
      <h1>매출 통계</h1>
      <button @click="goToDashboard" class="back-btn">대시보드로</button>
    </header>

    <div class="content-area">
      <p v-if="errorMessage" class="error-message-banner">{{ errorMessage }}</p>

      <div v-if="isLoading" class="loading-spinner">매출 데이터를 불러오는 중...</div>
      <div v-else class="stats-grid">
        <div class="stat-card total-sales">
          <h3>총 매출</h3>
          <p class="stat-value">{{ totalSales.toLocaleString() }}원</p>
        </div>

        <div class="stat-card">
          <h3>카테고리별 매출</h3>
          <ul>
            <li v-for="[category, sales] in salesByCategory" :key="category">
              {{ category }}: <span>{{ sales.toLocaleString() }}원</span>
            </li>
            <li v-if="salesByCategory.length === 0">데이터 없음</li>
          </ul>
        </div>

        <div class="stat-card">
          <h3>메뉴별 매출</h3>
          <ul>
            <li v-for="[menu, sales] in salesByMenuItem" :key="menu">
              {{ menu }}: <span>{{ sales.toLocaleString() }}원</span>
            </li>
            <li v-if="salesByMenuItem.length === 0">데이터 없음</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-sales-stats {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--primary-blue);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 28px;
}

.back-btn {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.back-btn:hover {
  background-color: #5a6268;
}

.content-area {
  flex: 1;
  padding: 20px 40px;
}

.error-message-banner {
  color: #e74c3c;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.stat-card h3 {
  color: var(--primary-blue);
  font-size: 22px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.stat-card .stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-green);
  margin-top: 10px;
}

.stat-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stat-card li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  font-size: 16px;
  color: #555;
}

.stat-card li:last-child {
  border-bottom: none;
}

.stat-card li span {
  font-weight: 600;
  color: #333;
}
</style>
