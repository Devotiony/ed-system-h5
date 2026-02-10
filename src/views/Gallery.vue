<template>
  <div class="gallery-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <h1>📸 成功案例展示</h1>
        <p>真实学员证书 · 线下实体门店</p>
        <button class="back-btn" @click="goBack">返回咨询</button>
      </div>
    </header>

    <!-- 照片展示组件 -->
    <main class="page-main">
      <PhotoGallery />
    </main>

    <!-- 页面底部 -->
    <footer class="page-footer">
      <p>💼 荣易达学历提升 · 专注成人学业规划</p>
      <p>🏆 已帮助数万名学员成功提升学历</p>
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import PhotoGallery from '@/components/PhotoGallery.vue'

export default {
  name: 'Gallery',
  components: {
    PhotoGallery
  },
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.back()
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  position: relative;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #1e293b;
}

.header-content p {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.back-btn {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.6rem 1.5rem;
  background: #667eea;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #5568d3;
  transform: translateY(-50%) scale(1.05);
}

.page-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.page-footer {
  text-align: center;
  padding: 2rem;
  color: white;
}

.page-footer p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .header-content {
    padding: 1.5rem 1rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .back-btn {
    position: static;
    transform: none;
    margin-top: 1rem;
    width: 100%;
  }
  
  .back-btn:hover {
    transform: scale(1.05);
  }
  
  .page-main {
    padding: 2rem 1rem;
  }
}
</style>