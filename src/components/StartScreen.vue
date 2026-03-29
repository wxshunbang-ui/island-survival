<script setup>
import { inject, onMounted, onUnmounted } from 'vue'
const startGame = inject('startGame')

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    startGame()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="start-screen" @click="startGame" @touchend.prevent="startGame">
    <video class="bg-video" autoplay muted loop playsinline>
      <source src="/videos/beach.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>
    <div class="content">
      <h1 class="title">荒岛求生</h1>
      <p class="subtitle">Island Survival</p>
      <div class="divider"></div>
      <p class="desc">你从海难中醒来，发现自己被冲上了一座荒岛。<br/>收集资源、建造工具、寻找出路！</p>
      <div class="start-hint">
        <span class="pulse">点击屏幕开始游戏</span>
        <span class="keyboard-hint">或按 Enter / 空格键</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.start-screen {
  width: 100%; height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.bg-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
}
.content {
  position: relative; z-index: 1;
  text-align: center;
  padding: 20px;
}
.title {
  font-size: clamp(48px, 12vw, 80px);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0,0,0,0.8), 0 0 60px rgba(255,140,0,0.3);
  letter-spacing: 8px;
  margin-bottom: 8px;
}
.subtitle {
  font-size: clamp(14px, 3vw, 20px);
  color: rgba(255,255,255,0.6);
  letter-spacing: 6px;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.divider {
  width: 60px; height: 2px;
  background: linear-gradient(90deg, transparent, #ff8c00, transparent);
  margin: 0 auto 24px;
}
.desc {
  font-size: clamp(13px, 2.5vw, 16px);
  color: rgba(255,255,255,0.75);
  line-height: 1.8;
  max-width: 400px;
  margin: 0 auto 40px;
}
.start-hint {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.pulse {
  font-size: clamp(16px, 3vw, 20px);
  color: #ff8c00;
  animation: pulse 2s ease-in-out infinite;
}
.keyboard-hint {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}
@media (max-width: 768px) {
  .keyboard-hint { display: none; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
