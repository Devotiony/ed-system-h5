<template>
  <div class="profile-page">
    <!-- 头部 -->
    <div class="profile-header">
      <div class="user-avatar">
        <span class="avatar-icon">👤</span>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ userName || '未登录' }}</h2>
        <p class="user-phone">{{ userPhone || '请先登录' }}</p>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="menu-list">
      <div class="menu-section">
        <div class="menu-item" @click="goToHistory">
          <span class="menu-icon">📋</span>
          <span class="menu-label">咨询历史</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-item" @click="handleLogout">
          <span class="menu-icon">🚪</span>
          <span class="menu-label">退出登录</span>
          <span class="menu-arrow">›</span>
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
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Profile',
  components: {
    BottomNav
  },
  setup() {
    const router = useRouter()
    const userName = ref('')
    const userPhone = ref('')

    onMounted(() => {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          userName.value = user.username || user.phone || ''
          userPhone.value = user.phone || ''
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    })

    const goToHistory = () => {
      router.push('/history')
    }

    const handleLogout = () => {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userInfo')
        localStorage.removeItem('bmob_user')
        router.push('/login')
      }
    }

    return {
      userName,
      userPhone,
      goToHistory,
      handleLogout
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px; /* 为底部导航留出空间 */
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-icon {
  font-size: 32px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 1.3rem;
  color: white;
  font-weight: 600;
}

.user-phone {
  margin: 0.3rem 0 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.menu-list {
  padding: 1rem;
}

.menu-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f9fafb;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
}

.menu-label {
  flex: 1;
  font-size: 0.95rem;
  color: #1f2937;
}

.menu-arrow {
  font-size: 20px;
  color: #9ca3af;
}

@media (max-width: 375px) {
  .profile-header {
    padding: 1.5rem 1rem;
  }
  
  .user-avatar {
    width: 56px;
    height: 56px;
  }
  
  .avatar-icon {
    font-size: 28px;
  }
  
  .user-name {
    font-size: 1.2rem;
  }
}
</style>