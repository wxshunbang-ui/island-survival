<script setup>
import { ref, inject, computed, watch, onMounted, onUnmounted } from 'vue'

const gs = inject('gameState')
const gameOver = inject('gameOver')
const winGame = inject('winGame')

const activeTab = ref('actions') // actions | inventory | craft | log
const showLocationPicker = ref(false)

const loc = computed(() => gs.LOCATIONS[gs.currentLocation.value])
const isNight = computed(() => gs.timeOfDay.value === 'night')
const timeIcon = computed(() => {
  const m = { morning: '🌅', afternoon: '☀️', evening: '🌇', night: '🌙' }
  return m[gs.timeOfDay.value]
})
const timeLabel = computed(() => {
  const m = { morning: '清晨', afternoon: '下午', evening: '傍晚', night: '深夜' }
  return m[gs.timeOfDay.value]
})

const inventoryList = computed(() => {
  return Object.entries(gs.inventory.value)
    .filter(([, c]) => c > 0)
    .map(([id, count]) => ({ id, count, ...gs.ITEMS[id] }))
})

const usableItems = computed(() => {
  return inventoryList.value.filter(i => ['food', 'drink', 'medicine'].includes(i.type))
})

const craftableRecipes = computed(() => {
  return gs.CRAFTING.map(r => ({
    ...r,
    canCraft: gs.hasItems(r.needs),
    needsList: Object.entries(r.needs).map(([id, n]) => ({
      icon: gs.ITEMS[id].icon,
      name: gs.ITEMS[id].name,
      need: n,
      have: gs.inventory.value[id] || 0,
      enough: (gs.inventory.value[id] || 0) >= n
    }))
  }))
})

function doAction(actionId) {
  if (actionId === 'craft') {
    activeTab.value = 'craft'
    return
  }
  const result = gs.performAction(actionId)
  if (result === 'dead') {
    gameOver('你的体力耗尽，倒在了荒岛上...')
  }
  if (gs.rescued.value) winGame()
  if (gs.raftProgress.value >= 100) winGame()
}

function useItem(itemId) {
  gs.useItem(itemId)
}

function doCraft(recipe) {
  gs.craftItem(recipe)
}

function goTo(locId) {
  gs.moveToLocation(locId)
  showLocationPicker.value = false
}

