<template>
  <div class="bottom-nav">
    <div 
      v-for="item in navItems" 
      :key="item.path"
      :class="['nav-item', { active: isActive(item.path) }]"
      @click="navigate(item.path)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'BottomNav',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const navItems = [
      {
        path: '/gallery',
        icon: '📸',
        label: '案例'
      },
      {
        path: '/consult',
        icon: '💬',
        label: '咨询'
      },
      {
        path: '/favorites',
        icon: '⭐',
        label: '收藏'
      },
      {
        path: '/profile',
        icon: '👤',
        label: '我的'
      }
    ]

    const isActive = (path) => {
      return route.path === path
    }

    const navigate = (path) => {
      if (route.path !== path) {
        router.push(path)
      }
    }

    return {
      navItems,
      isActive,
      navigate
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);  /* ← 修改 */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;  /* ← 添加 */
}

/* 添加激活态波纹效果 */
.nav-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--color-primary, #667eea);
  opacity: 0;
  transition: all var(--transition-base, 0.2s);
}

.nav-item:active::before {
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.nav-item:active {
  transform: scale(0.9);  /* ← 修改为更明显 */
}

.nav-icon {
  font-size: 22px;
  transition: all 0.2s;
}

.nav-label {
  font-size: 11px;
  color: #6b7280;
  transition: all 0.2s;
}

/* 优化激活态 */
.nav-item.active .nav-icon {
  transform: scale(1.15);  /* ← 修改 */
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));  /* ← 添加 */
}

.nav-item.active .nav-label {
  color: var(--color-primary, #667eea);
  font-weight: var(--font-weight-semibold, 600);
}

@media (max-width: 375px) {
  .bottom-nav {
    height: 52px;
  }
  
  .nav-icon {
    font-size: 20px;
  }
  
  .nav-label {
    font-size: 10px;
  }
}
</style>