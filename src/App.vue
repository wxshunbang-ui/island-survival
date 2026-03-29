<script setup>
import { ref, provide } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameScreen from './components/GameScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import WinScreen from './components/WinScreen.vue'
import { useGameState } from './composables/useGameState'

const screen = ref('start')
const gameState = useGameState()

provide('gameState', gameState)

function startGame() {
  gameState.reset()
  screen.value = 'game'
}

function gameOver(reason) {
  gameState.deathReason.value = reason
  screen.value = 'gameover'
}

function winGame() {
  screen.value = 'win'
}

function backToStart() {
  screen.value = 'start'
}

provide('startGame', startGame)
provide('gameOver', gameOver)
provide('winGame', winGame)
provide('backToStart', backToStart)
</script>

<template>
  <Transition name="fade" mode="out-in">
    <StartScreen v-if="screen === 'start'" key="start" />
    <GameScreen v-else-if="screen === 'game'" key="game" />
    <GameOverScreen v-else-if="screen === 'gameover'" key="over" />
    <WinScreen v-else-if="screen === 'win'" key="win" />
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
