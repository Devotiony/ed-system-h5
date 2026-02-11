<template>
  <div class="consult-container">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="/logo.jpg" alt="荣易达logo" class="logo-icon" />
          <div class="logo-text">
            <h1>学历提升免费咨询</h1>
            <p>专注成人学业规划|中专至博士|专业匹配|院校优选|全程护航</p>
          </div>
        </div>
        <div class="user-info" v-if="userName">
          <button class="gallery-btn" @click="goToGallery">📸 成功案例</button>
          <span class="welcome">欢迎，{{ userName }}</span>
          <button class="history-btn" @click="toggleHistory">📋 历史记录</button>
          <button class="favorites-btn" @click="goToFavorites">⭐ 我的收藏</button>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 对话区域 -->
      <div class="chat-container">
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message', msg.isBot ? 'bot' : 'user']"
          >
            <div v-if="msg.isBot" class="avatar bot-avatar">小豆</div>
            <div class="message-content" v-html="formatMessage(msg.text)"></div>
            <div v-if="!msg.isBot" class="avatar user-avatar">👤</div>
          </div>
          
          <!-- 加载动画 -->
          <div v-if="isTyping" class="message bot">
            <div class="avatar bot-avatar">小豆</div>
            <div class="message-content typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div v-if="currentOptions.length > 0" class="options-container">
            <div class="options-grid">
              <button 
                v-for="(option, idx) in currentOptions" 
                :key="idx"
                class="option-btn"
                @click="handleOptionSelect(option)"
              >
                {{ option }}
              </button>
            </div>
          </div>
          
          <div v-if="showTextInput" class="text-input-container">
            <input 
              type="text"
              v-model="inputValue"
              :placeholder="inputPlaceholder"
              class="text-input"
              @keypress.enter="handleTextSubmit"
            />
            <button 
              class="submit-btn"
              @click="handleTextSubmit"
              :disabled="!inputValue.trim()"
            >
              确认
            </button>
          </div>
        </div>
      </div>

      <!-- 历史记录区域 -->
      <div v-if="showHistory && consultHistory.length > 0" class="history-section">
        <h2 class="history-title">📚 咨询历史记录</h2>
        <div class="history-list">
          <div 
            v-for="record in consultHistory" 
            :key="record.objectId"
            class="history-card"
            @click="viewHistoryRecord(record)"
          >
            <div class="history-info">
              <div class="history-detail">
                <span class="history-label">目标学历：</span>
                <span class="history-value">{{ record.targetDegree }}</span>
              </div>
              <div class="history-detail">
                <span class="history-label">当前学历：</span>
                <span class="history-value">{{ record.currentEducation }}</span>
              </div>
              <div class="history-detail">
                <span class="history-label">意向专业：</span>
                <span class="history-value">{{ record.majorInterest }}</span>
              </div>
              <div class="history-time">
                咨询时间：{{ new Date(record.createdAt).toLocaleString('zh-CN') }}
              </div>
            </div>
            <button class="view-btn">查看详情</button>
          </div>
        </div>
      </div>

      <!-- 结果展示区域 -->
      <div v-if="matchResults.length > 0" class="results-section">
        <h2 class="results-title">📋 为您推荐以下院校</h2>
        <div class="results-grid">
          <div 
            v-for="program in matchResults" 
            :key="program.id"
            class="program-card"
          >
            <div class="card-header">
              <h3 class="school-name">{{ program.school }}</h3>
              <span class="match-score">匹配度 {{ program.matchScore }}%</span>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">层次</span>
                  <span class="value">{{ program.category }}</span>
                </div>
                <div class="info-item">
                  <span class="label">学费</span>
                  <span class="value">{{ formatTuition(program.tuition, program.tuitionMax) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">学制</span>
                  <span class="value">{{ program.duration }}</span>
                </div>
                <div class="info-item">
                  <span class="label">学习形式</span>
                  <span class="value">{{ program.studyForm }}</span>
                </div>
                <div class="info-item full-width">
                    <span class="label">招生专业</span>
                    <span class="value majors">
                        <span v-if="program.majors.length > 0" class="highlight-major">{{ program.majors[0] }}</span>
                        <span v-if="program.majors.length > 1">、{{ program.majors.slice(1, 5).join('、') }}</span>
                        <span v-if="program.majors.length > 5">等</span>
                    </span>
                </div>
                <div class="info-item full-width">
                  <span class="label">报名条件</span>
                  <span class="value">{{ program.requirement }}</span>
                </div>
              </div>
              <div class="features">
                <span 
                  v-for="(feature, idx) in program.features" 
                  :key="idx"
                  class="feature-tag"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <button 
                class="favorite-btn" 
                :class="{ favorited: program.isFavorited }"
                @click.stop="toggleFavorite(program)"
              >
                {{ program.isFavorited ? '⭐ 已收藏' : '☆ 收藏' }}
              </button>
              <button class="consult-btn" @click="openConsultModal(program)">
                💬 立即咨询
              </button>
            </div>
          </div>
        </div>
        <div class="restart-section">
            <button class="restart-btn" @click="restartConsult">
                🔄 重新咨询
            </button>
        </div>
      </div>
    </main>

    <!-- 咨询弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">×</button>
        
        <div class="modal-header">
          <div class="modal-icon">💬</div>
          <h2>专属顾问为您服务</h2>
          <p class="modal-subtitle">
            <span v-if="userName">{{ userName }}，</span>您对<strong>「{{ selectedProgram?.school }}」</strong>感兴趣
          </p>
        </div>
        
        <div class="consultant-card">
          <div class="consultant-avatar">👨‍🏫</div>
          <div class="consultant-info">
            <h3>{{ consultantInfo.name }}</h3>
            <span class="consultant-title">{{ consultantInfo.title }}</span>
          </div>
        </div>
        
        <div class="contact-section">
          <div class="contact-item phone">
            <div class="contact-icon">📞</div>
            <div class="contact-detail">
              <span class="contact-label">电话咨询</span>
              <a :href="`tel:${consultantInfo.phone}`" class="contact-value phone-number">
                {{ consultantInfo.phone }}
              </a>
              <span class="contact-hint">点击可直接拨打</span>
            </div>
          </div>
          
          <div class="contact-divider">
            <span>或</span>
          </div>
          
          <div class="contact-item wechat">
            <!-- 微信二维码图片 -->
            <div class="qr-code-wrapper" v-if="consultantInfo.qrCodeUrl">
              <img :src="consultantInfo.qrCodeUrl" alt="微信二维码" class="qr-code" />
            </div>
            <div class="wechat-info">
              <span class="contact-label">添加微信咨询</span>
              <span class="wechat-id">微信号：{{ consultantInfo.wechat }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="callback-notice">
            ℹ️ 留下您的联系方式，<strong>24小时内</strong>专属顾问将主动联系您
          </div>
          <div class="working-hours">
            🕐 {{ consultantInfo.workingHours }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { matchPrograms, formatTuition as formatTuitionUtil } from '@/utils/match'
import { CONSULTANT_INFO, EDUCATION_PATH_RULES } from '@/data/knowledge'
import { saveConsultRecord, getUserConsultRecords, addFavoriteSchool, removeFavoriteSchool, checkSchoolFavorited } from '@/api/bmob'

export default {
  name: 'ConsultView',
  setup() {
    const router = useRouter()
    const userName = ref('')
    const userId = ref('')
    const sessionToken = ref('')
    const messages = ref([])
    const currentOptions = ref([])
    const showTextInput = ref(false)
    const inputPlaceholder = ref('')
    const inputValue = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)
    
    const userProfile = reactive({
      name: '',
      age: '',
      currentEducation: '',
      targetDegree: '',
      majorInterest: '',
      schoolPreference: ''
    })
    
    const currentStep = ref(0)
    const isSelectingNewTarget = ref(false)
    const matchResults = ref([])
    const consultHistory = ref([])
    const showHistory = ref(false)
    const showModal = ref(false)
    const selectedProgram = ref(null)
    const consultantInfo = reactive({ ...CONSULTANT_INFO })
    
    const conversationFlow = [
      {
        question: '您好！我是小豆，您的专属学历提升顾问 👋\n\n请问您希望提升到什么学历呢？',
        options: ['中专', '大专', '本科', '硕士', '博士'],
        field: 'targetDegree'
      },
      {
        question: '好的！请问您目前的最高学历是？',
        options: ['初中', '高中', '中专', '技校', '大专', '本科', '硕士'],
        field: 'currentEducation'
      },
      {
        question: '您对哪些专业比较感兴趣？',
        options: ['医学/护理', '教育/师范', '管理/工商', '计算机/信息技术', '建筑/工程', '会计/财务/金融', '法律', '艺术/设计', '其他专业（自定义）', '不限'],
        field: 'majorInterest'
      },
      {
        question: '您对院校有什么偏好吗？\n（如有具体意向院校可直接输入）',
        options: ['国内院校', '境外留学', '暂不确定'],
        field: 'schoolPreference',
        allowInput: true,
        inputPlaceholder: '输入意向院校名称...'
      }
    ]
    
    onMounted(() => {
      const userInfo = localStorage.getItem('userInfo')
      console.log('页面加载，读取 userInfo:', userInfo)

      if (userInfo) {
        const user = JSON.parse(userInfo)
        // 优先使用 username，如果为空则使用 phone
        userName.value = user.username || user.phone || ''
        userId.value = user.objectId || ''
        sessionToken.value = user.sessionToken || ''
        userProfile.name = user.username || user.phone || ''

        console.log('用户信息已加载:', {
          userName: userName.value,
          userId: userId.value,
          hasToken: !!sessionToken.value
        })

        loadConsultHistory()
      }
      startConversation()
    })
    
    const startConversation = () => {
      addBotMessage(conversationFlow[0].question, conversationFlow[0].options)
    }
    
    const addBotMessage = (text, options = [], allowInput = false, placeholder = '') => {
      isTyping.value = true
      setTimeout(() => {
        isTyping.value = false
        messages.value.push({ text, isBot: true })
        currentOptions.value = options
        showTextInput.value = allowInput
        inputPlaceholder.value = placeholder
        scrollToBottom()
      }, 500)
    }
    
    const addUserMessage = (text) => {
      messages.value.push({ text, isBot: false })
      scrollToBottom()
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    const handleOptionSelect = (option) => {

        // 处理特殊选项
        if (option === '重新咨询') {
            restartConsult()
            return
        }
        if (option === '联系顾问') {
            selectedProgram.value = { school: '学历提升' }
            showModal.value = true
            return
        }
        
        if (option === '其他专业（自定义）') {
        addUserMessage(option)
        currentOptions.value = []
        
        // 显示文本输入框
        setTimeout(() => {
            showTextInput.value = true
            inputPlaceholder.value = '请输入您的意向专业...'
        }, 300)
        return
      }

        // 处理用户选择新的目标学历（来自建议）
        if (isSelectingNewTarget.value) {
        addUserMessage(option)
        currentOptions.value = []
        userProfile.targetDegree = option  // 更新目标学历
        isSelectingNewTarget.value = false
        
        // 重新显示"当前学历"问题
        setTimeout(() => {
            addBotMessage(
            `好的，已将目标学历更新为「${option}」！\n\n请问您目前的最高学历是？`, 
            conversationFlow[1].options
            )
        }, 300)
        return
        }
        
    addUserMessage(option)
    currentOptions.value = []
    showTextInput.value = false
    
    const currentFlow = conversationFlow[currentStep.value]
    if (currentFlow) {
        userProfile[currentFlow.field] = option
    }
    
    if (currentStep.value === 1) {
        const pathRule = EDUCATION_PATH_RULES[option]
        const targetDegree = userProfile.targetDegree
        
        if (pathRule && !pathRule.canUpgradeTo.includes(targetDegree)) {
        setTimeout(() => {
            const suggestion = pathRule.message || `您当前是${option}学历，暂时无法直接报考${targetDegree}。`
            addBotMessage(suggestion + '\n\n建议您先考虑提升到：' + pathRule.canUpgradeTo.join('、'), pathRule.canUpgradeTo)
            isSelectingNewTarget.value = true  // 标记下次选择是新的目标学历
            // 不清空 targetDegree，保留当前学历选择
            userProfile.currentEducation = option  // 保存当前学历
        }, 300)
        return
        }
    }
      
      currentStep.value++
      
      if (currentStep.value < conversationFlow.length) {
        const nextFlow = conversationFlow[currentStep.value]
        setTimeout(() => {
          addBotMessage(
            nextFlow.question, 
            nextFlow.options,
            nextFlow.allowInput,
            nextFlow.inputPlaceholder
          )
        }, 300)
      } else {
        performMatch()
      }
    }
    
    const handleTextSubmit = () => {
      if (!inputValue.value.trim()) return
      
      const text = inputValue.value.trim()
      addUserMessage(text)
      
      const currentFlow = conversationFlow[currentStep.value]
      if (currentFlow) {
        userProfile[currentFlow.field] = text
      }
      
      inputValue.value = ''
      currentOptions.value = []
      showTextInput.value = false
      
      currentStep.value++
      
      if (currentStep.value < conversationFlow.length) {
        const nextFlow = conversationFlow[currentStep.value]
        setTimeout(() => {
          addBotMessage(
            nextFlow.question, 
            nextFlow.options,
            nextFlow.allowInput,
            nextFlow.inputPlaceholder
          )
        }, 300)
      } else {
        performMatch()
      }
    }
    
    const performMatch = () => {
        addBotMessage('正在为您智能匹配最适合的院校，请稍候...')
        
        setTimeout(() => {
            const result = matchPrograms(userProfile)
            
            // 构建响应消息
            let responseText = ''
            
            // 显示院校/专业不匹配的提示
            if (result.schoolMessage) {
            responseText += `⚠️ ${result.schoolMessage}\n\n`
            }
            
            if (result.programs.length > 0) {
            matchResults.value = result.programs
            
            // 添加这两行：检查收藏状态
            checkFavoriteStatus()

            responseText += `🎉 根据您的需求，我为您找到了 ${result.programs.length} 个匹配的项目！\n\n`
            responseText += `📋 您的需求：\n`
            responseText += `• 目标学历：${userProfile.targetDegree}\n`
            responseText += `• 当前学历：${userProfile.currentEducation}\n`
            responseText += `• 意向专业：${userProfile.majorInterest}\n`
            responseText += `• 院校偏好：${userProfile.schoolPreference}\n\n`
            responseText += `请查看下方推荐结果，点击"立即咨询"可获取详细信息。`
            
            addBotMessage(responseText)
            
            // 保存咨询记录到数据库
            saveConsultRecordToDB()
              .then(() => {
                console.log('咨询记录保存完成，准备刷新历史')
                // 延迟一下再刷新，确保数据库已经保存成功
                setTimeout(() => {
                  loadConsultHistory()
                }, 500)
              })
              .catch(err => {
                console.error('保存咨询记录失败，但不影响用户使用:', err)
              })
            } else {
            responseText += '😔 抱歉，暂未找到完全符合条件的项目。\n\n'
            if (result.suggestion) {
                responseText += `💡 建议：${result.suggestion}\n\n`
            }
            responseText += '您可以联系顾问老师获取个性化方案，或点击"重新咨询"调整筛选条件。'
            
            addBotMessage(responseText, ['联系顾问', '重新咨询'])
            }
        }, 1500)
    }
    
    // 保存咨询记录到数据库
    const saveConsultRecordToDB = async () => {
      try {
        const recordData = {
          userId: userId.value,
          userName: userName.value,  // 这里使用 userName（手机号）
          targetDegree: userProfile.targetDegree,
          currentEducation: userProfile.currentEducation,
          majorInterest: userProfile.majorInterest,
          schoolPreference: userProfile.schoolPreference,
          consultTime: new Date().toISOString(),
          matchCount: String(matchResults.value.length)
        }
        
        console.log('准备保存咨询记录:', recordData)
        const result = await saveConsultRecord(recordData, sessionToken.value)
        console.log('咨询记录保存成功，返回结果:', result)
        return result
      } catch (error) {
        console.error('保存咨询记录失败:', error)
        console.error('错误详情:', error.response?.data || error.message)
        throw error
      }
    }
    
    // 保存点击咨询的院校记录
    const saveClickRecord = async (school) => {
      try {
        const recordData = {
          userId: userId.value,
          userName: userName.value,
          clickedSchool: school,
          targetDegree: userProfile.targetDegree,
          currentEducation: userProfile.currentEducation,
          majorInterest: userProfile.majorInterest,
          consultTime: new Date().toISOString()
        }
        
        await saveConsultRecord(recordData, sessionToken.value)
        console.log('点击咨询记录保存成功')
      } catch (error) {
        console.error('保存点击记录失败:', error)
      }
    }
    
    // 加载咨询历史
    const loadConsultHistory = async () => {
      try {
        if (userId.value && sessionToken.value) {
          console.log('开始加载咨询历史，userId:', userId.value)
          const records = await getUserConsultRecords(userId.value, sessionToken.value)
          console.log('获取到的咨询记录数量:', records.length)
          console.log('咨询记录详情:', records)
          consultHistory.value = records
        } else {
          console.warn('userId 或 sessionToken 为空，无法加载历史记录')
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
        console.error('错误详情:', error.response?.data || error.message)
      }
    }
    
    // 切换历史记录显示
    const toggleHistory = () => {
      showHistory.value = !showHistory.value
    }
    
    // 查看历史记录详情
    const viewHistoryRecord = (record) => {
      // 填充历史数据到用户资料
      userProfile.targetDegree = record.targetDegree
      userProfile.currentEducation = record.currentEducation
      userProfile.majorInterest = record.majorInterest
      userProfile.schoolPreference = record.schoolPreference
      
      // 重新匹配
      const result = matchPrograms(userProfile)
      matchResults.value = result.programs
      
      // 检查收藏状态
      checkFavoriteStatus()
      
      // 滚动到结果区域
      showHistory.value = false
      nextTick(() => {
        const resultsSection = document.querySelector('.results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }
    
    // 收藏/取消收藏院校
    const toggleFavorite = async (program) => {
      try {
        const favorited = await checkSchoolFavorited(userId.value, program.school, sessionToken.value)
        
        if (favorited) {
          await removeFavoriteSchool(favorited.objectId, sessionToken.value)
          program.isFavorited = false
          // 取消收藏成功，不显示提示
        } else {
          const favoriteData = {
            userId: userId.value,
            userName: userName.value,
            schoolName: program.school,
            category: program.category,
            tuition: program.tuition,
            duration: program.duration,
            studyForm: program.studyForm
          }
          
          console.log('准备保存收藏数据:', favoriteData)
          console.log('sessionToken:', sessionToken.value)
          
          await addFavoriteSchool(favoriteData, sessionToken.value)
          program.isFavorited = true
          // 收藏成功，不显示提示
        }
      } catch (error) {
        // 只在失败时显示提示
        alert('收藏操作失败，请稍后重试')
        console.error(error)
      }
    }
    
    // 检查院校收藏状态
    const checkFavoriteStatus = async () => {
      if (!userId.value || !sessionToken.value) return
      
      for (let program of matchResults.value) {
        const favorited = await checkSchoolFavorited(userId.value, program.school, sessionToken.value)
        program.isFavorited = !!favorited
      }
    }
    
    // 跳转到收藏页面
    const goToFavorites = () => {
      router.push('/favorites')
    }
    
    // 跳转到成功案例页面
    const goToGallery = () => {
      router.push('/gallery')
    }

    const formatMessage = (text) => {
      return text.replace(/\n/g, '<br/>')
    }
    
    const formatTuition = (tuition, tuitionMax) => {
      return formatTuitionUtil(tuition, tuitionMax)
    }
    
    const openConsultModal = (program) => {
      selectedProgram.value = program
      showModal.value = true
      
      // 保存点击咨询记录
      saveClickRecord(program.school)
    }
    
    const closeModal = () => {
      showModal.value = false
      selectedProgram.value = null
    }
    
    // 重新开始咨询
    const restartConsult = () => {
        // 重置用户画像
        userProfile.currentEducation = ''
        userProfile.targetDegree = ''
        userProfile.majorInterest = ''
        userProfile.schoolPreference = ''
        
        // 重置状态
        currentStep.value = 0
        matchResults.value = []
        currentOptions.value = []
        showTextInput.value = false
        
        // 添加分隔消息
        messages.value.push({ 
            text: '───────── 开始新的咨询 ─────────', 
            isBot: true 
        })
        
        // 重新开始对话
        startConversation()
    }

    const handleLogout = () => {
      localStorage.removeItem('userInfo')
      router.push('/login')
    }
    
    return {
      userName,
      messages,
      currentOptions,
      showTextInput,
      inputPlaceholder,
      inputValue,
      isTyping,
      messagesContainer,
      matchResults,
      showModal,
      selectedProgram,
      consultantInfo,
      consultHistory,      // 添加
      showHistory,         // 添加
      handleOptionSelect,
      handleTextSubmit,
      formatMessage,
      formatTuition,
      openConsultModal,
      closeModal,
      handleLogout,
      restartConsult,
      toggleHistory,       // 添加
      viewHistoryRecord,   // 添加
      toggleFavorite,      // 添加
      goToGallery,
      goToFavorites        // 添加
    }
  }
}
</script>

<style scoped>
.consult-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%; /* 圆形 */
}

.logo-text h1 {
  font-size: 1.4rem;
  color: #1e293b;
  margin: 0;
}

.logo-text p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome {
  color: #475569;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.chat-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-bottom: 2rem;
}

.messages-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 2rem;
}

.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.75rem;
}

.bot-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
}

.user-avatar {
  background: #e2e8f0;
  font-size: 1.2rem;
}

.message-content {
  max-width: 70%;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  line-height: 1.6;
}

.message.bot .message-content {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom-right-radius: 4px;
}

.typing {
  display: flex;
  gap: 4px;
  padding: 1rem 1.5rem;
}

.typing .dot {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing .dot:nth-child(2) { animation-delay: 0.2s; }
.typing .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-8px); opacity: 1; }
}

.input-area {
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  background: #f8fafc;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.option-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.text-input-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.text-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
}

.text-input:focus {
  border-color: #667eea;
}

.submit-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-section {
  margin-top: 2rem;
}

.results-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.program-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.program-card:hover {
  transform: translateY(-5px);
}

.card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.school-name {
  color: white;
  font-size: 1.2rem;
  margin: 0;
}

.match-score {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.info-item .value {
  font-size: 0.95rem;
  color: #1e293b;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  padding: 0.3rem 0.8rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.8rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.consult-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.3rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.modal-subtitle strong {
  color: #667eea;
}

.consultant-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8fafc;
}

.consultant-avatar {
  font-size: 2.5rem;
}

.consultant-info h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0 0 2px;
}

.consultant-title {
  font-size: 0.85rem;
  color: #64748b;
}

.contact-section {
  padding: 1.5rem 2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-label {
  font-size: 0.8rem;
  color: #64748b;
}

.contact-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.phone-number {
  text-decoration: none;
  color: #10b981;
}

.contact-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

.contact-divider {
  display: flex;
  align-items: center;
  margin: 1rem 0;
  color: #94a3b8;
}

.contact-divider::before,
.contact-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.contact-divider span {
  padding: 0 1rem;
}

.contact-item.wechat {
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
}

.qr-code-wrapper {
  width: 180px;
  height: 180px;
  margin-bottom: 1rem;
}

.qr-code {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 3px solid #e2e8f0;
  object-fit: cover;
}

.wechat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wechat-id {
  font-size: 1rem;
  color: #475569;
  font-weight: 500;
}

.modal-footer {
  padding: 1.2rem 2rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.callback-notice {
  padding: 1rem;
  background: #ecfdf5;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #065f46;
}

.callback-notice strong {
  color: #047857;
}

.working-hours {
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

/* ========================================
   移动端布局优化样式
   将以下样式添加到 Consult.vue 的 @media (max-width: 768px) 中
   ======================================== */

@media (max-width: 768px) {
  /* 原有的样式保持不变 */
  .main-content { padding: 1rem; }
  .results-grid { grid-template-columns: 1fr; }
  .message-content { max-width: 85%; }
  .info-grid { grid-template-columns: 1fr; }
  .text-input-container { flex-direction: column; }
  
  /* ===== 新增/修改的移动端优化样式 ===== */
  
  /* 1. 头部区域优化 */
  .header-content {
    flex-direction: column;
    gap: 0.8rem;
    padding: 1rem;
    align-items: stretch; /* 改为拉伸对齐 */
  }
  
  /* 2. Logo 区域优化 */
  .logo {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
  
  .logo-text h1 {
    font-size: 1.2rem;
  }
  
  .logo-text p {
    font-size: 0.75rem;
  }
  
  /* 3. 用户信息区域优化 */
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  /* 欢迎信息居中 */
  .welcome {
    text-align: center;
    font-size: 0.85rem;
    order: -1; /* 放到最上面 */
    padding: 0.5rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 8px;
  }
  
  /* 4. 按钮组布局优化 */
  .user-info button {
    width: 100%;
    padding: 0.7rem;
    font-size: 0.85rem;
  }
  
  .gallery-btn {
    order: 1;
  }
  
  .history-btn {
    order: 2;
  }
  
  .favorites-btn {
    order: 3;
  }
  
  .logout-btn {
    order: 4;
    margin-top: 0.5rem;
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
  }
  
  /* 5. 对话区域优化 */
  .chat-container {
    border-radius: 16px;
    margin-bottom: 1rem;
  }
  
  .messages-container {
    max-height: 60vh; /* 增加高度 */
    padding: 1rem;
  }
  
  /* 6. 消息气泡优化 */
  .message {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }
  
  .avatar {
    width: 35px;
    height: 35px;
    font-size: 0.7rem;
  }
  
  .message-content {
    max-width: 80%; /* 稍微减小宽度 */
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
  
  /* 7. 选项按钮优化 */
  .options-container {
    padding: 1rem;
    gap: 0.6rem;
  }
  
  .option-btn {
    padding: 0.9rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 12px;
  }
  
  /* 8. 文本输入框优化 */
  .text-input-container {
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .text-input {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
  
  .submit-text-btn {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
  
  /* 9. 匹配结果卡片优化 */
  .result-card {
    padding: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .result-header h3 {
    font-size: 1.1rem;
  }
  
  .result-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  /* 10. 信息网格优化 */
  .info-item {
    padding: 0.8rem;
  }
  
  .info-label {
    font-size: 0.8rem;
  }
  
  .info-value {
    font-size: 0.95rem;
  }
  
  /* 11. 卡片底部按钮优化 */
  .card-footer {
    padding: 1rem;
    gap: 0.5rem;
    flex-direction: column; /* 改为纵向排列 */
  }
  
  .favorite-btn,
  .view-btn,
  .consult-btn {
    width: 100%;
    margin: 0;
    padding: 0.9rem;
    font-size: 0.95rem;
  }
  
  /* 12. 历史记录区域优化 */
  .history-section {
    padding: 1rem;
    margin: 1rem 0;
  }
  
  .history-title {
    font-size: 1.2rem;
  }
  
  .history-card {
    padding: 1rem;
    font-size: 0.85rem;
  }
  
  /* 13. 咨询弹窗优化 */
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-content {
    width: 95%;
    max-width: 100%;
    padding: 1.5rem;
  }
  
  .modal-header h3 {
    font-size: 1.2rem;
  }
  
  .contact-item {
    padding: 0.8rem;
  }
  
  .contact-label {
    font-size: 0.8rem;
  }
  
  .contact-value {
    font-size: 0.95rem;
  }
  
  .wechat-qr {
    width: 150px;
    height: 150px;
  }
  
  /* 14. 特性标签优化 */
  .features-container {
    gap: 0.4rem;
  }
  
  .feature-item {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
  
  /* 15. 调整按钮间距 */
  .gallery-btn,
  .history-btn,
  .favorites-btn {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  /* 16. 优化头部固定定位 */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  /* 17. 主要内容区域留出底部空间 */
  .main-content {
    padding-bottom: 2rem;
  }
  
  /* 18. 优化匹配分数显示 */
  .match-score {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  /* 19. 优化专业列表显示 */
  .majors-list {
    font-size: 0.85rem;
    line-height: 1.6;
  }
  
  /* 20. 优化学费显示 */
  .tuition-value {
    font-size: 1rem;
    font-weight: 600;
  }
}

/* 超小屏幕优化 (max-width: 375px) */
@media (max-width: 375px) {
  .logo-text h1 {
    font-size: 1.1rem;
  }
  
  .logo-text p {
    font-size: 0.7rem;
  }
  
  .user-info button {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  
  .message-content {
    font-size: 0.85rem;
    padding: 0.7rem 0.9rem;
  }
  
  .option-btn {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
  }
  
  .result-card {
    padding: 1rem;
  }
  
  .wechat-qr {
    width: 120px;
    height: 120px;
  }
}

.restart-section {
  margin-top: 2rem;
  text-align: center;
}

.restart-btn {
  padding: 1rem 2rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover {
  background: #667eea;
  color: white;
}
.highlight-major {
  color: #667eea;
  font-weight: 600;
}
.history-btn, .favorites-btn {
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  color: #0369a1;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;
}

.history-btn:hover, .favorites-btn:hover {
  background: #0ea5e9;
  color: white;
}

.gallery-btn {
  padding: 0.5rem 1rem;
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  color: #d97706;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;
}

.gallery-btn:hover {
  background: #fbbf24;
  color: white;
}

.history-section {
  margin: 2rem 0;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.history-title {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.history-list {
  display: grid;
  gap: 1rem;
}

.history-card {
  padding: 1.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-card:hover {
  border-color: #667eea;
  transform: translateX(5px);
}

.history-info {
  flex: 1;
}

.history-detail {
  margin-bottom: 0.5rem;
}

.history-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.history-value {
  color: #1e293b;
  font-weight: 500;
}

.history-time {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 0.8rem;
}

.view-btn {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #5568d3;
}

.favorite-btn {
  flex: 1;
  padding: 0.8rem;
  background: white;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  color: #f59e0b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s;
}

.favorite-btn.favorited {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #d97706;
}

.favorite-btn:hover {
  background: #fef3c7;
}

/* 修改原有的 card-footer 样式 */
.card-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}

/* 修改原有的 consult-btn 样式 */
.consult-btn {
  flex: 2;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
</style>