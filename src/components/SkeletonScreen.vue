<template>
  <div class="skeleton-screen">
    <!-- 骨架屏类型：列表 -->
    <div v-if="type === 'list'" class="skeleton-list">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-list-item"
      >
        <div class="skeleton-avatar skeleton"></div>
        <div class="skeleton-content">
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-text skeleton"></div>
          <div class="skeleton-text skeleton" style="width: 60%"></div>
        </div>
      </div>
    </div>

    <!-- 骨架屏类型：卡片 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-card-item"
      >
        <div class="skeleton-image skeleton"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-text skeleton"></div>
          <div class="skeleton-text skeleton" style="width: 80%"></div>
        </div>
      </div>
    </div>

    <!-- 骨架屏类型：消息 -->
    <div v-else-if="type === 'message'" class="skeleton-message">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-message-item"
      >
        <div class="skeleton-avatar skeleton"></div>
        <div class="skeleton-bubble skeleton"></div>
      </div>
    </div>

    <!-- 骨架屏类型：自定义 -->
    <div v-else class="skeleton-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonScreen',
  props: {
    type: {
      type: String,
      default: 'list',
      validator: (value) => ['list', 'card', 'message', 'custom'].includes(value)
    },
    count: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style scoped>
.skeleton-screen {
  width: 100%;
  padding: var(--spacing-4, 16px);
}

/* 骨架屏动画 */
.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0px,
    rgba(229, 231, 235, 0.8) 40px,
    #f3f4f6 80px
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* 列表骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-list-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 40%;
}

.skeleton-text {
  height: 16px;
  width: 100%;
}

/* 卡片骨架屏 */
.skeleton-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-card-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 200px;
}

.skeleton-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 消息骨架屏 */
.skeleton-message {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.skeleton-message-item:nth-child(even) {
  flex-direction: row-reverse;
}

.skeleton-bubble {
  max-width: 70%;
  height: 60px;
  flex: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .skeleton-screen {
    padding: var(--spacing-2, 8px);
  }

  .skeleton-card {
    grid-template-columns: 1fr;
  }

  .skeleton-list-item {
    padding: 12px;
  }

  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>