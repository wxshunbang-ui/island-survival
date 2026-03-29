<script setup>
import { inject, onMounted, onUnmounted } from 'vue'
const gs = inject('gameState')
const backToStart = inject('backToStart')

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    backToStart()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="win">
    <video class="bg-video" autoplay muted loop playsinline>
      <source src="/videos/beach.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>
    <div class="content">
      <div class="icon">🎉</div>
      <h1>你成功逃出荒岛！</h1>
      <p class="stats">你在荒岛上生存了 <strong>{{ gs.day.value }}</strong> 天</p>
      <p class="desc">凭借智慧和毅力，你终于离开了这座荒岛。</p>
      <button class="btn" @click="backToStart" @touchend.prevent="backToStart">
        返回主页
      </button>
    </div>
  </div>
</template>

<style scoped>
.win {
  width: 100%; height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.bg-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
}
.content {
  position: relative; z-index: 1;
  text-align: center;
  padding: 20px;
}
.icon { font-size: 80px; margin-bottom: 16px; }
h1 {
  font-size: clamp(28px, 6vw, 42px);
  color: #ffd700;
  text-shadow: 0 0 30px rgba(255,215,0,0.5);
  margin-bottom: 12px;
}
.stats { font-size: 18px; color: #ccc; margin-bottom: 8px; }
.stats strong { color: #ffd700; font-size: 24px; }
.desc { font-size: 14px; color: #aaa; margin-bottom: 32px; }
.btn {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  border: none; color: #000;
  padding: 14px 48px;
  font-size: 18px; font-weight: 700;
  border-radius: 30px;
  cursor: pointer;
  touch-action: manipulation;
}
.btn:active { transform: scale(0.95); }
</style>
