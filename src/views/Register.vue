<template>
  <div class="register-page">
    <div class="header">
      <div class="logo-container">
        <img src="/logo.jpg" alt="荣易达logo" class="logo-image" />
        <h1>学历提升免费咨询</h1>
      </div>
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
// import { showToast } from 'vant'
import { userRegister, checkPhoneExists, sendSmsCode, verifySmsCode } from '@/api/bmob'
import { inject } from 'vue'

const router = useRouter()
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const smsCode = ref('')           // 新增
const sendingCode = ref(false)    // 新增
const countdown = ref(0)          // 新增
const toast = inject('toast')

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
    toast.error('请输入正确的手机号')
    return
  }
  
  sendingCode.value = true
  
  try {
    // 先检查手机号是否已注册
    const exists = await checkPhoneExists(phone.value)
    if (exists) {
      toast.error('该手机号已注册，请直接登录')
      sendingCode.value = false
      return
    }
    
    // 发送验证码
    await sendSmsCode(phone.value)
    toast.success('验证码已发送')
    
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
    toast.error(msg)
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
      toast.error('该手机号已注册，请直接登录')
      loading.value = false
      return
    }
    
    // 第二步：验证短信验证码
    try {
      await verifySmsCode(phone.value, smsCode.value)
    } catch (err) {
      toast.error('验证码错误或已过期')
      loading.value = false
      return
    }
    
    // 第三步：注册新用户
    const user = await userRegister(phone.value, password.value)
    
    // 第四步：保存用户信息到 localStorage
    localStorage.setItem('userInfo', JSON.stringify({
      username: user.username || phone.value,  // 修改这行：如果 user.username 为空，使用 phone
      objectId: user.objectId,
      sessionToken: user.sessionToken,
      phone: user.mobilePhoneNumber || phone.value
    }))
    
    console.log('注册成功，保存的用户信息:', {
      username: user.username,
      objectId: user.objectId,
      sessionToken: user.sessionToken
    })
    
    // 第五步：直接跳转到咨询页
    setTimeout(() => {
      router.push('/consult')
    }, 500)
    
  } catch (error) {
    const msg = error.response?.data?.error || '注册失败'
    toast.error(msg)
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

.register-form {
  background: white;
  border-radius: 16px;
  padding: 30px 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: formSlideUp 0.4s cubic-bezier(0.21, 1.02, 0.73, 1);  /* ← 添加 */
}

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

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link span {
  color: var(--color-primary, #667eea);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s);
  position: relative;
}

.login-link span::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary, #667eea);
  transition: width var(--transition-base, 0.2s);
}

.login-link span:hover::after {
  width: 100%;
}

.login-link span:active {
  transform: scale(0.95);
}

/* 移动端适配 */
@media (max-width: 375px) {
  .register-page {
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