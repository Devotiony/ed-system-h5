<template>
  <div class="forgot-page">
    <div class="header">
      <h1>🔐 找回密码</h1>
      <p>通过手机验证码重置您的密码</p>
    </div>
    
    <van-form @submit="onSubmit" class="forgot-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入注册时的手机号"
          maxlength="11"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
          ]"
        />
        
        <van-field
          v-model="smsCode"
          type="number"
          label="验证码"
          placeholder="请输入短信验证码"
          maxlength="6"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendCode"
              :loading="sendingCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        
        <van-field
          v-model="newPassword"
          type="password"
          label="新密码"
          placeholder="请设置6-20位新密码"
          :rules="[
            { required: true, message: '请输入新密码' },
            { pattern: /^.{6,20}$/, message: '密码长度6-20位' }
          ]"
        />
        
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: checkPassword, message: '两次密码不一致' }
          ]"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          重置密码
        </van-button>
      </div>
      
      <div class="back-link">
        <span @click="goBack">← 返回登录</span>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { sendSmsCode, resetPasswordBySms, checkPhoneExists } from '@/api/bmob'

const router = useRouter()
const phone = ref('')
const smsCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

let timer = null

const checkPassword = () => {
  return newPassword.value === confirmPassword.value
}

// 发送验证码
const sendCode = async () => {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast({ message: '请输入正确的手机号', type: 'fail' })
    return
  }
  
  sendingCode.value = true
  
  try {
    // 检查手机号是否已注册
    const exists = await checkPhoneExists(phone.value)
    if (!exists) {
      showToast({ message: '该手机号未注册', type: 'fail' })
      sendingCode.value = false
      return
    }
    
    // 发送验证码
    await sendSmsCode(phone.value)
    showToast({ message: '验证码已发送', type: 'success' })
    
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
  } catch (error) {
    const msg = error.response?.data?.error || '发送失败，请稍后重试'
    showToast({ message: msg, type: 'fail' })
  } finally {
    sendingCode.value = false
  }
}

// 重置密码
const onSubmit = async () => {
  loading.value = true
  
  try {
    await resetPasswordBySms(phone.value, smsCode.value, newPassword.value)
    showToast({ message: '密码重置成功', type: 'success' })
    
    setTimeout(() => {
      router.push('/login')
    }, 1000)
    
  } catch (error) {
    const msg = error.response?.data?.error || '重置失败'
    if (msg.includes('smsCode')) {
      showToast({ message: '验证码错误或已过期', type: 'fail' })
    } else {
      showToast({ message: msg, type: 'fail' })
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-page {
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

.forgot-form {
  background: white;
  border-radius: 16px;
  padding: 30px 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.submit-btn {
  margin: 30px 16px 0;
}

.back-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.back-link span {
  color: #667eea;
  cursor: pointer;
}
</style>