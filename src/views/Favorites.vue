<template>
  <div class="favorites-page">
    <div class="page-header">
      <h2>我的收藏</h2>
      <button class="back-btn" @click="goBack">返回</button>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getFavoriteSchools, removeFavoriteSchool } from '@/api/bmob'

export default {
  name: 'Favorites',
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.back-btn {
  padding: 0.6rem 1.5rem;
  background: #667eea;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
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
  max-width: 500px;
  margin: 0 auto;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.primary-btn {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.favorites-list {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 1.5rem;
}

.school-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #1e293b;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.info-row {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
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

.remove-btn {
  width: 100%;
  padding: 0.8rem;
  background: white;
  border: 2px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
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

@media (max-width: 768px) {
  .favorites-page {
    padding: 1rem;
  }
  
  .favorites-list {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
}
</style>