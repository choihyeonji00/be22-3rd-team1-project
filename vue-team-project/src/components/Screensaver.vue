<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
let timer


const reset = () => {
  show.value = false
  clearTimeout(timer)
  timer = setTimeout(() => {
    show.value = true         // 타이머 시간설정
  }, 3000)
}

// 화면 켜짐 조선
onMounted(() => {
  reset()
  window.onclick = reset
  window.ontouchstart = reset
})
</script>

<template>
  <div v-if="show" class="black-box"></div>
</template>

<style scoped>
.black-box {
  position: fixed;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999; /* 가장 맨앞으로 */
}
</style>