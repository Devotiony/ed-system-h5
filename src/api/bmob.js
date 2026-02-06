import axios from 'axios'

// Bmob 配置
const BMOB_CONFIG = {
  applicationId: '8d0dda9bb9a94927011d9bcf7a948005',
  restApiKey: '6234ad2a5b48c2cc25dccc1755e9914d',
  baseURL: 'https://api.bmobcloud.com/1'
}

// 创建 axios 实例
const bmobApi = axios.create({
  baseURL: BMOB_CONFIG.baseURL,
  headers: {
    'X-Bmob-Application-Id': BMOB_CONFIG.applicationId,
    'X-Bmob-REST-API-Key': BMOB_CONFIG.restApiKey,
    'Content-Type': 'application/json'
  }
})

// 检查手机号是否已注册
export const checkPhoneExists = async (phone) => {
  try {
    const response = await bmobApi.get('/users', {
      params: {
        where: JSON.stringify({ username: phone })
      }
    })
    return response.data.results && response.data.results.length > 0
  } catch (error) {
    console.error('检查手机号错误:', error)
    return false
  }
}

// 用户注册
export const userRegister = async (phone, password) => {
  try {
    const response = await bmobApi.post('/users', {
      username: phone,
      password: password,
      mobilePhoneNumber: phone
    })
    return response.data
  } catch (error) {
    console.error('注册错误:', error.response?.data || error.message)
    throw error
  }
}

// 用户登录
export const userLogin = async (phone, password) => {
  try {
    const response = await bmobApi.get('/login', {
      params: {
        username: phone,
        password: password
      }
    })
    return response.data
  } catch (error) {
    console.error('登录错误:', error.response?.data || error.message)
    throw error
  }
}

// 保存咨询记录
export const saveConsultRecord = async (data, sessionToken) => {
  try {
    const response = await bmobApi.post('/classes/ConsultRecord', data, {
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data
  } catch (error) {
    console.error('保存记录错误:', error.response?.data || error.message)
    throw error
  }
}

// 获取当前用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('bmob_user')
  return userStr ? JSON.parse(userStr) : null
}

// 保存用户信息到本地
export const saveUserToLocal = (user) => {
  localStorage.setItem('bmob_user', JSON.stringify(user))
}

// 退出登录
export const userLogout = () => {
  localStorage.removeItem('bmob_user')
}

// 发送短信验证码
export const sendSmsCode = async (phone) => {
  try {
    const response = await bmobApi.post('/requestSmsCode', {
      mobilePhoneNumber: phone,
      template: '您的验证码是：%smscode%'
    })
    return response.data
  } catch (error) {
    console.error('发送验证码错误:', error)
    throw error
  }
}

// 验证短信验证码
export const verifySmsCode = async (phone, smsCode) => {
  try {
    const response = await bmobApi.post('/verifySmsCode/' + smsCode, {
      mobilePhoneNumber: phone
    })
    return response.data
  } catch (error) {
    console.error('验证码验证错误:', error.response?.data || error.message)
    throw error
  }
}

// 通过短信验证码重置密码
export const resetPasswordBySms = async (phone, smsCode, newPassword) => {
  try {
    const response = await bmobApi.put('/resetPasswordBySmsCode/' + smsCode, {
      password: newPassword
    })
    return response.data
  } catch (error) {
    console.error('重置密码错误:', error)
    throw error
  }
}

export default bmobApi