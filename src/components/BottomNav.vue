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
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  transform: scale(0.95);
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

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-label {
  color: #667eea;
  font-weight: 600;
}

.nav-item:active .nav-icon {
  opacity: 0.6;
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