<script setup>
import { ref, watch } from 'vue';
import VirtualKeypad from './VirtualKeypad.vue';

const props = defineProps(['isOpen', 'title', 'placeholder', 'subtitle', 'maxLimit']);
const emit = defineEmits(['close', 'confirm']);

const inputValue = ref('');

const onUseAll = () => {
  if (props.maxLimit) {
    inputValue.value = props.maxLimit.toString();
  }
};
// const onInput = (val) => { inputValue.value += val; };
// const onDelete = () => { inputValue.value = inputValue.value.slice(0, -1); };
// const onClear = () => { inputValue.value = ''; };
// const handleConfirm = () => {
//   emit('confirm', inputValue.value);
//   onClear();
// };
const onInput = (val) => { 
  // 번호는 최대 11자까지만 입력되도록 제한 (01012345678)
  if (props.title.includes('휴대폰') && inputValue.value.length >= 11) return;
  
  // 포인트 입력 시 초기 '0'은 새 숫자로 대체
  if (props.title.includes('포인트') && inputValue.value === '0') {
    inputValue.value = val;
  } else {
    inputValue.value += val; 
  }
};
const onDelete = () => { 
  inputValue.value = inputValue.value.slice(0, -1); 
  if (props.title.includes('포인트') && inputValue.value === '') {
    inputValue.value = '0';
  }
};
const onClear = () => { 
  if (props.title.includes('포인트')) {
    inputValue.value = '0';
  } else {
    inputValue.value = ''; 
  }
};
const handleConfirm = () => {
  emit('confirm', inputValue.value);
  inputValue.value = '';
};

// 1. 모달이 열릴 때(isOpen이 true가 될 때) '010' 초기화
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.title.includes('휴대폰')) {
      inputValue.value = '010';
    } else if (props.title.includes('포인트')) {
      inputValue.value = '0'; // 포인트 입력 시 기본값 0
    } else {
      inputValue.value = ''; // 쿠폰 입력 시에는 비움
    }
  }
});

const formatPhoneNumber = (val) => {
  if (!val) return '';
  if (!props.title || !props.title.includes('휴대폰')) return val;
  
  let digits = val.replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

</script>
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
        <div class="input-container">
          <div class="input-display">{{ formatPhoneNumber(inputValue) || placeholder }}</div>
          <button v-if="title.includes('포인트') && maxLimit" @click="onUseAll" class="use-all-btn">전액사용</button>
        </div>
        <VirtualKeypad @input="onInput" @delete="onDelete" @clear="onClear" />
        <div class="modal-actions">
          <button @click="emit('close')">취소</button>
          <button @click="handleConfirm" class="confirm">확인</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
    .modal-overlay { 
        position: fixed; 
        top:0; left:0; 
        width:100%; 
        height:100%; 
        background:rgba(0,0,0,0.5); 
        display:flex; 
        align-items:center; 
        justify-content:center; 
        z-index: 2000; 
    }

    .modal-content { 
        background: white; 
        padding: 20px; 
        border-radius: 12px; 
        width: 320px; 
        text-align: center;
    }

    .modal-subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
        text-align: right;
    }

    .input-display { 
        flex: 1;
        border: 2px solid #4fc3f7; 
        padding:15px; 
        text-align:center; 
        font-size:24px; 
        border-radius:8px; 
        min-height: 60px; 
    }

    .input-container {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 20px;
    }

    .use-all-btn {
        padding: 10px;
        background: #ffcc00;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        white-space: nowrap;
        height: 60px;
    }

    .modal-actions { 
        display:grid; 
        grid-template-columns: 1fr 1fr; 
        gap:10px; 
        margin-top:20px; 
    }

    .modal-actions button { 
        padding: 10px; 
        border-radius: 8px; 
        border: none; 
        font-weight: bold; 
    }

    .confirm { 
        background: #4fc3f7; 
        color: white; 
    }
</style>