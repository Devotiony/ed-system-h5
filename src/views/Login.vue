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
      
      <!-- ← 添加记住密码选项 -->
      <div class="remember-password">
        <van-checkbox v-model="rememberPassword">
          记住密码，7天内自动登录
        </van-checkbox>
      </div>

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
import { ref, onMounted } from 'vue'  // ← 添加 onMounted
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { userLogin, saveUserToLocal } from '@/api/bmob'
import { 
  saveCredentials, 
  getCredentials, 
  clearCredentials,
  saveToken 
} from '@/utils/auth'  // ← 导入工具函数

const router = useRouter()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const rememberPassword = ref(false)  // ← 添加记住密码状态
const toast = inject('toast')

// ← 添加：页面加载时自动填充
onMounted(() => {
  const credentials = getCredentials()
  if (credentials) {
    phone.value = credentials.phone
    password.value = credentials.password
    rememberPassword.value = true
    console.log('已自动填充账号密码')
  }
})

const onSubmit = async () => {
  loading.value = true
  
  try {
    console.log('开始登录...', phone.value)
    
    const user = await userLogin(phone.value, password.value)
    
    console.log('登录成功，用户信息:', user)
    
    // ← 使用新的 saveToken 函数（包含时间戳）
    const userInfo = {
      username: user.username,
      objectId: user.objectId,
      sessionToken: user.sessionToken,
      phone: user.mobilePhoneNumber || phone.value
    }
    saveToken(userInfo)
    
    // ← 处理记住密码
    if (rememberPassword.value) {
      const saved = saveCredentials(phone.value, password.value)
      if (saved) {
        console.log('密码已保存（加密）')
      }
    } else {
      clearCredentials()
      console.log('已清除保存的密码')
    }
    
    toast.success('登录成功')
    
    setTimeout(() => {
      router.push('/consult')
    }, 500)
    
  } catch (error) {
    console.error('登录失败:', error)
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

/* 记住密码选项 */
.remember-password {
  margin: 15px 16px 0;
}

.remember-password :deep(.van-checkbox__label) {
  color: #666;
  font-size: 14px;
}

.remember-password :deep(.van-checkbox__icon--checked) {
  background-color: var(--color-primary, #667eea);
  border-color: var(--color-primary, #667eea);
}

</style>