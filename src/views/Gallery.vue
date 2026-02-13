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

    <!-- 底部导航 -->
    <BottomNav />  <!-- ← 添加 -->
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import PhotoGallery from '@/components/PhotoGallery.vue'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Gallery',
  components: {
    PhotoGallery,
    BottomNav
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
  background: var(--color-primary-gradient);
  padding-bottom: 70px;
}

.page-header {
  background: white;
  box-shadow: var(--shadow-base, 0 4px 6px rgba(0, 0, 0, 0.1));
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
  font-size: var(--font-size-2xl, 2rem);
  color: var(--color-text-primary, #1e293b);
}

.header-content p {
  margin: 0;
  color: var(--color-text-secondary, #64748b);
  font-size: var(--font-size-base, 1rem);
}

.back-btn {
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  padding: 0.6rem 1.2rem;
  background: var(--color-primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  color: white;
  border: none;
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s);  /* ← 添加 */
  font-size: 0.9rem;
  font-weight: 500;
  user-select: none;  /* ← 添加 */
  -webkit-tap-highlight-color: transparent;  /* ← 添加 */
}

.back-btn:hover {
  transform: translateY(-50%) scale(1.05);  /* ← 添加 */
  box-shadow: var(--shadow-md, 0 4px 12px rgba(102, 126, 234, 0.3));  /* ← 添加 */
}

.back-btn:active {
  transform: translateY(-50%) scale(0.95);  /* ← 添加 */
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