import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/design-system.css'  // 引入设计系统
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
  CellGroup
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
app.mount('#app')