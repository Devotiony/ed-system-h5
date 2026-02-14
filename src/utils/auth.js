// ========================================
// 认证工具函数
// 包含：加密解密、Token管理、记住密码
// ========================================

// 简单的加密解密（使用 Base64 + 设备指纹）
const SECRET_KEY = 'edu_system_2024' // 加密密钥

// 获取设备指纹（简化版）
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

// 简单加密
export const encrypt = (text) => {
  try {
    const deviceId = getDeviceId()
    const combined = deviceId + '::' + text
    return btoa(encodeURIComponent(combined))
  } catch (error) {
    console.error('加密失败:', error)
    return null
  }
}

// 简单解密
export const decrypt = (encrypted) => {
  try {
    const deviceId = getDeviceId()
    const decoded = decodeURIComponent(atob(encrypted))
    const parts = decoded.split('::')
    
    // 验证设备指纹
    if (parts[0] !== deviceId) {
      console.warn('设备指纹不匹配')
      return null
    }
    
    return parts[1]
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 保存记住的账号密码
export const saveCredentials = (phone, password) => {
  try {
    const encryptedPhone = encrypt(phone)
    const encryptedPassword = encrypt(password)
    
    if (encryptedPhone && encryptedPassword) {
      localStorage.setItem('saved_phone', encryptedPhone)
      localStorage.setItem('saved_password', encryptedPassword)
      localStorage.setItem('remember_password', 'true')
      return true
    }
    return false
  } catch (error) {
    console.error('保存凭据失败:', error)
    return false
  }
}

// 获取记住的账号密码
export const getCredentials = () => {
  try {
    const rememberPassword = localStorage.getItem('remember_password')
    if (rememberPassword !== 'true') {
      return null
    }
    
    const encryptedPhone = localStorage.getItem('saved_phone')
    const encryptedPassword = localStorage.getItem('saved_password')
    
    if (!encryptedPhone || !encryptedPassword) {
      return null
    }
    
    const phone = decrypt(encryptedPhone)
    const password = decrypt(encryptedPassword)
    
    if (phone && password) {
      return { phone, password }
    }
    
    return null
  } catch (error) {
    console.error('获取凭据失败:', error)
    return null
  }
}

// 清除记住的账号密码
export const clearCredentials = () => {
  localStorage.removeItem('saved_phone')
  localStorage.removeItem('saved_password')
  localStorage.removeItem('remember_password')
}

// 检查是否记住了密码
export const hasRememberedPassword = () => {
  return localStorage.getItem('remember_password') === 'true'
}

// Token 管理
export const saveToken = (userInfo) => {
  // 添加保存时间戳
  const tokenData = {
    ...userInfo,
    savedAt: Date.now()
  }
  localStorage.setItem('userInfo', JSON.stringify(tokenData))
}

export const getToken = () => {
  const userStr = localStorage.getItem('userInfo')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Token 解析失败:', error)
    return null
  }
}

export const clearToken = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('bmob_user')
}

// 检查 Token 是否过期（30天有效期）
export const isTokenExpired = (tokenData) => {
  if (!tokenData || !tokenData.savedAt) {
    return true
  }
  
  const now = Date.now()
  const savedTime = tokenData.savedAt
  const expiryTime = 30 * 24 * 60 * 60 * 1000 // 30天
  
  return (now - savedTime) > expiryTime
}

// 检查用户是否已登录（Token 存在且未过期）
export const isLoggedIn = () => {
  const tokenData = getToken()
  if (!tokenData) return false
  
  // 检查必要字段
  if (!tokenData.sessionToken || !tokenData.objectId) {
    return false
  }
  
  // 检查是否过期
  if (isTokenExpired(tokenData)) {
    clearToken()
    return false
  }
  
  return true
}

// 完整的退出登录
export const logout = () => {
  clearToken()
  // 注意：不清除记住的密码，用户可以选择是否继续记住
}