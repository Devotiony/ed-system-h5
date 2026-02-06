<template>
  <div class="register-page">
    <div class="header">
      <h1>📚 荣易达学历提升咨询</h1>
      <p>注册账号，开启您的学历提升之路</p>
    </div>
    
    <van-form @submit="onSubmit" class="register-form">
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
          placeholder="请设置6-20位密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { pattern: /^.{6,20}$/, message: '密码长度6-20位' }
          ]"
        />
        
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: checkPassword, message: '两次密码不一致' }
          ]"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
      
      <div class="login-link">
        已有账号？<span @click="goLogin">立即登录</span>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userRegister, saveUserToLocal } from '@/api/bmob'

const router = useRouter()
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const checkPassword = () => {
  return password.value === confirmPassword.value
}

const onSubmit = async () => {
  loading.value = true
  
  try {
    const user = await userRegister(phone.value, password.value)
    saveUserToLocal(user)
    showToast({ message: '注册成功', type: 'success' })
    router.push('/consult')
  } catch (error) {
    const msg = error.response?.data?.error || '注册失败'
    if (msg.includes('already taken')) {
      showToast({ message: '该手机号已注册', type: 'fail' })
    } else {
      showToast({ message: msg, type: 'fail' })
    }
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
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

.register-form {
  background: white;
  border-radius: 16px;
  padding: 30px 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.submit-btn {
  margin: 30px 16px 0;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link span {
  color: #667eea;
  cursor: pointer;
}
</style>