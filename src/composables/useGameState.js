import { ref, computed } from 'vue'

const LOCATIONS = {
  beach: {
    id: 'beach',
    name: '海滩',
    image: '/images/beach.jpg',
    description: '金色沙滩上散落着船只残骸，椰子树随风摇摆。远处是无尽的碧蓝海洋。',
    actions: [
      { id: 'search_wreck', name: '搜索残骸', icon: '🔍', energy: 10, description: '在船只残骸中寻找有用物资' },
      { id: 'collect_coconut', name: '采集椰子', icon: '🥥', energy: 5, description: '从椰子树上摘椰子' },
      { id: 'fish_shore', name: '岸边钓鱼', icon: '🎣', energy: 15, description: '在浅水区尝试抓鱼' },
      { id: 'collect_wood', name: '收集浮木', icon: '🪵', energy: 8, description: '收集冲上岸的浮木' },
    ]
  },
  forest: {
    id: 'forest',
    name: '丛林',
    image: '/images/forest.jpg',
    description: '茂密的热带丛林中，阳光透过树冠洒下斑驳光影。地上散落着各种浆果和蘑菇。',
    actions: [
      { id: 'gather_berries', name: '采集浆果', icon: '🫐', energy: 8, description: '采集野生浆果充饥' },
      { id: 'collect_herbs', name: '采集草药', icon: '🌿', energy: 10, description: '寻找可以治疗伤病的草药' },
      { id: 'hunt', name: '设置陷阱', icon: '🪤', energy: 20, description: '用树枝和藤蔓制作陷阱捕猎' },
      { id: 'chop_wood', name: '砍伐树木', icon: '🪓', energy: 15, description: '砍伐树木获取木材' },
    ]
  },
  cave: {
    id: 'cave',
    name: '洞穴',
    image: '/images/cave.jpg',
    description: '黑暗的洞穴中，发光的矿石照亮了岩壁。浅水池倒映着奇异的光芒。',
    actions: [
      { id: 'mine_crystal', name: '采集矿石', icon: '💎', energy: 20, description: '采集发光的矿石晶体' },
      { id: 'explore_deep', name: '深入探索', icon: '🔦', energy: 25, description: '冒险深入洞穴寻找宝藏' },
      { id: 'collect_water', name: '收集清水', icon: '💧', energy: 5, description: '从地下水池收集干净的水' },
      { id: 'rest_cave', name: '洞穴休息', icon: '😴', energy: -30, description: '在洞穴中安全地休息' },
    ]
  },
  cliff: {
    id: 'cliff',
    name: '悬崖',
    image: '/images/cliff.jpg',
    description: '巍峨的海岸悬崖上可以俯瞰整个岛屿。潮汐池中有各种海洋生物。',
    actions: [
      { id: 'scout', name: '登高远望', icon: '🔭', energy: 15, description: '从高处观察岛屿全貌和海上动向' },
      { id: 'cliff_fish', name: '崖边捕鱼', icon: '🐟', energy: 12, description: '在潮汐池中捕捉鱼虾' },
      { id: 'collect_eggs', name: '采集鸟蛋', icon: '🥚', energy: 18, description: '攀爬岩壁采集海鸟蛋' },
      { id: 'signal_fire', name: '点燃信号火', icon: '🔥', energy: 10, description: '在悬崖顶部点燃信号火求救' },
    ]
  },
  camp: {
    id: 'camp',
    name: '营地',
    image: '/images/camp.jpg',
    description: '你搭建的简易营地，有一个小篝火和竹制避风棚。这里是你的安全基地。',
    actions: [
      { id: 'cook', name: '烹饪食物', icon: '🍳', energy: 8, description: '用篝火烹饪食材恢复饥饿值' },
      { id: 'craft', name: '制作工具', icon: '🔨', energy: 12, description: '用收集的材料制作工具' },
      { id: 'sleep', name: '睡觉休息', icon: '🛌', energy: -50, description: '在营地好好睡一觉恢复体力' },
      { id: 'build_raft', name: '建造木筏', icon: '⛵', energy: 30, description: '用木材和绳索建造逃生木筏' },
    ]
  }
}

