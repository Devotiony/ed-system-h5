import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue')
  },
  {
    path: '/consult',
    name: 'Consult',
    component: () => import('@/views/Consult.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userInfo = localStorage.getItem('userInfo')
  
  if (to.meta.requiresAuth) {
    if (!userInfo) {
      // 未登录，跳转到登录页
      next('/login')
    } else {
      // 已登录，检查 token 是否有效
      try {
        const user = JSON.parse(userInfo)
        if (!user.sessionToken || !user.objectId) {
          // Token 或 userId 不存在，清除信息并跳转登录
          localStorage.removeItem('userInfo')
          localStorage.removeItem('bmob_user')
          next('/login')
        } else {
          // Token 存在，允许访问
          next()
        }
      } catch (error) {
        // JSON 解析错误，清除信息并跳转登录
        console.error('用户信息解析错误:', error)
        localStorage.removeItem('userInfo')
        localStorage.removeItem('bmob_user')
        next('/login')
      }
    }
  } else {
    // 不需要认证的页面，直接访问
    next()
  }
})

export default router