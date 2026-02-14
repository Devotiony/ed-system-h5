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
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/Gallery.vue'),
    meta: { requiresAuth: false }  // 不需要登录也能查看
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import { isLoggedIn, isTokenExpired, getToken } from '@/utils/auth'  // ← 添加导入

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // ← 使用新的 isLoggedIn 函数
    if (isLoggedIn()) {
      // 已登录且 Token 有效
      next()
    } else {
      // 未登录或 Token 已过期
      const tokenData = getToken()
      
      // 如果有 Token 但已过期，提示用户
      if (tokenData && isTokenExpired(tokenData)) {
        console.log('Token 已过期，需要重新登录')
        // 可以在这里添加 Toast 提示
      }
      
      next('/login')
    }
  } else {
    // 不需要认证的页面
    // ← 如果已登录，访问登录页时自动跳转到主页
    if (to.path === '/login' && isLoggedIn()) {
      next('/consult')
    } else {
      next()
    }
  }
})

export default router