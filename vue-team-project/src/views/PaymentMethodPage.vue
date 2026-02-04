<script setup>
import { ref, onMounted, computed, watch} from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useOrderStore } from '../stores/orderStore'
import KeypadModal from '../components/KeypadModal.vue'
import MessageModal from '../components/MessageModal.vue'

const router = useRouter()
const orderStore = useOrderStore()

// Get total price from order store
const totalPrice = computed(() => orderStore.calculatedTotalPrice)

const couponDiscount = ref(0);
const pointDiscount = ref(0);

const totalDiscountPrice = computed(() => couponDiscount.value + pointDiscount.value);
const confirmPrice = computed(() => {
  const result = totalPrice.value - totalDiscountPrice.value;
  return result > 0 ? result : 0
});

const selectedPayment = ref(null)
const isLoading = ref(true)

const paymentMethods = ref({
  card: [],
  easyPay: [],
  other: []
})

const isCouponModalOpen = ref(false);
const isPhoneModalOpen = ref(false);

const currentMember = ref(null); // 조회된 회원 저장
const isPointAmountModalOpen = ref(false); // 포인트 금액 입력 모달 상태

// 메세지 모달 구성을 위한 통합 상태 객체
const modal = ref({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  onConfirm: null // 확인 버튼 클릭 시 실행할 함수
});

// 메세지 모달을 띄우는 편의 함수
const showMessage = (type, title, message, onConfirm) => {
  modal.value = { isOpen: true, type, title, message, onConfirm };
};

// Fetch payment methods on component mount
onMounted(async () => {
  try {
    const data = await api.getPaymentMethods()
    paymentMethods.value = data
  } catch (error) {
    console.error('Failed to fetch payment methods:', error)
  } finally {
    isLoading.value = false
  }
})

const selectPayment = (paymentId) => {
  selectedPayment.value = paymentId
}

const handleBack = () => {
  router.push('/order')
}

const handleNext = () => {
  if (selectedPayment.value) {
    // Find the selected payment method name and save to store
    const allMethods = [
      ...paymentMethods.value.card,
      ...paymentMethods.value.easyPay,
      ...paymentMethods.value.other
    ]
    const selected = allMethods.find(m => m.id === selectedPayment.value)
    if (selected) {
      orderStore.setPaymentMethod(selected.name)
      orderStore.setTotalDiscount(totalDiscountPrice.value)
      orderStore.setUsedPoints(pointDiscount.value)
      
      // 결제 확인 모달 추가
      showMessage('confirm', '결제 확인', `총 ${confirmPrice.value.toLocaleString()}원 결제를 진행하시겠습니까?`, () => {
        modal.value.isOpen = false;
        router.push('/payment-confirm')
      })
    }
  }
}


const openDiscountModal = (methodId) => {
  if (methodId === 'coupon') {
    isCouponModalOpen.value = true;
  } 
  else if (methodId === 'point') {
    // 이미 회원이 조회되어 있다면 번호 입력창을 건너뛰고 바로 금액 입력창을 엽니다.
    if (currentMember.value) {
      isPointAmountModalOpen.value = true;
    } else {
      isPhoneModalOpen.value = true;
    }
  }
};

// 쿠폰 확인 로직
const checkCoupon = async (code) => {
  try {
    const coupons = await api.getCouponByCode(code)

    if (coupons && coupons.length > 0){
      const coupon = coupons[0]
      if(!coupon.used){
        couponDiscount.value = coupon.amount
        showMessage('alert', '쿠폰 할인', `${coupon.amount.toLocaleString()}원 할인이 적용되었습니다.`)
      }
      else{
        showMessage('alert', '쿠폰 오류', '이미 사용된 쿠폰입니다.')
      }
    }
    else{
      showMessage('alert', '쿠폰 오류', '해당 쿠폰이 없습니다.')
    }

  } catch (error) {
    console.error('쿠폰 조회 중 오류가 발생했습니다.:', error)
  } finally {
    isCouponModalOpen.value = false;
  }

};

// 1. 번호로 회원 조회
const checkMember = async (phone) => {
  try {
    const rawPhone = phone.replace(/-/g, ''); // 하이픈 제거 후 조회
    const members = await api.getMemberByPhone(rawPhone);
    
    if (members && members.length > 0) {
      currentMember.value = members[0];
      // 번호 입력창 닫고 바로 '금액 입력창' 열기
      isPhoneModalOpen.value = false;
      isPointAmountModalOpen.value = true;
    } else {
      // 번호 입력창 우선 닫기
      isPhoneModalOpen.value = false;
      
      // confirm() 대신 커스텀 모달 호출
      showMessage('confirm', '회원 가입 안내', '등록되지 않은 번호입니다.\n가입하고 적립하시겠습니까?', async () => {
        const newMember = await api.createMember({ phone: rawPhone, points: 0 });
        currentMember.value = newMember;
        modal.value.isOpen = false; // 메세지 모달 닫기
        
        // 알림창도 커스텀 모달
        setTimeout(() => {
          showMessage('alert', '가입 완료', '가입을 축하드립니다!\n지금부터 적립이 가능합니다.');
        }, 300);
      });
    }
  } 
  catch (error) {
    showMessage('alert', '조회 실패', '회원 조회 중 오류가 발생했습니다.')
  }
};

