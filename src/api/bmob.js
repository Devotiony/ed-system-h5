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

// 验证 Session Token 是否有效
const validateSessionToken = async (sessionToken) => {
  if (!sessionToken) {
    throw new Error('Session token 不存在')
  }
  
  // 检查是否是明显无效的 token
  if (sessionToken.includes('invalid') || sessionToken.length < 20) {
    throw new Error('Session token 无效')
  }
  
  try {
    // 调用 Bmob 的 users/me 接口验证 token
    const response = await bmobApi.get('/users/me', {
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data
  } catch (error) {
    // Token 验证失败
    console.error('Token 验证失败:', error.response?.data || error.message)
    throw new Error('Session token 已过期或无效')
  }
}

// 处理 Token 过期的统一逻辑
const handleTokenExpired = () => {
  console.warn('Token 已过期或无效，即将跳转到登录页')
  
  // 清除本地存储的用户信息
  localStorage.removeItem('userInfo')
  localStorage.removeItem('bmob_user')
  
  // 提示用户
  alert('登录已过期，请重新登录')
  
  // 跳转到登录页
  import('@/router').then((routerModule) => {
    const router = routerModule.default
    router.push('/login')
  })
}

// 添加响应拦截器处理 Token 过期
bmobApi.interceptors.response.use(
  // 响应成功的处理
  (response) => {
    return response
  },
  // 响应错误的处理
  (error) => {
    // 检查是否是 Token 过期或无效的错误
    if (error.response) {
      const { status, data } = error.response
      
      // Bmob 返回 401 表示未授权，或者错误码 209/206 表示 session token 无效或过期
      if (status === 401 || 
          (data && (data.code === 209 || data.code === 206 || data.code === 101))) {
        handleTokenExpired()
      }
    }
    
    return Promise.reject(error)
  }
)

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
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
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
  // 优先从 userInfo 获取（Consult.vue 使用的）
  const userStr = localStorage.getItem('userInfo') || localStorage.getItem('bmob_user')
  return userStr ? JSON.parse(userStr) : null
}

// 保存用户信息到本地
export const saveUserToLocal = (user) => {
  localStorage.setItem('bmob_user', JSON.stringify(user))
}

// 退出登录
export const userLogout = () => {
  localStorage.removeItem('bmob_user')
  localStorage.removeItem('userInfo')
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

// 添加收藏院校
export const addFavoriteSchool = async (schoolData, sessionToken) => {
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
  try {
    const response = await bmobApi.post('/classes/FavoriteSchools', schoolData, {
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data
  } catch (error) {
    console.error('添加收藏错误:', error.response?.data || error.message)
    throw error
  }
}

// 获取用户收藏的院校列表
export const getFavoriteSchools = async (userId, sessionToken) => {
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
  try {
    const response = await bmobApi.get('/classes/FavoriteSchools', {
      params: {
        where: JSON.stringify({ userId: userId }),
        order: '-createdAt'
      },
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data.results || []
  } catch (error) {
    console.error('获取收藏列表错误:', error.response?.data || error.message)
    throw error
  }
}

// 取消收藏院校
export const removeFavoriteSchool = async (objectId, sessionToken) => {
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
  try {
    const response = await bmobApi.delete(`/classes/FavoriteSchools/${objectId}`, {
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data
  } catch (error) {
    console.error('取消收藏错误:', error.response?.data || error.message)
    throw error
  }
}

// 检查院校是否已收藏
export const checkSchoolFavorited = async (userId, schoolName, sessionToken) => {
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
  try {
    const response = await bmobApi.get('/classes/FavoriteSchools', {
      params: {
        where: JSON.stringify({ 
          userId: userId,
          schoolName: schoolName
        })
      },
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data.results && response.data.results.length > 0 ? response.data.results[0] : null
  } catch (error) {
    console.error('检查收藏状态错误:', error.response?.data || error.message)
    return null
  }
}

// 获取用户的咨询历史记录
export const getUserConsultRecords = async (userId, sessionToken) => {
  // 验证 Token
  try {
    await validateSessionToken(sessionToken)
  } catch (error) {
    handleTokenExpired()
    throw error
  }
  
  try {
    const response = await bmobApi.get('/classes/ConsultRecord', {
      params: {
        where: JSON.stringify({ userId: userId }),
        order: '-createdAt',
        limit: 100
      },
      headers: {
        'X-Bmob-Session-Token': sessionToken
      }
    })
    return response.data.results || []
  } catch (error) {
    console.error('获取咨询记录错误:', error.response?.data || error.message)
    throw error
  }
}

export default bmobApi