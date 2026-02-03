<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
let timer


const reset = () => {
  show.value = false
  clearTimeout(timer)
  timer = setTimeout(() => {
    show.value = true         // 타이머 시간설정
  }, 10000)
}

// 화면 켜짐 조선
onMounted(() => {
  reset()
  window.onclick = reset
  window.ontouchstart = reset
})
</script>

<template>
<!--  <div v-if="show" class="black-box"></div> 기존 검정화면 보혿기-->

  <div v-if="show" class="screensaver-overlay" @click="reset">
    <video
        src="/vidio/toss.mp4"
        autoplay
        muted
        loop
        playsinline
    ></video>
  </div>
</template>

<style scoped>
/*.black-box 기존 검정화면 보호기*/
.screensaver-overlay{
  position: fixed;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999; /* 가장 맨앞으로 */
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 영상을 화면 비율에 맞춰 꽉 채우기 (빈틈 없이) */
}
</style>

<!-- 사용자 편의를 생각해서
 최대한 화면을 가리지않고,
 양쪽사이드나 배경화면블러로 사용에있어 불편하지않게 조정하기
 -->
