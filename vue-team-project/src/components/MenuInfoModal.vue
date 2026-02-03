<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'add'])

const quantity = ref(1)

const selectedOptions = ref({});

const totalPrice = computed(() => {
  let base = props.menu.price
  
  props.menu.options?.forEach(opt => {

    const selected = selectedOptions.value[opt.name]

    if (!selected) return
    
    if (opt.multiple) {
      selected.forEach(label => {
        const choice = opt.choices.find(c => c.label === label)
        if (choice) base += choice.price
      })
    } 
    else {
      const choice = opt.choices.find(c => c.label === selected)
      if (choice) base += choice.price
    }
  })
  
  return base * quantity.value
})

onMounted(() => {
   props.menu.options?.forEach(option => {
    if(option.required){
      selectedOptions.value[option.name] = option.choices[0].label;
    }
  else if(option.multiple){
    selectedOptions.value[option.name] = [];
  }
})
})

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleCancel = () => {
  quantity.value = 1
  emit('close')
}

// const handleAdd = () => {
//   emit('add', { ...props.menu, quantity: quantity.value })
//   quantity.value = 1
//   emit('close')

const handleAdd = () => {
  emit('add', { 
    ...props.menu, 
    quantity: quantity.value,
    selectedOptions: { ...selectedOptions.value }, 
    totalPrice: totalPrice.value 
  });
  quantity.value = 1;
  emit('close');
};

  // 옵션 선택 처리 함수
const handleOptionSelect = (option, choice) => {
  if (option.required) {
    // 필수 옵션: 기존 값을 덮어씀
    selectedOptions.value[option.name] = choice.label;
  } else if (option.multiple) {
    // 다중 선택 옵션: 배열에 추가하거나 제거
    const current = selectedOptions.value[option.name] || [];
    const index = current.indexOf(choice.label);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(choice.label);
    }
    selectedOptions.value[option.name] = current;
  }
};
// 선택 여부 확인 함수 (isSelected)
const isSelected = (option, choice) => {
  const selected = selectedOptions.value[option.name];
  if (!selected) return false;
  
  if (option.required) {
    return selected === choice.label;
  } else {
    return selected.includes(choice.label);
  }
};

const getCategoryIcon = (categoryId) => {
  const iconMap = {
    pizza: '🍕',
    hamburger: '🍔',
    drink: '🥤',
    sandwich: '🥪',
    side: '🍟',
    dessert: '🍰'
  }
  return iconMap[categoryId] || '🍽️'
}

</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <!-- Menu Image -->
        <div class="menu-image">
          <img v-if="menu.image" :src="menu.image" :alt="menu.name" />
          <span v-else class="menu-placeholder-icon">{{ getCategoryIcon(menu.category) }}</span>
        </div>

        <!-- Menu Info -->
        <div class="menu-info">
          <h2 class="menu-name">{{ menu.name }}</h2>
          <p class="menu-description">{{ menu.description }}</p>
          <!-- <p class="menu-price">{{ menu.price?.toLocaleString() }}원</p> -->
           <p class="menu-price">{{ totalPrice?.toLocaleString() }}원</p>
        </div>

        <!-- Options -->
        <div class="options-container">
          <div v-for="option in menu.options" :key="option.name" class="option-group">
            <h3>{{ option.name }} ({{ option.required ? '필수' : '선택' }})</h3>
            
            <div class="option-grid">
              <div 
                v-for="choice in option.choices" 
                :key="choice.label" 
                class="option-card"
                :class="{ 'active': isSelected(option, choice) }"
                @click="handleOptionSelect(option, choice)"
              >
                <div class="option-card-image">
                  <img v-if="choice.image" :src="choice.image" :alt="choice.label">
                  <span v-else class="placeholder">{{ getCategoryIcon(menu.category) }}</span>
                </div>
                <div class="option-card-info">
                  <div>{{ choice.label }}</div>
                  <div>+{{ choice.price?.toLocaleString() }}원</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quantity Controls -->
        <div class="quantity-controls">
          <button class="quantity-btn" @click="decreaseQuantity">-</button>
          <span class="quantity-value">{{ quantity }}</span>
          <button class="quantity-btn" @click="increaseQuantity">+</button>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="action-btn cancel-btn" @click="handleCancel">
            취소
          </button>
          <button class="action-btn add-btn" @click="handleAdd">
            담기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: #f0c14b;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;  
  display: flex;
  flex-direction: column; 
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.menu-image {
  width: 100%;
  height: 200px;
  background-color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder-icon {
  font-size: 64px;
}

.menu-info {
  padding: 20px;
  text-align: center;
}

.menu-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.menu-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.menu-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-dark);
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.3);
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #333;
  border-radius: 8px;
  background-color: white;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity-value {
  font-size: 28px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}

.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #e57373;
  color: white;
}

.cancel-btn:hover {
  background-color: #ef5350;
}

.add-btn {
  background-color: var(--primary-blue);
  color: white;
}

.add-btn:hover {
  background-color: var(--primary-blue-dark);
}

.action-btn:active {
  transform: scale(0.98);
}
.option-group{
  margin-bottom: 10px;
}
.option-group h3{
  margin-bottom: 10px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.option-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
}

.option-card.active {
  border-color: #4fc3f7; 
  background-color: #f0faff;
}
.options-container {
  flex: 1;            
  overflow-y: auto;   
  padding: 0 20px 20px; 
}

.option-card-image {
  width: 100%;
  aspect-ratio: 1;    
  background-color: rgba(255,255,255,0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  overflow: hidden;
}

.option-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
