<template>
  <div class="theme-toggle" @click="toggleTheme">
    <div class="toggle-icon">
      {{ isDark ? '🌙' : '🌞' }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ThemeToggle',
  setup() {
    const isDark = ref(false)

    // 初始化主题
    const initTheme = () => {
      // 从 localStorage 读取用户偏好
      const savedTheme = localStorage.getItem('theme')
      
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        // 跟随系统偏好
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      applyTheme()
    }

    // 应用主题
    const applyTheme = () => {
      if (isDark.value) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }

    // 切换主题
    const toggleTheme = () => {
      isDark.value = !isDark.value
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      applyTheme()
    }

    onMounted(() => {
      initTheme()
      
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches
          applyTheme()
        }
      })
    })

    return {
      isDark,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  z-index: 999;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 24px;
  animation: rotate 0.3s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-toggle {
    bottom: 70px;
    right: 16px;
    width: 44px;
    height: 44px;
  }
  
  .toggle-icon {
    font-size: 20px;
  }
}
</style>