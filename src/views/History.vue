<template>
  <div class="history-page">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">‹</button>
        <h2>咨询历史</h2>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="historyList.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-text">暂无咨询历史</p>
      <button class="primary-btn" @click="goToConsult">去咨询</button>
    </div>

    <!-- 历史记录列表 -->
    <div v-else class="history-list">
      <div 
        v-for="record in historyList" 
        :key="record.objectId"
        class="history-card"
        @click="viewDetail(record)"
      >
        <div class="card-content">
          <div class="record-info">
            <div class="info-row">
              <span class="label">目标学历：</span>
              <span class="value">{{ record.targetDegree }}</span>
            </div>
            <div class="info-row">
              <span class="label">当前学历：</span>
              <span class="value">{{ record.currentEducation }}</span>
            </div>
            <div class="info-row">
              <span class="label">意向专业：</span>
              <span class="value">{{ record.majorInterest }}</span>
            </div>
            <div class="info-row" v-if="record.schoolPreference">
              <span class="label">院校偏好：</span>
              <span class="value">{{ record.schoolPreference }}</span>
            </div>
            <div class="record-time">
              咨询时间：{{ formatDate(record.createdAt) }}
            </div>
            <div class="match-count" v-if="record.matchCount">
              匹配到 {{ record.matchCount }} 个院校
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNav />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getUserConsultRecords } from '@/api/bmob'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'History',
  components: {
    BottomNav
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const historyList = ref([])
    const userId = ref('')
    const sessionToken = ref('')

    onMounted(async () => {
      // 获取用户信息
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          userId.value = user.objectId || ''
          sessionToken.value = user.sessionToken || ''
          
          if (userId.value && sessionToken.value) {
            await loadHistory()
          } else {
            loading.value = false
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
          loading.value = false
        }
      } else {
        loading.value = false
      }
    })

    const loadHistory = async () => {
      try {
        loading.value = true
        const records = await getUserConsultRecords(userId.value, sessionToken.value)
        historyList.value = records.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
      } catch (error) {
        console.error('加载历史记录失败:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const viewDetail = (record) => {
    // 跳转到咨询页面并传递完整的历史记录数据
    router.push({
        path: '/consult',
        query: {
        fromHistory: 'true',
        targetDegree: record.targetDegree,
        currentEducation: record.currentEducation,
        majorInterest: record.majorInterest,
        schoolPreference: record.schoolPreference || '暂不确定'
        }
    })
    }

    const goBack = () => {
      router.back()
    }

    const goToConsult = () => {
      router.push('/consult')
    }

    return {
      loading,
      historyList,
      formatDate,
      viewDetail,
      goBack,
      goToConsult
    }
  }
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.history-list {
  padding: 0.5rem;
}

.history-card {
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.history-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.label {
  color: #6b7280;
  min-width: 80px;
  font-size: 0.85rem;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.record-time {
  margin-top: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.8rem;
  color: #9ca3af;
}

.match-count {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .history-list {
    padding: 0.5rem;
  }
  
  .history-card {
    padding: 1rem;
  }
  
  .info-row {
    font-size: 0.85rem;
  }
  
  .label {
    font-size: 0.8rem;
  }
}

@media (max-width: 375px) {
  .page-header h2 {
    font-size: 16px;
  }
  
  .history-card {
    padding: 0.9rem;
  }
  
  .info-row {
    font-size: 0.8rem;
  }
  
  .record-time {
    font-size: 0.75rem;
  }
}
</style>