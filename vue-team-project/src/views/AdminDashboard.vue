<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMenuManagement = () => {
  router.push('/admin/menu')
}

const goToSalesStats = () => {
  router.push('/admin/sales')
}

const logout = () => {
  // TODO: 실제 구현 시, 인증 상태를 초기화하고 로그인 페이지로 리다이렉트
  console.log('Admin logged out')
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <h1>{{ $t('admin.dashboard_title') }}</h1>
      <button @click="logout" class="logout-btn">{{ $t('admin.logout') }}</button>
    </header>

    <div class="dashboard-content">
      <div class="dashboard-card" @click="goToMenuManagement">
        <span class="card-icon">🍕</span>
        <h2>{{ $t('admin.menu_management') }}</h2>
        <p>{{ $t('admin.menu_desc') }}</p>
      </div>

      <div class="dashboard-card" @click="goToSalesStats">
        <span class="card-icon">📊</span>
        <h2>{{ $t('admin.sales_stats') }}</h2>
        <p>{{ $t('admin.sales_desc') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
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

.logout-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  padding: 40px;
}

.dashboard-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 300px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 60px;
  margin-bottom: 20px;
  display: block;
}

.dashboard-card h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--primary-blue);
}

.dashboard-card p {
  font-size: 16px;
  color: #666;
}
</style>
