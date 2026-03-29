<script setup>
import { inject, onMounted, onUnmounted } from 'vue'
const gs = inject('gameState')
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
  <div class="gameover">
    <div class="overlay"></div>
    <div class="content">
      <div class="skull">💀</div>
      <h1>你没能活下去...</h1>
      <p class="stats">生存了 <strong>{{ gs.day.value }}</strong> 天</p>
      <p class="reason">{{ gs.deathReason.value || '你在荒岛上倒下了。' }}</p>
      <button class="retry-btn" @click="startGame" @touchend.prevent="startGame">
        重新开始
      </button>
      <p class="hint">按 Enter 重试</p>
    </div>
  </div>
</template>

<style scoped>
.gameover {
  width: 100%; height: 100%;
  background: url('/images/cave.jpg') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.85);
}
.content {
  position: relative; z-index: 1;
  text-align: center;
  padding: 20px;
}
.skull {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}
h1 {
  font-size: clamp(28px, 6vw, 40px);
  color: #ff4444;
  margin-bottom: 12px;
}
.stats {
  font-size: 18px; color: #ccc;
  margin-bottom: 8px;
}
.stats strong { color: #ff8c00; font-size: 24px; }
.reason {
  font-size: 14px; color: #999;
  margin-bottom: 32px;
}
.retry-btn {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  border: none; color: #fff;
  padding: 14px 48px;
  font-size: 18px;
  border-radius: 30px;
  cursor: pointer;
  touch-action: manipulation;
}
.retry-btn:active { transform: scale(0.95); }
.hint {
  font-size: 12px; color: #555;
  margin-top: 16px;
}
@media (max-width: 768px) { .hint { display: none; } }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
