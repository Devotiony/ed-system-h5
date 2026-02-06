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
                    :disabled="countdown > 0 || !isPhoneValid"
                    @click="sendCode"
                    :loading="sendingCode"
                >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </van-button>
            </template>
        </van-field>
        
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userRegister, checkPhoneExists, sendSmsCode, verifySmsCode } from '@/api/bmob'

const router = useRouter()
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const smsCode = ref('')           // 新增
const sendingCode = ref(false)    // 新增
const countdown = ref(0)          // 新增
let timer = null                  // 新增

// 新增：检查手机号格式是否正确
const isPhoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})


const checkPassword = () => {
  return password.value === confirmPassword.value
}

// 发送验证码
const sendCode = async () => {
  if (!isPhoneValid.value) {
    showToast({ message: '请输入正确的手机号', type: 'fail' })
    return
  }
  
  sendingCode.value = true
  
  try {
    // 先检查手机号是否已注册
    const exists = await checkPhoneExists(phone.value)
    if (exists) {
      showToast({ message: '该手机号已注册，请直接登录', type: 'fail' })
      sendingCode.value = false
      return
    }
    
    // 发送验证码
    await sendSmsCode(phone.value)
    showToast({ message: '验证码已发送', type: 'success' })
    
    // 开始60秒倒计时
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

const onSubmit = async () => {
  loading.value = true
  
  try {
    // 第一步：检查手机号是否已注册
    const exists = await checkPhoneExists(phone.value)
    if (exists) {
      showToast({ message: '该手机号已注册，请直接登录', type: 'fail' })
      loading.value = false
      return
    }
    
    // 第二步：验证短信验证码
    try {
      await verifySmsCode(phone.value, smsCode.value)
    } catch (err) {
      showToast({ message: '验证码错误或已过期', type: 'fail' })
      loading.value = false
      return
    }
    
    // 第三步：注册新用户
    const user = await userRegister(phone.value, password.value)
    
    // 第四步：保存用户信息到 localStorage
    localStorage.setItem('userInfo', JSON.stringify({
      username: user.username,
      objectId: user.objectId,
      sessionToken: user.sessionToken,
      phone: phone.value
    }))
    
    showToast({ message: '注册成功', type: 'success' })
    
    // 第五步：直接跳转到咨询页
    setTimeout(() => {
      router.push('/consult')
    }, 500)
    
  } catch (error) {
    const msg = error.response?.data?.error || '注册失败'
    showToast({ message: msg, type: 'fail' })
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