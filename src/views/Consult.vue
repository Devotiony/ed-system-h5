<template>
  <div class="consult-container">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📚</div>
          <div class="logo-text">
            <h1>荣易达学历提升智能咨询</h1>
            <p>专注成人学业规划|中专至博士|专业匹配|院校优选|全程护航</p>
          </div>
        </div>
        <div class="user-info" v-if="userName">
          <span class="welcome">欢迎，{{ userName }}</span>
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
import { saveConsultRecord } from '@/api/bmob'

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
    const matchResults = ref([])
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
        question: '请问您有意向的专业方向吗？',
        options: ['医学/护理', '教育/师范', '管理/工商', '计算机/IT', '建筑/工程', '会计/金融', '法学', '艺术/设计', '暂不确定'],
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
      if (userInfo) {
        const user = JSON.parse(userInfo)
        userName.value = user.username || ''
        userId.value = user.objectId || ''
        sessionToken.value = user.sessionToken || ''
        userProfile.name = user.username || ''
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
            // 打开一个默认的咨询弹窗
            selectedProgram.value = { school: '学历提升' }
            showModal.value = true
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
            userProfile.targetDegree = ''
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
          userName: userName.value,
          targetDegree: userProfile.targetDegree,
          currentEducation: userProfile.currentEducation,
          majorInterest: userProfile.majorInterest,
          schoolPreference: userProfile.schoolPreference,
          consultTime: new Date().toISOString(),
          matchCount: matchResults.value.length
        }
        
        await saveConsultRecord(recordData, sessionToken.value)
        console.log('咨询记录保存成功')
      } catch (error) {
        console.error('保存咨询记录失败:', error)
        // 不影响用户体验，静默失败
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
      handleOptionSelect,
      handleTextSubmit,
      formatMessage,
      formatTuition,
      openConsultModal,
      closeModal,
      handleLogout,
      restartConsult
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
  font-size: 2.5rem;
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

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .results-grid { grid-template-columns: 1fr; }
  .header-content { flex-direction: column; gap: 1rem; }
  .message-content { max-width: 85%; }
  .info-grid { grid-template-columns: 1fr; }
  .text-input-container { flex-direction: column; }
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

</style>