// 2. 입력한 포인트 금액 적용
const applyPointAmount = (amount) => {
  const points = parseInt(amount);
  if (points > (currentMember.value?.points || 0)) {
    showMessage('alert', '포인트 부족', `보유 포인트(${(currentMember.value?.points || 0).toLocaleString()}P)를 초과할 수 없습니다.`)
    return;
  }
  pointDiscount.value = points;
  isPointAmountModalOpen.value = false;

  // 포인트 적용 확인 모달 추가
  if (points > 0) {
    showMessage('alert', '포인트 적용', `${points.toLocaleString()}P가 적용되었습니다.`);
  }
};

watch(currentMember, (newMember) => {
  if (newMember) {
    orderStore.setCurrentMember(newMember);
  }
});


</script>

<template>
  <div class="payment-method-page">
    <!-- Header -->
    <header class="page-header">
      <h1>결제 수단 선택</h1>
    </header>

    <div class="price-info">
      <!-- Total Amount -->
      <div class="total-amount">
        <span class="amount-label"> 결제 금액:</span>
        <span class="amount-value">{{ totalPrice.toLocaleString() }}원</span>
      </div>
      <!-- Discount Amount -->
      <div class="discount-amount">
        <span class="discount-label">할인 금액:</span>
        <span class="discount-value">- {{ totalDiscountPrice.toLocaleString() }}원</span>
      </div>
      <!-- Confirm Price -->
      <div class="confirm-price">
        <span class="confirm-label">총 결제 금액:</span>
        <span class="confirm-value">{{ confirmPrice.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- Payment Sections -->
    <div class="payment-sections">
      <!-- Discount -->
      <section class="payment-section">
        <h2 class="section-title">Discount</h2>
        <div class="payment-options">
          <button
            v-for="method in paymentMethods.other"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="openDiscountModal(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name }}</span>
          </button>
        </div>
      </section>
      <!-- Card Payment -->
      <section class="payment-section">
        <h2 class="section-title">Card</h2>
        <div class="payment-options">
          <button
            v-for="method in paymentMethods.card"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="selectPayment(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name }}</span>
          </button>
        </div>
      </section>

      <!-- Easy Pay -->
      <section class="payment-section">
        <h2 class="section-title">Easy pay</h2>
        <div class="payment-options three-col">
          <button
            v-for="method in paymentMethods.easyPay"
            :key="method.id"
            :class="['payment-btn', { selected: selectedPayment === method.id }]"
            @click="selectPayment(method.id)"
          >
            <span class="payment-icon">{{ method.icon }}</span>
            <span class="payment-name">{{ method.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <!-- Action Buttons -->
    <footer class="action-footer">
      <button class="footer-btn back" @click="handleBack">
        이전
      </button>
      <button
        class="footer-btn next"
        :disabled="!selectedPayment"
        @click="handleNext"
      >
        다음
      </button>
    </footer>
      <KeypadModal
        :isOpen="isCouponModalOpen"
        title="쿠폰 번호를 입력하세요"
        placeholder=""
        @close="isCouponModalOpen = false"
        @confirm="checkCoupon"
      />
      <KeypadModal
        :isOpen="isPhoneModalOpen"
        title="휴대폰 번호를 입력하세요"
        placeholder="010-1234-5678"
        @close="isPhoneModalOpen = false"
        @confirm="checkMember"
      />

      <KeypadModal
        :isOpen="isPointAmountModalOpen"
        title="사용할 포인트를 입력하세요"
        :subtitle="currentMember ? `사용 가능 포인트: ${currentMember.points.toLocaleString()}P` : ''"
        :placeholder="currentMember ? currentMember.points.toString() : '0'"
        :maxLimit="currentMember ? currentMember.points : 0"
        @close="isPointAmountModalOpen = false"
        @confirm="applyPointAmount"
      />
      <MessageModal
  v-bind="modal"
  @close="modal.isOpen = false"
  @confirm="modal.onConfirm ? modal.onConfirm() : modal.isOpen = false"
/>
  </div>
</template>

<style scoped>
.payment-method-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.page-header {
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Total Amount */
.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.amount-label {
  font-size: 16px;
  color: #666;
}

.amount-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
}

.price-info {
  display: flex;
  flex-direction: column;
}

.discount-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.discount-label {
  font-size: 16px;
  color: #666;
}

.discount-value {
  font-size: 15px;
  font-weight: 700;
  color: red;
}

.confirm-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 2px solid #e0e0e0;
}

.confirm-label {
  font-size: 16px;
  color: #666;
}

.confirm-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Payment Sections */
.payment-sections {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.payment-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.payment-options.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.payment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background-color: var(--primary-yellow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-btn:hover {
  border-color: var(--primary-yellow-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.payment-btn.selected {
  border-color: var(--primary-blue);
  background-color: rgba(79, 195, 247, 0.1);
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
}

.payment-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.payment-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
}

/* Action Footer */
.action-footer {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border-top: 2px solid #e0e0e0;
}

.footer-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn.back {
  background-color: #e0e0e0;
  color: var(--text-dark);
}

.footer-btn.back:hover {
  background-color: #d0d0d0;
}

.footer-btn.next {
  background-color: var(--primary-blue);
  color: white;
}

.footer-btn.next:hover:not(:disabled) {
  background-color: var(--primary-blue-dark);
}

.footer-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.point-value { color: #d32f2f; }

/* Responsive */
@media (max-width: 480px) {
  .payment-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-options.three-col {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-btn {
    padding: 16px 12px;
  }

  .payment-icon {
    font-size: 28px;
  }

  .payment-name {
    font-size: 12px;
  }
}
</style>