// Keyboard support
function onKeydown(e) {
  const num = parseInt(e.key)
  if (num >= 1 && num <= 5) {
    e.preventDefault()
    const locs = Object.keys(gs.LOCATIONS)
    if (locs[num - 1]) goTo(locs[num - 1])
    return
  }
  if (e.key === 'q' || e.key === 'Q') { activeTab.value = 'actions'; return }
  if (e.key === 'w' || e.key === 'W') { activeTab.value = 'inventory'; return }
  if (e.key === 'e' || e.key === 'E') { activeTab.value = 'craft'; return }
  if (e.key === 'r' || e.key === 'R') { activeTab.value = 'log'; return }
  if (e.key === 'm' || e.key === 'M') { showLocationPicker.value = !showLocationPicker.value; return }

  if (activeTab.value === 'actions') {
    const actions = loc.value.actions
    const aKeys = ['a', 's', 'd', 'f']
    const idx = aKeys.indexOf(e.key.toLowerCase())
    if (idx >= 0 && idx < actions.length) {
      e.preventDefault()
      doAction(actions[idx].id)
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// Watch for death
watch(() => gs.health.value, (v) => {
  if (v <= 0) gameOver('你的体力耗尽，倒在了荒岛上...')
})
</script>

<template>
  <div class="game" :class="{ night: isNight }">
    <!-- Background -->
    <div class="scene-bg">
      <video
        v-if="gs.currentLocation.value === 'camp'"
        class="bg-media" autoplay muted loop playsinline
        key="camp-video"
      >
        <source src="/videos/campfire.mp4" type="video/mp4" />
      </video>
      <img v-else class="bg-media" :src="loc.image" :key="loc.id" />
      <div class="bg-overlay" :class="gs.timeOfDay.value"></div>
    </div>

    <!-- Top HUD -->
    <div class="hud safe-top">
      <div class="hud-row">
        <div class="day-info">
          <span class="time-icon">{{ timeIcon }}</span>
          <span>第{{ gs.day.value }}天 {{ timeLabel }}</span>
        </div>
        <button class="map-btn" @click="showLocationPicker = !showLocationPicker">
          🗺️ {{ loc.name }}
        </button>
      </div>
      <div class="stats-row">
        <div class="stat" v-for="s in [
          { icon: '❤️', label: '生命', val: gs.health.value, color: '#ff4444' },
          { icon: '🍖', label: '饥饿', val: gs.hunger.value, color: '#ff8c00' },
          { icon: '💧', label: '口渴', val: gs.thirst.value, color: '#4488ff' },
          { icon: '⚡', label: '体力', val: gs.energy.value, color: '#ffdd00' },
        ]" :key="s.label">
          <span class="stat-icon">{{ s.icon }}</span>
          <div class="stat-bar">
            <div class="stat-fill" :style="{ width: s.val + '%', background: s.color, opacity: s.val < 25 ? 1 : 0.85 }"
                 :class="{ critical: s.val < 25 }"></div>
          </div>
          <span class="stat-num">{{ s.val }}</span>
        </div>
      </div>
      <!-- Raft progress -->
      <div v-if="gs.raftProgress.value > 0" class="raft-bar">
        <span>⛵ 木筏</span>
        <div class="stat-bar"><div class="stat-fill" :style="{ width: gs.raftProgress.value + '%', background: '#44cc88' }"></div></div>
        <span class="stat-num">{{ gs.raftProgress.value }}%</span>
      </div>
    </div>

    <!-- Location description -->
    <div class="loc-desc">
      <p>{{ loc.description }}</p>
    </div>

    <!-- Location picker overlay -->
    <Transition name="slide-up">
      <div v-if="showLocationPicker" class="location-picker" @click.self="showLocationPicker = false">
        <div class="picker-panel">
          <h3>选择目的地</h3>
          <div class="loc-grid">
            <button
              v-for="(l, key) in gs.LOCATIONS" :key="key"
              class="loc-card"
              :class="{ active: gs.currentLocation.value === key }"
              @click="goTo(key)"
            >
              <img :src="l.image" class="loc-thumb" />
              <span class="loc-name">{{ l.name }}</span>
              <span v-if="gs.currentLocation.value === key" class="loc-here">当前</span>
            </button>
          </div>
          <p class="picker-hint">移动消耗 5 点体力</p>
          <p class="picker-keys">快捷键: 1-5 切换地点 | M 打开地图</p>
        </div>
      </div>
    </Transition>

    <!-- Bottom Panel -->
    <div class="bottom-panel safe-bottom">
      <!-- Tabs -->
      <div class="tabs">
        <button v-for="t in [
          { id: 'actions', label: '行动', icon: '⚔️', key: 'Q' },
          { id: 'inventory', label: '背包', icon: '🎒', key: 'W' },
          { id: 'craft', label: '制造', icon: '🔨', key: 'E' },
          { id: 'log', label: '日志', icon: '📜', key: 'R' },
        ]" :key="t.id"
          class="tab-btn"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <span class="tab-icon">{{ t.icon }}</span>
          <span class="tab-label">{{ t.label }}</span>
          <span class="tab-key">{{ t.key }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Actions -->
        <div v-if="activeTab === 'actions'" class="action-grid">
          <button
            v-for="(a, idx) in loc.actions" :key="a.id"
            class="action-btn"
            :class="{ disabled: a.energy > 0 && gs.energy.value < a.energy }"
            @click="doAction(a.id)"
          >
            <span class="action-icon">{{ a.icon }}</span>
            <div class="action-info">
              <span class="action-name">{{ a.name }}</span>
              <span class="action-desc">{{ a.description }}</span>
            </div>
            <div class="action-cost">
              <span v-if="a.energy > 0">⚡{{ a.energy }}</span>
              <span v-else class="restore">+{{ -a.energy }}⚡</span>
            </div>
            <span class="action-key">{{ ['A','S','D','F'][idx] }}</span>
          </button>
        </div>

        <!-- Inventory -->
        <div v-if="activeTab === 'inventory'" class="inventory-panel">
          <div v-if="inventoryList.length === 0" class="empty-msg">背包是空的，去探索吧！</div>
          <div v-else class="inv-grid">
            <button
              v-for="item in inventoryList" :key="item.id"
              class="inv-item"
              :class="{ usable: ['food','drink','medicine'].includes(item.type) }"
              @click="['food','drink','medicine'].includes(item.type) && useItem(item.id)"
            >
              <span class="inv-icon">{{ item.icon }}</span>
              <span class="inv-name">{{ item.name }}</span>
              <span class="inv-count">x{{ item.count }}</span>
              <span v-if="['food','drink','medicine'].includes(item.type)" class="inv-use">使用</span>
            </button>
          </div>
        </div>

        <!-- Crafting -->
        <div v-if="activeTab === 'craft'" class="craft-panel">
          <button
            v-for="r in craftableRecipes" :key="r.id"
            class="craft-item"
            :class="{ available: r.canCraft }"
            @click="r.canCraft && doCraft(r)"
          >
            <span class="craft-icon">{{ r.icon }}</span>
            <div class="craft-info">
              <span class="craft-name">{{ r.name }}</span>
              <div class="craft-needs">
                <span v-for="n in r.needsList" :key="n.name"
                  class="need-tag" :class="{ enough: n.enough }">
                  {{ n.icon }}{{ n.have }}/{{ n.need }}
                </span>
              </div>
            </div>
            <span v-if="r.canCraft" class="craft-go">制作</span>
          </button>
        </div>

        <!-- Log -->
        <div v-if="activeTab === 'log'" class="log-panel">
          <div v-for="(entry, i) in gs.log.value" :key="i" class="log-entry">
            <span class="log-time">{{ entry.time }}</span>
            <span class="log-text">{{ entry.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Background */
.scene-bg { position: absolute; inset: 0; z-index: 0; }
.bg-media { width: 100%; height: 100%; object-fit: cover; }
.bg-overlay {
  position: absolute; inset: 0;
  transition: background 1s ease;
}
.bg-overlay.morning { background: linear-gradient(180deg, rgba(255,200,100,0.1) 0%, rgba(0,0,0,0.4) 100%); }
.bg-overlay.afternoon { background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%); }
.bg-overlay.evening { background: linear-gradient(180deg, rgba(255,100,0,0.2) 0%, rgba(0,0,0,0.5) 100%); }
.bg-overlay.night { background: linear-gradient(180deg, rgba(0,0,30,0.6) 0%, rgba(0,0,0,0.8) 100%); }

/* HUD */
.hud {
  position: relative; z-index: 10;
  padding: 8px 12px;
  background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 80%, transparent 100%);
}
.hud-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.day-info {
  font-size: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
.time-icon { font-size: 18px; }
.map-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  touch-action: manipulation;
}
.map-btn:active { background: rgba(255,255,255,0.25); }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-icon { font-size: 14px; }
.stat-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.stat-fill.critical {
  animation: blink 0.8s ease-in-out infinite;
}
.stat-num {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  min-width: 24px;
  text-align: right;
}

.raft-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: #44cc88;
}
.raft-bar .stat-bar { max-width: 120px; }

/* Location description */
.loc-desc {
  position: relative; z-index: 5;
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding: 0 16px 8px;
  pointer-events: none;
}
.loc-desc p {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
}

/* Location picker */
.location-picker {
  position: absolute; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.picker-panel {
  background: rgba(20,20,30,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  padding: 20px 16px;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
}
.picker-panel h3 {
  text-align: center;
  margin-bottom: 16px;
  color: #fff;
  font-size: 16px;
}
.loc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
@media (min-width: 500px) {
  .loc-grid { grid-template-columns: repeat(5, 1fr); }
}
.loc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px 6px;
  cursor: pointer;
  touch-action: manipulation;
  position: relative;
  color: #fff;
}
.loc-card.active {
  border-color: #ff8c00;
  background: rgba(255,140,0,0.15);
}
.loc-card:active { transform: scale(0.95); }
.loc-thumb {
  width: 50px; height: 35px;
  border-radius: 6px;
  object-fit: cover;
}
.loc-name { font-size: 12px; }
.loc-here {
  position: absolute; top: 4px; right: 4px;
  background: #ff8c00;
  color: #000;
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 700;
}
.picker-hint {
  text-align: center;
  font-size: 12px;
  color: #888;
}
.picker-keys {
  text-align: center;
  font-size: 11px;
  color: #555;
  margin-top: 4px;
}
@media (max-width: 768px) {
  .picker-keys { display: none; }
}

/* Bottom panel */
.bottom-panel {
  position: relative; z-index: 10;
  background: rgba(10,10,20,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.08);
  max-height: 45vh;
  display: flex;
  flex-direction: column;
}
@media (min-width: 769px) {
  .bottom-panel { max-height: 40vh; }
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px 6px;
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  touch-action: manipulation;
  position: relative;
  transition: color 0.2s;
}
.tab-btn.active {
  color: #ff8c00;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%; right: 20%;
  height: 2px;
  background: #ff8c00;
  border-radius: 1px;
}
.tab-icon { font-size: 18px; }
.tab-label { font-size: 11px; }
.tab-key {
  position: absolute;
  top: 2px; right: 6px;
  font-size: 9px;
  color: #444;
  background: rgba(255,255,255,0.06);
  padding: 0 4px;
  border-radius: 3px;
}
@media (max-width: 768px) {
  .tab-key { display: none; }
}

/* Tab content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px;
}

/* Actions */
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 10px 12px;
  color: #e0e0e0;
  cursor: pointer;
  touch-action: manipulation;
  text-align: left;
  transition: background 0.15s;
  position: relative;
}
.action-btn:active:not(.disabled) {
  background: rgba(255,140,0,0.15);
  border-color: rgba(255,140,0,0.3);
}
.action-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.action-icon { font-size: 24px; flex-shrink: 0; }
.action-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.action-name { font-size: 14px; font-weight: 600; }
.action-desc { font-size: 11px; color: #888; }
.action-cost {
  font-size: 12px;
  color: #ffdd00;
  flex-shrink: 0;
}
.action-cost .restore { color: #44cc88; }
.action-key {
  position: absolute;
  top: 6px; right: 8px;
  font-size: 10px;
  color: #555;
  background: rgba(255,255,255,0.06);
  padding: 1px 6px;
  border-radius: 4px;
}
@media (max-width: 768px) {
  .action-key { display: none; }
}

/* Inventory */
.empty-msg {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 14px;
}
.inv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
@media (min-width: 500px) {
  .inv-grid { grid-template-columns: repeat(3, 1fr); }
}
.inv-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 10px;
  color: #ccc;
  cursor: default;
  text-align: left;
  position: relative;
}
.inv-item.usable {
  cursor: pointer;
  touch-action: manipulation;
  border-color: rgba(68,204,136,0.3);
}
.inv-item.usable:active {
  background: rgba(68,204,136,0.15);
}
.inv-icon { font-size: 20px; }
.inv-name { font-size: 12px; flex: 1; }
.inv-count { font-size: 12px; color: #888; }
.inv-use {
  position: absolute;
  top: 3px; right: 5px;
  font-size: 9px;
  color: #44cc88;
  background: rgba(68,204,136,0.15);
  padding: 1px 5px;
  border-radius: 6px;
}

/* Crafting */
.craft-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.craft-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 10px 12px;
  color: #888;
  cursor: default;
  text-align: left;
}
.craft-item.available {
  border-color: rgba(255,140,0,0.3);
  color: #e0e0e0;
  cursor: pointer;
  touch-action: manipulation;
}
.craft-item.available:active {
  background: rgba(255,140,0,0.15);
}
.craft-icon { font-size: 24px; }
.craft-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.craft-name { font-size: 14px; font-weight: 600; }
.craft-needs { display: flex; gap: 8px; flex-wrap: wrap; }
.need-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255,60,60,0.15);
  color: #ff6666;
}
.need-tag.enough {
  background: rgba(68,204,136,0.15);
  color: #44cc88;
}
.craft-go {
  font-size: 13px;
  color: #ff8c00;
  font-weight: 700;
  background: rgba(255,140,0,0.15);
  padding: 4px 12px;
  border-radius: 12px;
}

/* Log */
.log-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 12px;
}
.log-time {
  color: #555;
  flex-shrink: 0;
  min-width: 80px;
}
.log-text { color: #bbb; }

/* Animations */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
}
.slide-up-enter-from .picker-panel, .slide-up-leave-to .picker-panel {
  transform: translateY(100%);
}

/* Desktop optimization */
@media (min-width: 769px) {
  .action-btn:hover:not(.disabled) {
    background: rgba(255,140,0,0.1);
    border-color: rgba(255,140,0,0.2);
  }
  .inv-item.usable:hover {
    background: rgba(68,204,136,0.1);
  }
  .craft-item.available:hover {
    background: rgba(255,140,0,0.1);
  }
  .loc-card:hover {
    background: rgba(255,255,255,0.12);
  }
  .map-btn:hover {
    background: rgba(255,255,255,0.25);
  }
}
</style>
