<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = ref([])
const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Modal state for Add/Edit
const isModalOpen = ref(false)
const editingMenu = ref(null) // null for add, object for edit
const newMenuItem = ref({
  name: '',
  price: 0,
  description: '',
  category: '', // category ID
  image: '',
  stock: 100, // 재고 수량 추가
  options: []
})

// Fetch data on component mount
onMounted(async () => {
  await refreshData()
})

const refreshData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [menuData, categoryData] = await Promise.all([
      api.getAdminMenuItems(),
      api.getCategories()
    ])
    menuItems.value = menuData
    categories.value = categoryData
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
    errorMessage.value = '데이터를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '알 수 없음'
}

const openAddModal = () => {
  editingMenu.value = null
  newMenuItem.value = {
    name: '',
    price: 0,
    description: '',
    category: categories.value[0]?.id || '',
    image: '',
    stock: 100,
    options: []
  }
  isModalOpen.value = true
}

const openEditModal = (menu) => {
  editingMenu.value = { ...menu }
  // deep copy for nested options
  const copiedMenu = JSON.parse(JSON.stringify(menu))
  // Ensure options array exists
  if (!copiedMenu.options) copiedMenu.options = []
  // Ensure stock exists
  if (copiedMenu.stock === undefined) copiedMenu.stock = 100

  newMenuItem.value = copiedMenu
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingMenu.value = null
  newMenuItem.value = { name: '', price: 0, description: '', category: '', image: '', stock: 100, options: [] }
  errorMessage.value = ''
}

const saveMenuItem = async () => {
  errorMessage.value = ''
  try {
    if (!newMenuItem.value.name || !newMenuItem.value.price || !newMenuItem.value.category) {
      errorMessage.value = '모든 필수 필드를 입력해주세요.'
      return
    }

    if (editingMenu.value && editingMenu.value.id) {
      // Update existing item
      await api.updateMenuItem(editingMenu.value.id, newMenuItem.value)
      console.log('Menu item updated:', newMenuItem.value)
    } else {
      // Create new item
      // --- ID 생성 로직 추가 ---
      const maxId = menuItems.value.reduce((max, item) => Math.max(max, parseInt(item.id)), 0)
      newMenuItem.value.id = (maxId + 1).toString(); // JSON Server는 ID를 문자열로 저장하는 경향이 있으므로 toString()
      // -------------------------

      await api.createMenuItem(newMenuItem.value)
      console.log('Menu item created:', newMenuItem.value)
    }
    await refreshData()
    closeModal()
  } catch (error) {
    console.error('Failed to save menu item:', error)
    errorMessage.value = '메뉴 항목 저장에 실패했습니다.'
  }
}

// --- Option Management Functions ---
const addOptionGroup = () => {
  newMenuItem.value.options.push({
    name: '',
    required: false,
    multiple: false,
    choices: [{ label: '', price: 0 }]
  })
}

const removeOptionGroup = (index) => {
  newMenuItem.value.options.splice(index, 1)
}

const addChoice = (optionIndex) => {
  newMenuItem.value.options[optionIndex].choices.push({ label: '', price: 0 })
}

const removeChoice = (optionIndex, choiceIndex) => {
  newMenuItem.value.options[optionIndex].choices.splice(choiceIndex, 1)
}
// ------------------------------------

const deleteMenuItem = async (id) => {
  if (confirm('정말로 이 메뉴 항목을 삭제하시겠습니까?')) {
    try {
      await api.deleteMenuItem(id)
      console.log('Menu item deleted:', id)
      await refreshData()
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      errorMessage.value = '메뉴 항목 삭제에 실패했습니다.'
    }
  }
}

