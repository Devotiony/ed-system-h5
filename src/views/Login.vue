<template>
  <div class="login-page">
    <div class="header">
      <div class="logo-container">
        <img src="/logo.jpg" alt="荣易达logo" class="logo-image" />
        <h1>学历提升免费咨询</h1>
      </div>
      <p>欢迎回来，请登录您的账号</p>
    </div>
    
    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
          ]"
        />
        
        <van-field
          v-model="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
      
      <div class="register-link">
        还没有账号？<span @click="goRegister">立即注册</span>
      </div>

      <div class="forgot-link">
        <span @click="goForgotPassword">忘记密码？</span>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { userLogin, saveUserToLocal } from '@/api/bmob'

const router = useRouter()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const toast = inject('toast')

const onSubmit = async () => {
  loading.value = true
  
  try {
    console.log('开始登录...', phone.value) // 调试日志
    
    const user = await userLogin(phone.value, password.value)
    
    console.log('登录成功，用户信息:', user) // 调试日志
    
    // 保存用户信息 - 使用统一的 key: userInfo
    localStorage.setItem('userInfo', JSON.stringify({
      username: user.username,
      objectId: user.objectId,
      sessionToken: user.sessionToken,
      phone: user.mobilePhoneNumber || phone.value
    }))
    
    toast.success('登录成功')
    
    // 延迟跳转
    setTimeout(() => {
      router.push('/consult')
    }, 500)
    
  } catch (error) {
    console.error('登录失败:', error) // 调试日志
    const msg = error.response?.data?.error || error.message || '登录失败，请检查网络'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}

const goForgotPassword = () => {
  router.push('/forgot-password')
}

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px 40px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 32px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.logo-image {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.header h1 {
  font-size: 20px;
  margin: 0;
}

.header p {
  font-size: 13px;
  opacity: 0.9;
  margin: 8px 0 0 0;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 30px 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: formSlideUp 0.4s cubic-bezier(0.21, 1.02, 0.73, 1);  /* ← 添加这行 */
}

/* ← 添加动画定义 */
@keyframes formSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submit-btn {
  margin: 30px 16px 0;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.forgot-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.register-link span,
.forgot-link span {
  color: var(--color-primary, #667eea);  /* ← 使用 CSS 变量 */
  cursor: pointer;
  transition: all var(--transition-base, 0.2s);  /* ← 添加 */
  position: relative;  /* ← 添加 */
}

/* ← 添加下划线动效 */
.register-link span::after,
.forgot-link span::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary, #667eea);
  transition: width var(--transition-base, 0.2s);
}

.register-link span:hover::after,
.forgot-link span:hover::after {
  width: 100%;
}

.register-link span:active,
.forgot-link span:active {
  transform: scale(0.95);
}

.forgot-link span:hover {
  color: #667eea;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .login-page {
    padding: 60px 16px 32px;
  }
  
  .logo-image {
    width: 48px;
    height: 48px;
  }
  
  .header h1 {
    font-size: 18px;
  }
  
  .header p {
    font-size: 12px;
  }
}

</style>