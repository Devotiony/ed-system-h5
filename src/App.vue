<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'

const router = useRouter()

onMounted(() => {
  // 应用启动时检查登录状态
  const currentPath = router.currentRoute.value.path
  
  // 如果当前在登录页，检查是否已登录
  if (currentPath === '/login') {
    if (isLoggedIn()) {
      console.log('检测到有效 Token，自动跳转到主页')
      router.replace('/consult')
    }
  }
  
  // 如果当前在需要认证的页面，但未登录
  const requiresAuth = router.currentRoute.value.meta.requiresAuth
  if (requiresAuth && !isLoggedIn()) {
    console.log('未登录，跳转到登录页')
    router.replace('/login')
  }
})
</script>

<style>
</style>