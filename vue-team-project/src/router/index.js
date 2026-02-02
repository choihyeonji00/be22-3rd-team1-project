import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import OrderPage from '../views/OrderPage.vue'
import PaymentMethodPage from '../views/PaymentMethodPage.vue'
import PaymentConfirmPage from '../views/PaymentConfirmPage.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainPage
  },
  {
    path: '/order',
    name: 'Order',
    component: OrderPage
  },
  {
    path: '/payment-method',
    name: 'PaymentMethod',
    component: PaymentMethodPage
  },
  {
    path: '/payment-confirm',
    name: 'PaymentConfirm',
    component: PaymentConfirmPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
