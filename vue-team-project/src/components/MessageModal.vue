<script setup>
const props = defineProps({
  isOpen: Boolean,
  type: { type: String, default: 'alert' }, // 'alert' 또는 'confirm'
  title: String,
  message: String
});
const emit = defineEmits(['close', 'confirm']);
</script>
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="icon-area">
          <span v-if="type === 'alert'">🔔</span>
          <span v-else>❓</span>
        </div>
        <h3 v-if="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
        
        <div class="modal-actions">
          <!-- Confirm 타입일 때만 취소 버튼 노출 -->
          <button v-if="type === 'confirm'" @click="emit('close')" class="btn-cancel">취소</button>
          <button @click="emit('confirm')" class="btn-confirm">확인</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index: 3000; }
.modal-content { background: white; padding: 30px; border-radius: 20px; width: 340px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.icon-area { font-size: 40px; margin-bottom: 15px; }
h3 { margin-bottom: 10px; color: #333; }
.message { font-size: 16px; color: #666; margin-bottom: 25px; line-height: 1.5; white-space: pre-line; }
.modal-actions { display: flex; gap: 10px; }
button { flex: 1; padding: 14px; border-radius: 10px; border: none; font-size: 16px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #eee; color: #666; }
.btn-confirm { background: #4fc3f7; color: white; }
</style>