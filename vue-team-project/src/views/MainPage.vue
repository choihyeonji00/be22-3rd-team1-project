<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const selectDiningOption = (option) => {
  // Navigate to order page (business logic will be added later)
  router.push('/order')
}

const goToAdmin = () => {
  // Admin navigation (business logic will be added later)
  router.push('/admin/login') // 관리자 로그인 페이지로 이동
}
</script>

<template>
  <div class="main-page">
    <!-- Admin Button -->
    <button class="admin-btn" @click="goToAdmin">
      관리자 페이지 이동
    </button>

    <!-- Background Area -->
    <div class="background-area">
      <div class="welcome-text">
        <h1>환영합니다</h1>
        <p>주문 방식을 선택해 주세요</p>
      </div>
    </div>

    <!-- Dining Options -->
    <div class="dining-options">
      <button
        class="dining-btn for-here"
        @click="selectDiningOption('forHere')"
      >
        <span class="dining-icon">🍽️</span>
        <span class="dining-text">매장</span>
        <span class="dining-subtitle">For Here</span>
      </button>

      <button
        class="dining-btn to-go"
        @click="selectDiningOption('toGo')"
      >
        <span class="dining-icon">🛍️</span>
        <span class="dining-text">포장</span>
        <span class="dining-subtitle">To Go</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  padding: 20px;
}

.admin-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 10px 16px;
  background-color: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.admin-btn:hover {
  background-color: var(--primary-blue-dark);
  transform: translateY(-2px);
}

.background-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.welcome-text {
  text-align: center;
  color: white;
}

.welcome-text h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-text p {
  font-size: 20px;
  opacity: 0.9;
}

.dining-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  margin-bottom: 40px;
}

.dining-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.dining-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.dining-btn:active {
  transform: translateY(-2px);
}

.for-here {
  background: linear-gradient(145deg, #4fc3f7, #29b6f6);
}

.to-go {
  background: linear-gradient(145deg, #81d4fa, #4fc3f7);
}

.dining-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.dining-text {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.dining-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .welcome-text h1 {
    font-size: 36px;
  }

  .welcome-text p {
    font-size: 16px;
  }

  .dining-btn {
    padding: 24px 16px;
  }

  .dining-icon {
    font-size: 36px;
  }

  .dining-text {
    font-size: 22px;
  }
}
</style>