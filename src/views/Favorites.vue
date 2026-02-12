<template>
  <div class="favorites-page">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">‹</button>
        <h2>我的收藏</h2>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="favoriteList.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p class="empty-text">暂无收藏的院校</p>
      <button class="primary-btn" @click="goToConsult">去匹配院校</button>
    </div>

    <div v-else class="favorites-list">
      <div 
        v-for="item in favoriteList" 
        :key="item.objectId" 
        class="favorite-card"
      >
        <div class="card-content">
          <div class="school-info">
            <h3>{{ item.schoolName }}</h3>
            <p v-if="item.category" class="info-row">
              <span class="label">层次：</span>
              <span class="value">{{ item.category }}</span>
            </p>
            <p v-if="item.tuition" class="info-row">
              <span class="label">学费：</span>
              <span class="value">{{ item.tuition }}</span>
            </p>
            <p v-if="item.duration" class="info-row">
              <span class="label">学制：</span>
              <span class="value">{{ item.duration }}</span>
            </p>
            <p v-if="item.studyForm" class="info-row">
              <span class="label">学习形式：</span>
              <span class="value">{{ item.studyForm }}</span>
            </p>
            <p class="collect-time">收藏时间：{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="card-actions">
            <button 
              class="remove-btn" 
              @click="confirmRemove(item)"
            >
              取消收藏
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="cancelRemove">
      <div class="modal-content" @click.stop>
        <h3>确认删除</h3>
        <p>确定要取消收藏 "{{ selectedItem?.schoolName }}" 吗？</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelRemove">取消</button>
          <button class="confirm-btn" @click="removeFavorite">确定</button>
        </div>
      </div>
    </div>

    <!-- 提示消息 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>

    <!-- 底部导航 -->
    <BottomNav />

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getFavoriteSchools, removeFavoriteSchool } from '@/api/bmob'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Favorites',
  components: {
    BottomNav
  },
  setup() {
    const router = useRouter()
    const favoriteList = ref([])
    const loading = ref(false)
    const currentUser = ref(null)
    const showConfirmModal = ref(false)
    const selectedItem = ref(null)
    const message = ref('')
    const messageType = ref('success')

    onMounted(() => {
      // 直接从 localStorage 获取，与 Consult.vue 保持一致
      const userInfoStr = localStorage.getItem('userInfo')
      if (!userInfoStr) {
        showMessage('请先登录', 'error')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
        return
      }
      
      currentUser.value = JSON.parse(userInfoStr)
      console.log('当前用户信息:', currentUser.value) // 添加调试日志
      loadFavorites()
    })

    const loadFavorites = async () => {
      loading.value = true
      try {
        console.log('开始加载收藏列表...')
        console.log('userId:', currentUser.value.objectId)
        console.log('sessionToken:', currentUser.value.sessionToken)
        
        favoriteList.value = await getFavoriteSchools(
          currentUser.value.objectId,
          currentUser.value.sessionToken
        )
        
        console.log('收藏列表:', favoriteList.value)
      } catch (error) {
        showMessage('加载收藏列表失败', 'error')
        console.error('加载收藏失败详情:', error)
      } finally {
        loading.value = false
      }
    }

    const confirmRemove = (item) => {
      selectedItem.value = item
      showConfirmModal.value = true
    }

    const cancelRemove = () => {
      showConfirmModal.value = false
      selectedItem.value = null
    }

    const removeFavorite = async () => {
      try {
        await removeFavoriteSchool(selectedItem.value.objectId, currentUser.value.sessionToken)
        showMessage('取消收藏成功', 'success')
        // 从列表中移除
        favoriteList.value = favoriteList.value.filter(f => f.objectId !== selectedItem.value.objectId)
        showConfirmModal.value = false
        selectedItem.value = null
      } catch (error) {
        showMessage('取消收藏失败', 'error')
        console.error(error)
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const showMessage = (msg, type = 'success') => {
      message.value = msg
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }

    const goBack = () => {
      router.back()
    }

    const goToConsult = () => {
      router.push('/consult')
    }

    return {
      favoriteList,
      loading,
      showConfirmModal,
      selectedItem,
      message,
      messageType,
      confirmRemove,
      cancelRemove,
      removeFavorite,
      formatDate,
      goBack,
      goToConsult
    }
  }
}
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0;
  padding-bottom: 70px; /* 为底部导航留出空间 */
}

.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.8rem 1rem;
  height: 44px;
}

.page-header h2 {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:active {
  transform: scale(0.9);
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: white;
  font-size: 1.1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #9ca3af;
}

.primary-btn {
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.primary-btn:active {
  transform: scale(0.95);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.favorites-list {
  display: grid;
  gap: 1rem;
  padding: 0.5rem;
}

.favorite-card {
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.favorite-card:active {
  transform: scale(0.98);
}

.card-content {
  padding: 1.5rem;
}

.school-info h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.info-row {
  margin: 0.4rem 0;
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.label {
  color: #9ca3af;
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.value {
  color: #1f2937;
}

.info-row .label {
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
}

.info-row .value {
  color: #1e293b;
}

.collect-time {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.card-actions {
  margin-top: 1rem;
}

.card-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.remove-btn {
  width: 100%;
  padding: 0.7rem;
  background: #fee2e2;
  border: none;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.remove-btn:active {
  transform: scale(0.95);
  background: #fecaca;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #1e293b;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.confirm-btn {
  background: #ef4444;
  color: white;
}

.confirm-btn:hover {
  background: #dc2626;
}

.message-toast {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease;
}

.message-toast.success {
  background: #10b981;
}

.message-toast.error {
  background: #ef4444;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .favorites-list {
    padding: 0.5rem;
    gap: 0.8rem;
  }
  
  .favorite-card {
    padding: 1rem;
  }
  
  .school-info h3 {
    font-size: 1rem;
  }
  
  .info-row {
    font-size: 0.8rem;
  }
  
  .collect-time {
    font-size: 0.75rem;
  }
}

@media (max-width: 375px) {
  .page-header h2 {
    font-size: 16px;
  }
  
  .school-info h3 {
    font-size: 0.95rem;
  }
  
  .remove-btn {
    font-size: 0.8rem;
    padding: 0.6rem;
  }
}
</style>