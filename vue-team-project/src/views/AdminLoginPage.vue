<script setup>
import { ref } from 'vue'
import { api } from '../services/api' // api 서비스 임포트
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = '' // 에러 메시지 초기화
  try {
    const result = await api.adminLogin({ username: username.value, password: password.value })
    if (result.success) {
      // 로그인 성공
      console.log('Admin login successful:', result.user)
      // TODO: 실제 구현 시, 로그인 상태를 stores/auth.js에 저장하고 토큰 등을 관리해야 합니다.
      router.push('/admin') // 관리자 대시보드로 이동
    } else {
      // 로그인 실패
      errorMessage.value = result.message || t('admin.login_fail')
    }
  } catch (error) {
    console.error('Login API error:', error)
    errorMessage.value = t('admin.login_error')
  }
}
</script>

<template>
  <div class="admin-login-page">
    <LanguageSwitcher />
    <div class="login-container">
      <h2>{{ $t('admin.login_title') }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{ $t('admin.username') }}:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('admin.password') }}:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-btn">{{ $t('admin.login_btn') }}</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <button class="back-to-main" @click="router.push('/')">{{ $t('admin.back_to_main') }}</button>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input[type="text"],
input[type="password"] {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: var(--primary-blue);
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background-color: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 10px;
}

.login-btn:hover {
  background-color: var(--primary-blue-dark);
  transform: translateY(-2px);
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 14px;
}

.back-to-main {
  margin-top: 25px;
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 15px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.back-to-main:hover {
  color: var(--primary-blue-dark);
}
</style>