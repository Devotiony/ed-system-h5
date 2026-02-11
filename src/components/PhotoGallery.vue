<template>
  <div class="photo-gallery">
    <!-- 分类切换 -->
    <div class="gallery-tabs">
      <button 
        v-for="(label, key) in categories" 
        :key="key"
        :class="['tab-btn', { active: currentCategory === key }]"
        @click="switchCategory(key)"
      >
        {{ label }}
      </button>
    </div>

    <!-- 照片列表 -->
    <div class="gallery-content">
      <div class="photos-grid">
        <div 
          v-for="item in currentPhotos" 
          :key="item.id"
          class="photo-card"
          @click="openPreview(item)"
        >
          <div class="photo-wrapper">
            <!-- 添加 loading="lazy" 实现懒加载 -->
            <img 
              :src="item.imageUrl" 
              :alt="item.description"
              loading="lazy"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <!-- 加载中状态 -->
            <div class="image-loading" v-if="!imageLoaded[item.id]">
              <div class="loading-spinner"></div>
            </div>
            <div class="photo-overlay">
              <span class="view-icon">🔍 查看大图</span>
            </div>
          </div>
          
          <!-- 门店信息 -->
          <div v-if="currentCategory === 'stores'" class="photo-info">
            <h4>{{ item.location }}</h4>
            <p v-if="item.address" class="info-detail">{{ item.address }}</p>
            <p v-if="item.description" class="info-description">{{ item.description }}</p>
            <div class="feature-tags" v-if="item.features && item.features.length">
              <span 
                v-for="(feature, idx) in item.features" 
                :key="idx"
                class="feature-tag"
              >
                {{ feature }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="currentPhotos.length === 0" class="empty-state">
        <div class="empty-icon">📷</div>
        <p>暂无照片</p>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button class="close-btn" @click="closePreview">×</button>
        <!-- 预览图片也添加懒加载 -->
        <img 
          :src="previewImage.imageUrl" 
          :alt="previewImage.description"
          loading="lazy"
        />
        
        <!-- 预览信息 -->
        <div class="preview-info" v-if="currentCategory === 'stores'">
          <h3>{{ previewImage.location }}</h3>
          <p v-if="previewImage.address">{{ previewImage.address }}</p>
          <p v-if="previewImage.description">{{ previewImage.description }}</p>
        </div>

        <!-- 左右切换按钮 -->
        <button 
          v-if="currentIndex > 0" 
          class="nav-btn prev-btn" 
          @click.stop="prevPhoto"
        >
          ‹
        </button>
        <button 
          v-if="currentIndex < currentPhotos.length - 1" 
          class="nav-btn next-btn" 
          @click.stop="nextPhoto"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { GALLERY_DATA, GALLERY_CATEGORIES } from '@/data/gallery'

export default {
  name: 'PhotoGallery',
  setup() {
    const currentCategory = ref('certificates')
    const showPreview = ref(false)
    const currentIndex = ref(0)
    const categories = GALLERY_CATEGORIES
    const imageLoaded = reactive({}) // 追踪图片加载状态

    // 当前分类的照片列表
    const currentPhotos = computed(() => {
      return GALLERY_DATA[currentCategory.value] || []
    })

    // 当前预览的照片
    const previewImage = computed(() => {
      return currentPhotos.value[currentIndex.value] || {}
    })

    // 切换分类
    const switchCategory = (category) => {
      currentCategory.value = category
      showPreview.value = false
      currentIndex.value = 0
    }

    // 打开预览
    const openPreview = (item) => {
      const index = currentPhotos.value.findIndex(photo => photo.id === item.id)
      currentIndex.value = index
      showPreview.value = true
    }

    // 关闭预览
    const closePreview = () => {
      showPreview.value = false
    }

    // 上一张
    const prevPhoto = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
      }
    }

    // 下一张
    const nextPhoto = () => {
      if (currentIndex.value < currentPhotos.value.length - 1) {
        currentIndex.value++
      }
    }

    // 图片加载成功
    const handleImageLoad = (event) => {
      const img = event.target
      const card = img.closest('.photo-card')
      if (card) {
        const item = currentPhotos.value.find(p => 
          img.src.includes(p.imageUrl)
        )
        if (item) {
          imageLoaded[item.id] = true
        }
      }
    }

    // 图片加载失败
    const handleImageError = (event) => {
      console.error('图片加载失败:', event.target.src)
      // 可以设置一个默认图片
      // event.target.src = '/images/placeholder.jpg'
    }

    return {
      currentCategory,
      categories,
      currentPhotos,
      showPreview,
      previewImage,
      currentIndex,
      imageLoaded,
      switchCategory,
      openPreview,
      closePreview,
      prevPhoto,
      nextPhoto,
      handleImageLoad,
      handleImageError
    }
  }
}
</script>

<style scoped>
.photo-gallery {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.8rem 2rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

.gallery-content {
  min-height: 400px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.photo-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.photo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.photo-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 比例 */
  overflow: hidden;
  background: #f1f5f9;
}

.photo-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 添加过渡效果，图片加载完成后淡入 */
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.photo-wrapper img[loading="lazy"] {
  /* 懒加载图片的初始样式 */
  opacity: 0;
}

.photo-wrapper img[src]:not([src=""]) {
  /* 图片加载完成后显示 */
  opacity: 1;
}

/* 图片加载中状态 */
.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.view-icon {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.photo-info {
  padding: 1.5rem;
}

.photo-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.info-detail {
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: #64748b;
}

.info-description {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #475569;
}

.info-tag {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.85rem;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.feature-tag {
  padding: 0.3rem 0.8rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 20px;
  font-size: 0.8rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* 预览弹窗 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.preview-content {
  position: relative;
  max-width: 900px;
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.preview-content img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  background: #000;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: rotate(90deg);
}

.preview-info {
  padding: 2rem;
  background: white;
}

.preview-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #1e293b;
}

.preview-info p {
  margin: 0.3rem 0;
  color: #64748b;
}

.preview-year {
  margin-top: 0.5rem;
  color: #667eea;
  font-weight: 600;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.prev-btn {
  left: 1rem;
}

.next-btn {
  right: 1rem;
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .gallery-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    width: 100%;
  }
  
  .preview-modal {
    padding: 1rem;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>