<template>
  <div class="login-page">
    <div class="header">
      <h1>📚 荣易达学历提升咨询</h1>
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
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userLogin, saveUserToLocal } from '@/api/bmob'

const router = useRouter()
const phone = ref('')
const password = ref('')
const loading = ref(false)

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
    
    showToast({ message: '登录成功', type: 'success' })
    
    // 延迟跳转
    setTimeout(() => {
      router.push('/consult')
    }, 500)
    
  } catch (error) {
    console.error('登录失败:', error) // 调试日志
    const msg = error.response?.data?.error || error.message || '登录失败，请检查网络'
    showToast({ message: msg, type: 'fail' })
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
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
  margin-bottom: 40px;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 30px 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
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

.register-link span {
  color: #667eea;
  cursor: pointer;
}
</style>