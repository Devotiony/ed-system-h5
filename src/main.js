import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/design-system.css'  // 引入设计系统
import './assets/styles/dark-mode.css'  // 引入暗黑模式样式
import ToastPlugin from './plugins/toast'   // 引入 Toast 插件

// 引入 Vant 组件
import { 
  Button, 
  Field, 
  Form, 
  Toast, 
  Dialog,
  NavBar,
  Icon,
  Loading,
  Overlay,
  CellGroup,
  PullRefresh,  // ← 添加
  SwipeCell,
  Checkbox
} from 'vant'
import 'vant/lib/index.css'

// 引入全局样式
import './style.css'

const app = createApp(App)

// 注册 Vant 组件
app.use(Button)
app.use(Field)
app.use(Form)
app.use(Toast)
app.use(Dialog)
app.use(NavBar)
app.use(Icon)
app.use(Loading)
app.use(Overlay)
app.use(CellGroup)

app.use(router)
app.use(ToastPlugin)
app.use(PullRefresh)  // ← 添加
app.use(SwipeCell)    // ← 添加
app.use(Checkbox)

app.mount('#app')