const goToDashboard = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="admin-menu-management">
    <header class="admin-header">
      <h1>메뉴 관리</h1>
      <div class="header-actions">
        <button @click="goToDashboard" class="back-btn">대시보드로</button>
        <button @click="openAddModal" class="add-btn">새 메뉴 추가</button>
      </div>
    </header>

    <div class="content-area">
      <p v-if="errorMessage" class="error-message-banner">{{ errorMessage }}</p>

      <div v-if="isLoading" class="loading-spinner">메뉴 데이터를 불러오는 중...</div>
      <div v-else class="menu-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>가격</th>
              <th>카테고리</th>
              <th>재고</th>
              <th>옵션 설정</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in menuItems" :key="menu.id">
              <td>{{ menu.id }}</td>
              <td>{{ menu.name }}</td>
              <td>{{ menu.price.toLocaleString() }}원</td>
              <td>{{ getCategoryName(menu.category) }}</td>
              <td>
                <span :class="{'out-of-stock': menu.stock <= 0}">
                  {{ menu.stock !== undefined ? menu.stock : '-' }}개
                  <span v-if="menu.stock <= 0">(품절)</span>
                </span>
              </td>
              <td>
                <div v-if="menu.options && menu.options.length > 0" class="options-summary">
                  옵션 {{ menu.options.length }}개 설정됨
                </div>
                <span v-else>-</span>
              </td>
              <td>
                <button @click="openEditModal(menu)" class="action-btn edit-btn">수정</button>
                <button @click="deleteMenuItem(menu.id)" class="action-btn delete-btn">삭제</button>
              </td>
            </tr>
            <tr v-if="menuItems.length === 0">
              <td colspan="7" class="no-data">메뉴 항목이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Menu Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editingMenu ? '메뉴 수정' : '새 메뉴 추가' }}</h3>
        <form @submit.prevent="saveMenuItem">
          <div class="form-group">
            <label for="menuName">이름:</label>
            <input type="text" id="menuName" v-model="newMenuItem.name" required />
          </div>
          <div class="form-group">
            <label for="menuPrice">가격:</label>
            <input type="number" id="menuPrice" v-model.number="newMenuItem.price" required min="0" />
          </div>
          <div class="form-group">
            <label for="menuStock">재고 수량:</label>
            <input type="number" id="menuStock" v-model.number="newMenuItem.stock" required min="0" />
          </div>
          <div class="form-group">
            <label for="menuCategory">카테고리:</label>
            <select id="menuCategory" v-model="newMenuItem.category" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="menuDescription">설명:</label>
            <textarea id="menuDescription" v-model="newMenuItem.description" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label for="menuImageUrl">이미지 URL:</label>
            <input type="text" id="menuImageUrl" v-model="newMenuItem.image" placeholder="/src/assets/images/..." />
          </div>

          <!-- Options Section -->
          <div class="options-management">
            <div class="options-header">
              <h4>옵션 설정</h4>
              <button type="button" @click="addOptionGroup" class="small-add-btn">+ 그룹 추가</button>
            </div>

            <div v-for="(opt, optIdx) in newMenuItem.options" :key="optIdx" class="option-group-card">
              <div class="option-group-header">
                <input type="text" v-model="opt.name" placeholder="그룹명 (예: 사이즈, 토핑)" class="opt-name-input" />
                <div class="opt-configs">
                  <label><input type="checkbox" v-model="opt.required" /> 필수</label>
                  <label><input type="checkbox" v-model="opt.multiple" /> 다중선택</label>
                </div>
                <button type="button" @click="removeOptionGroup(optIdx)" class="small-delete-btn">✕</button>
              </div>

              <div class="choices-list">
                <div v-for="(choice, choiceIdx) in opt.choices" :key="choiceIdx" class="choice-row">
                  <input type="text" v-model="choice.label" placeholder="라벨" />
                  <input type="number" v-model.number="choice.price" placeholder="추가금" />
                  <button type="button" @click="removeChoice(optIdx, choiceIdx)" class="choice-delete-btn">✕</button>
                </div>
                <button type="button" @click="addChoice(optIdx)" class="choice-add-btn">+ 선택지 추가</button>
              </div>
            </div>
          </div>
          <p v-if="errorMessage" class="error-message-modal">{{ errorMessage }}</p>
          <div class="modal-actions">
            <button type="submit" class="save-btn">저장</button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-menu-management {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--primary-blue);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.back-btn, .add-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}
.back-btn:hover {
  background-color: #5a6268;
}

.add-btn {
  background-color: var(--primary-green);
  color: white;
}
.add-btn:hover {
  background-color: #218838;
}

.content-area {
  flex: 1;
  padding: 20px 40px;
}

.error-message-banner {
  color: #e74c3c;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.menu-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: var(--primary-blue);
  color: white;
  font-weight: 600;
}

tr:hover {
  background-color: #f5f5f5;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 30px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 5px;
}

.edit-btn {
  background-color: var(--primary-orange);
  color: white;
}
.edit-btn:hover {
  background-color: #e67e22;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}
.delete-btn:hover {
  background-color: #c0392b;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

/* Options Management Styles */
.options-management {
  margin-top: 20px;
  border-top: 2px dashed #eee;
  padding-top: 20px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.options-header h4 {
  margin: 0;
  color: #444;
}

.small-add-btn {
  padding: 5px 10px;
  background-color: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.option-group-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}

.option-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.opt-name-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.opt-configs {
  display: flex;
  gap: 10px;
  font-size: 13px;
  white-space: nowrap;
}

.small-delete-btn {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 18px;
  cursor: pointer;
}

.choices-list {
  padding-left: 20px;
}

.choice-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.choice-row input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}

.choice-row input[type="text"] {
  flex: 2;
}

.choice-row input[type="number"] {
  flex: 1;
}

.choice-delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
}

.choice-add-btn {
  background: none;
  border: 1px dashed #aaa;
  color: #777;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
}

/* Modal Actions and Base Styles */

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: var(--primary-blue);
  font-size: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
}

.error-message-modal {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn, .cancel-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn {
  background-color: var(--primary-blue);
  color: white;
}
.save-btn:hover {
  background-color: var(--primary-blue-dark);
}

.cancel-btn {
  background-color: #ccc;
  color: #333;
}
.cancel-btn:hover {
  background-color: #bbb;
}
</style>