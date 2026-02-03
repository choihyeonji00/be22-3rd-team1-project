<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { orderStore } from './stores/orderStore'

const router = useRouter()
const route = useRoute()

// --- ⏳ Global Session Timeout Logic ---
const TIMEOUT_LIMIT = 60 * 1000 // 60 seconds
const lastActionTime = ref(Date.now())
const isTimeoutModalOpen = ref(false)
const remainingTime = ref(60) // Visible countdown
let timerInterval = null

// Reset timer on user interaction
const resetTimer = () => {
  lastActionTime.value = Date.now()
  remainingTime.value = 60
}

// Check if current page requires timeout monitoring
const isMonitorablePage = () => {
  // Exclude Home and Admin pages. 
  // PaymentConfirm is INCLUDED because it's a "Review" page before actual payment.
  if (route.path === '/' || route.path.startsWith('/admin')) {
    return false
  }
  return true
}

// Check timeout every second
const checkTimeout = () => {
  if (!isMonitorablePage()) return
  if (isTimeoutModalOpen.value) return 

  const now = Date.now()
  const elapsed = now - lastActionTime.value
  const timeLeft = Math.max(0, Math.ceil((TIMEOUT_LIMIT - elapsed) / 1000))
  
  remainingTime.value = timeLeft

  if (elapsed > TIMEOUT_LIMIT) {
    isTimeoutModalOpen.value = true
  }
}

// Modal Action: Continue Order
const continueOrder = () => {
  isTimeoutModalOpen.value = false
  resetTimer()
}

// Modal Action: Cancel Order (Go Home)
const stopOrder = () => {
  isTimeoutModalOpen.value = false
  orderStore.clearOrder()
  router.push('/')
}

// Reset timer when route changes
watch(() => route.path, () => {
  resetTimer()
  isTimeoutModalOpen.value = false // Close modal if navigation happens
})

onMounted(() => {
  // Global Event Listeners
  window.addEventListener('click', resetTimer)
  window.addEventListener('touchstart', resetTimer)
  window.addEventListener('keypress', resetTimer)
  window.addEventListener('scroll', resetTimer) 
  
  // Start Timer
  timerInterval = setInterval(checkTimeout, 1000)
})

onUnmounted(() => {
  window.removeEventListener('click', resetTimer)
  window.removeEventListener('touchstart', resetTimer)
  window.removeEventListener('keypress', resetTimer)
  window.removeEventListener('scroll', resetTimer)
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="kiosk-app">
    <router-view />

    <!-- ⏳ Visible Countdown Timer (Fixed Position) -->
    <div v-if="isMonitorablePage() && !isTimeoutModalOpen" class="timer-badge" :class="{ warning: remainingTime <= 10 }">
      <span class="timer-icon">⏳</span>
      <span class="timer-text">{{ remainingTime }}초</span>
    </div>

    <!-- ⏳ Global Timeout Warning Modal -->
    <div v-if="isTimeoutModalOpen" class="timeout-modal-overlay">
      <div class="timeout-modal-content">
        <div class="timeout-icon">⏰</div>
        <h2>아직 주문 중이신가요?</h2>
        <p>60초 동안 입력이 없어<br>잠시 후 주문이 초기화됩니다.</p>
        
        <div class="timeout-actions">
          <button class="timeout-btn cancel" @click="stopOrder">
            그만하기
          </button>
          <button class="timeout-btn continue" @click="continueOrder">
            계속 주문하기
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.kiosk-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative; /* For absolute/fixed positioning references */
}

/* --- Visible Timer Badge --- */
.timer-badge {
  position: absolute;
  top: 16px;
  right: 20px;
  background-color: white;
  color: #2c3e50;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  z-index: 1000;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.timer-badge.warning {
  border-color: #ff5252;
  color: #ff5252;
  background-color: #fff0f0;
  animation: pulse-border 1s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(255, 82, 82, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
}

/* --- Timeout Modal Styles (Global) --- */
.timeout-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; /* Highest z-index to cover everything */
}

.timeout-modal-content {
  background-color: white;
  width: 90%; max-width: 320px;
  padding: 30px 20px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.timeout-icon {
  font-size: 48px; margin-bottom: 16px;
}

.timeout-modal-content h2 {
  font-size: 20px; font-weight: 700; color: #333; margin-bottom: 10px;
}
.timeout-modal-content p {
  font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.5;
}

.timeout-actions {
  display: flex; gap: 10px; justify-content: center;
}

.timeout-btn {
  flex: 1;
  padding: 12px 0;
  border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600;
  cursor: pointer;
}

.timeout-btn.cancel {
  background-color: #f0f0f0; color: #666;
}
.timeout-btn.continue {
  background-color: #2c3e50; color: white; /* Matches OrderPage theme */
}
</style>
