// Toast 插件
import { createApp } from 'vue'
import ToastComponent from '@/components/Toast.vue'

let toastInstance = null

const initToast = () => {
  if (toastInstance) return toastInstance

  const container = document.createElement('div')
  document.body.appendChild(container)

  const app = createApp(ToastComponent)
  const instance = app.mount(container)
  
  toastInstance = instance
  return instance
}

const toast = {
  show(message, type = 'info', duration = 3000) {
    const instance = initToast()
    instance.addToast(message, type, duration)
  },

  success(message, duration = 3000) {
    this.show(message, 'success', duration)
  },

  error(message, duration = 3000) {
    this.show(message, 'error', duration)
  },

  warning(message, duration = 3000) {
    this.show(message, 'warning', duration)
  },

  info(message, duration = 3000) {
    this.show(message, 'info', duration)
  }
}

export default {
  install(app) {
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}

export { toast }