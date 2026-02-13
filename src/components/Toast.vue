<template>
  <Teleport to="body">
    <transition-group name="toast-list" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">{{ getIcon(toast.type) }}</div>
        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
        </div>
      </div>
    </transition-group>
  </Teleport>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Toast',
  setup() {
    const toasts = ref([])
    let toastId = 0

    const getIcon = (type) => {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      }
      return icons[type] || icons.info
    }

    const addToast = (message, type = 'info', duration = 3000) => {
      const id = toastId++
      toasts.value.push({ id, message, type })

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }

    return {
      toasts,
      getIcon,
      removeToast,
      addToast
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 400px;
  padding: 14px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

/* Success */
.toast-success .toast-icon {
  background: #10b981;
  color: white;
}

.toast-success .toast-message {
  color: #059669;
}

/* Error */
.toast-error .toast-icon {
  background: #ef4444;
  color: white;
}

.toast-error .toast-message {
  color: #dc2626;
}

/* Warning */
.toast-warning .toast-icon {
  background: #f59e0b;
  color: white;
}

.toast-warning .toast-message {
  color: #d97706;
}

/* Info */
.toast-info .toast-icon {
  background: #3b82f6;
  color: white;
}

.toast-info .toast-message {
  color: #2563eb;
}

/* 动画 */
.toast-list-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-list-leave-active {
  animation: toast-out 0.3s cubic-bezier(0.06, 0.71, 0.55, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .toast-container {
    top: 60px;
    right: 8px;
    left: 8px;
    align-items: stretch;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>