<script setup>
import Screensaver from './components/Screensaver.vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const setLanguage = (lang) => {
  locale.value = lang
}
</script>

<template>
  <div class="kiosk-app">
    <div class="global-lang-switcher">
      <button
        :class="['lang-btn', { active: locale === 'ko' }]"
        @click="setLanguage('ko')"
      >KO</button>
      <button
        :class="['lang-btn', { active: locale === 'en' }]"
        @click="setLanguage('en')"
      >EN</button>
    </div>
    <router-view />
    <Screensaver />
  </div>
</template>

<style scoped>
.kiosk-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.global-lang-switcher {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 9999;
}

.lang-btn {
  padding: 8px 16px;
  border: 2px solid var(--primary-blue);
  border-radius: 8px;
  background: white;
  color: var(--primary-blue);
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.lang-btn.active {
  background-color: var(--primary-blue);
  color: white;
}

.lang-btn:hover:not(.active) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.lang-btn:active {
  transform: translateY(0);
}
</style>
