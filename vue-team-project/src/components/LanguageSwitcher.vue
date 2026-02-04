<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  mode: {
    type: String,
    default: 'absolute' // 'absolute' or 'inline'
  }
})

const { locale } = useI18n()
const setLanguage = (lang) => {
  locale.value = lang
}
</script>

<template>
  <div :class="['lang-switcher', { inline: mode === 'inline' }]">
    <button
      :class="['lang-btn', { active: locale === 'ko' }]"
      @click="setLanguage('ko')"
    >KO</button>
    <button
      :class="['lang-btn', { active: locale === 'en' }]"
      @click="setLanguage('en')"
    >EN</button>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

.lang-switcher.inline {
  position: static;
  margin: 0;
}

.lang-btn {
  padding: 6px 12px;
  border: 2px solid var(--primary-blue);
  border-radius: 8px;
  background: white;
  color: var(--primary-blue);
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