const ITEMS = {
  coconut: { name: '椰子', icon: '🥥', type: 'food', hunger: 15, thirst: 10 },
  berry: { name: '浆果', icon: '🫐', type: 'food', hunger: 10, thirst: 5 },
  fish: { name: '生鱼', icon: '🐟', type: 'material' },
  cooked_fish: { name: '烤鱼', icon: '🍖', type: 'food', hunger: 30, thirst: 0 },
  wood: { name: '木材', icon: '🪵', type: 'material' },
  herb: { name: '草药', icon: '🌿', type: 'medicine', health: 20 },
  crystal: { name: '矿石晶体', icon: '💎', type: 'material' },
  rope: { name: '绳索', icon: '🪢', type: 'material' },
  water: { name: '清水', icon: '💧', type: 'drink', thirst: 25 },
  egg: { name: '鸟蛋', icon: '🥚', type: 'food', hunger: 12, thirst: 0 },
  meat: { name: '生肉', icon: '🥩', type: 'material' },
  cooked_meat: { name: '烤肉', icon: '🍖', type: 'food', hunger: 40, thirst: 0 },
  axe: { name: '石斧', icon: '🪓', type: 'tool' },
  knife: { name: '石刀', icon: '🔪', type: 'tool' },
  treasure: { name: '古代宝物', icon: '👑', type: 'special' },
}

const CRAFTING = [
  { id: 'craft_rope', name: '编织绳索', icon: '🪢', needs: { wood: 2 }, gives: { rope: 1 }, description: '用树皮编织绳索' },
  { id: 'craft_axe', name: '制作石斧', icon: '🪓', needs: { wood: 2, crystal: 1 }, gives: { axe: 1 }, description: '制作一把石斧' },
  { id: 'craft_knife', name: '制作石刀', icon: '🔪', needs: { wood: 1, crystal: 1 }, gives: { knife: 1 }, description: '制作一把石刀' },
]

const RAFT_NEEDS = { wood: 10, rope: 5 }

export function useGameState() {
  const health = ref(100)
  const hunger = ref(100)
  const thirst = ref(100)
  const energy = ref(100)
  const day = ref(1)
  const timeOfDay = ref('morning') // morning, afternoon, evening, night
  const currentLocation = ref('beach')
  const inventory = ref({})
  const log = ref([])
  const deathReason = ref('')
  const raftProgress = ref(0) // 0-100
  const rescued = ref(false)
  const signalFireLit = ref(false)
  const signalFireDay = ref(0)
  const hasAxe = computed(() => (inventory.value.axe || 0) > 0)
  const hasKnife = computed(() => (inventory.value.knife || 0) > 0)

  function reset() {
    health.value = 100
    hunger.value = 100
    thirst.value = 100
    energy.value = 100
    day.value = 1
    timeOfDay.value = 'morning'
    currentLocation.value = 'beach'
    inventory.value = {}
    log.value = []
    deathReason.value = ''
    raftProgress.value = 0
    rescued.value = false
    signalFireLit.value = false
    signalFireDay.value = 0
    addLog('你从一场海难中醒来，发现自己被冲到了一座荒岛上...')
    addLog('你需要找到食物、水源和庇护所来生存下去！')
  }

  function addLog(msg) {
    log.value.unshift({ text: msg, time: `第${day.value}天 ${timeLabel()}` })
    if (log.value.length > 50) log.value.pop()
  }

  function timeLabel() {
    const map = { morning: '清晨', afternoon: '下午', evening: '傍晚', night: '深夜' }
    return map[timeOfDay.value]
  }

  function advanceTime() {
    const order = ['morning', 'afternoon', 'evening', 'night']
    const idx = order.indexOf(timeOfDay.value)
    if (idx === 3) {
      timeOfDay.value = 'morning'
      day.value++
      hunger.value = Math.max(0, hunger.value - 8)
      thirst.value = Math.max(0, thirst.value - 10)
      addLog(`☀️ 第${day.value}天到来了。`)
      if (signalFireLit.value && day.value - signalFireDay.value >= 3) {
        if (Math.random() < 0.4) {
          rescued.value = true
          addLog('🚢 一艘船注意到了你的信号火！你获救了！')
        }
      }
    } else {
      timeOfDay.value = order[idx + 1]
    }
    checkStatus()
  }

  function checkStatus() {
    if (hunger.value <= 0) {
      health.value = Math.max(0, health.value - 10)
      addLog('⚠️ 你饿得头晕眼花，生命值下降了！')
    }
    if (thirst.value <= 0) {
      health.value = Math.max(0, health.value - 15)
      addLog('⚠️ 你渴得嗓子冒烟，生命值急剧下降！')
    }
    if (health.value <= 0) {
      return 'dead'
    }
    return 'alive'
  }

  function addItem(itemId, count = 1) {
    inventory.value[itemId] = (inventory.value[itemId] || 0) + count
  }

  function removeItem(itemId, count = 1) {
    if ((inventory.value[itemId] || 0) >= count) {
      inventory.value[itemId] -= count
      if (inventory.value[itemId] <= 0) delete inventory.value[itemId]
      return true
    }
    return false
  }

  function hasItems(needs) {
    return Object.entries(needs).every(([id, count]) => (inventory.value[id] || 0) >= count)
  }

  function useItem(itemId) {
    const item = ITEMS[itemId]
    if (!item) return
    if (!removeItem(itemId)) return

    if (item.type === 'food') {
      hunger.value = Math.min(100, hunger.value + (item.hunger || 0))
      thirst.value = Math.min(100, thirst.value + (item.thirst || 0))
      addLog(`🍽️ 你吃了${item.icon}${item.name}，饥饿值+${item.hunger || 0}`)
    } else if (item.type === 'drink') {
      thirst.value = Math.min(100, thirst.value + (item.thirst || 0))
      addLog(`💧 你喝了${item.name}，口渴值+${item.thirst}`)
    } else if (item.type === 'medicine') {
      health.value = Math.min(100, health.value + (item.health || 0))
      addLog(`💊 你使用了${item.icon}${item.name}，生命值+${item.health}`)
    }
  }

  function performAction(actionId) {
    const loc = LOCATIONS[currentLocation.value]
    const action = loc.actions.find(a => a.id === actionId)
    if (!action) return

    // energy cost (negative means restore)
    if (action.energy > 0 && energy.value < action.energy) {
      addLog('😩 你太累了，需要休息！')
      return
    }
    energy.value = Math.min(100, Math.max(0, energy.value - action.energy))
    hunger.value = Math.max(0, hunger.value - 3)
    thirst.value = Math.max(0, thirst.value - 4)

    // Random events
    const eventRoll = Math.random()

    switch (actionId) {
      case 'search_wreck': {
        const r = Math.random()
        if (r < 0.3) { addItem('rope'); addLog('🪢 你在残骸中找到了一段绳索！') }
        else if (r < 0.5) { addItem('knife'); addLog('🔪 你找到了一把生锈的刀！') }
        else if (r < 0.7) { addItem('wood', 2); addLog('🪵 你拆下了一些木板。') }
        else { addLog('💨 残骸中没有找到什么有用的东西。') }
        break
      }
      case 'collect_coconut': {
        const count = Math.random() < 0.5 ? 2 : 1
        addItem('coconut', count)
        addLog(`🥥 你摘到了${count}个椰子！`)
        break
      }
      case 'fish_shore': {
        if (Math.random() < 0.6) {
          const count = Math.random() < 0.3 ? 2 : 1
          addItem('fish', count)
          addLog(`🐟 你抓到了${count}条鱼！`)
        } else {
          addLog('🐟 鱼太狡猾了，什么也没抓到。')
        }
        break
      }
      case 'collect_wood': {
        const count = hasAxe.value ? 3 : 2
        addItem('wood', count)
        addLog(`🪵 你收集了${count}块浮木。${hasAxe.value ? '（石斧加成！）' : ''}`)
        break
      }
      case 'gather_berries': {
        if (Math.random() < 0.85) {
          addItem('berry', 2)
          addLog('🫐 你采集了一些新鲜的浆果！')
        } else {
          health.value = Math.max(0, health.value - 10)
          addLog('☠️ 你误食了有毒的浆果！生命值-10')
        }
        break
      }
      case 'collect_herbs': {
        if (Math.random() < 0.7) {
          addItem('herb')
          addLog('🌿 你找到了一些药用草药。')
        } else {
          addLog('🌿 没有找到有用的草药。')
        }
        break
      }
      case 'hunt': {
        if (Math.random() < 0.5) {
          addItem('meat', 2)
          addLog('🪤 陷阱成功了！你捕获了猎物，获得生肉！')
        } else {
          addLog('🪤 陷阱是空的，猎物很警觉。')
        }
        break
      }
      case 'chop_wood': {
        const count = hasAxe.value ? 5 : 3
        addItem('wood', count)
        addLog(`🪓 你砍伐了树木，获得${count}块木材。${hasAxe.value ? '（石斧加成！）' : ''}`)
        break
      }
      case 'mine_crystal': {
        const count = Math.random() < 0.5 ? 2 : 1
        addItem('crystal', count)
        addLog(`💎 你采集了${count}块发光矿石！`)
        break
      }
      case 'explore_deep': {
        const r = Math.random()
        if (r < 0.2) {
          addItem('treasure')
          addLog('👑 你在洞穴深处发现了古代宝物！')
        } else if (r < 0.5) {
          addItem('crystal', 3)
          addLog('💎 你发现了一个矿石矿脉！获得3块矿石。')
        } else if (r < 0.7) {
          health.value = Math.max(0, health.value - 15)
          addLog('🦇 一群蝙蝠攻击了你！生命值-15')
        } else {
          addLog('🕳️ 洞穴太深了，你不敢继续前进。')
        }
        break
      }
      case 'collect_water': {
        addItem('water', 2)
        addLog('💧 你收集了干净的地下水。')
        break
      }
      case 'rest_cave': {
        addLog('😴 你在洞穴中安全地休息了一会。体力恢复了。')
        break
      }
      case 'scout': {
        const r = Math.random()
        if (r < 0.3) {
          addLog('🔭 你看到远处有一艘船！快点燃信号火！')
        } else if (r < 0.5) {
          addLog('🔭 你发现了岛上一处新的资源点。')
          addItem('wood', 2)
        } else {
          addLog('🔭 四周都是茫茫大海，没有看到船只...')
        }
        break
      }
      case 'cliff_fish': {
        if (Math.random() < 0.7) {
          addItem('fish', 2)
          addLog('🐟 潮汐池里的鱼很多！你抓到了2条鱼。')
        } else {
          addLog('🐟 潮汐池今天没什么鱼。')
        }
        break
      }
      case 'collect_eggs': {
        if (Math.random() < 0.6) {
          addItem('egg', 2)
          addLog('🥚 你小心翼翼地采集了几个鸟蛋。')
        } else {
          health.value = Math.max(0, health.value - 8)
          addLog('🦅 海鸟攻击了你！你摔了一跤。生命值-8')
        }
        break
      }
      case 'signal_fire': {
        if (!hasItems({ wood: 3 })) {
          addLog('🔥 需要至少3块木材才能点燃信号火！')
          energy.value = Math.min(100, energy.value + action.energy)
          return
        }
        removeItem('wood', 3)
        signalFireLit.value = true
        signalFireDay.value = day.value
        addLog('🔥 你在悬崖顶部点燃了信号火！浓烟升起，希望有人能看到！')
        break
      }
      case 'cook': {
        let cooked = false
        if (removeItem('fish')) {
          addItem('cooked_fish')
          addLog('🍳 你烤了一条鱼，香气扑鼻！')
          cooked = true
        }
        if (removeItem('meat')) {
          addItem('cooked_meat')
          addLog('🍳 你烤了一块肉！')
          cooked = true
        }
        if (!cooked) {
          addLog('🍳 你没有可以烹饪的食材。')
          energy.value = Math.min(100, energy.value + action.energy)
        }
        break
      }
      case 'craft': {
        // handled by crafting UI
        break
      }
      case 'sleep': {
        addLog('🛌 你在营地睡了一觉，精力充沛了！')
        advanceTime()
        advanceTime()
        break
      }
      case 'build_raft': {
        if (!hasItems({ wood: 3, rope: 2 })) {
          addLog(`⛵ 建造木筏每次需要: 🪵木材x3 + 🪢绳索x2。总共需要: 🪵x10 + 🪢x5`)
          energy.value = Math.min(100, energy.value + action.energy)
          return
        }
        removeItem('wood', 3)
        removeItem('rope', 2)
        raftProgress.value = Math.min(100, raftProgress.value + 25)
        addLog(`⛵ 木筏建造进度: ${raftProgress.value}%`)
        if (raftProgress.value >= 100) {
          addLog('🎉 木筏建造完成！你可以出海了！')
        }
        break
      }
    }

    // Random weather/events
    if (eventRoll < 0.05) {
      addLog('🌧️ 突然下起了暴雨！你收集了一些雨水。')
      thirst.value = Math.min(100, thirst.value + 15)
    } else if (eventRoll < 0.08) {
      addLog('🐍 一条蛇从草丛中窜出，咬了你一口！生命值-12')
      health.value = Math.max(0, health.value - 12)
    }

    advanceTime()
    return checkStatus()
  }

  function craftItem(recipe) {
    if (!hasItems(recipe.needs)) return false
    Object.entries(recipe.needs).forEach(([id, count]) => removeItem(id, count))
    Object.entries(recipe.gives).forEach(([id, count]) => addItem(id, count))
    addLog(`🔨 你制作了: ${recipe.icon} ${recipe.name}`)
    return true
  }

  function moveToLocation(locId) {
    if (locId === currentLocation.value) return
    energy.value = Math.max(0, energy.value - 5)
    currentLocation.value = locId
    addLog(`🚶 你前往了${LOCATIONS[locId].name}。`)
  }

  return {
    health, hunger, thirst, energy, day, timeOfDay,
    currentLocation, inventory, log, deathReason,
    raftProgress, rescued, signalFireLit,
    hasAxe, hasKnife,
    reset, addLog, performAction, moveToLocation,
    useItem, craftItem, addItem, removeItem, hasItems,
    LOCATIONS, ITEMS, CRAFTING, RAFT_NEEDS
  }
}
