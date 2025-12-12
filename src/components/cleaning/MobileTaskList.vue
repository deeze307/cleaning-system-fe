<script setup lang="ts">
import { ref, computed } from 'vue'
import RoomTaskCard from '@/components/cleaning/RoomTaskCard.vue'
import type { Task } from '@/types/index'
import { TaskStatus } from '@/types/task.types'

interface Props {
  tasks: Task[]
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedDay = ref<'today' | 'tomorrow' | 'week'>('today')

const today = new Date()
today.setHours(0, 0, 0, 0)

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const filteredTasks = computed(() => {
  return props.tasks.filter(task => {
    const taskDate = new Date(task.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    
    if (selectedDay.value === 'today') {
      return taskDate.getTime() === today.getTime()
    } else if (selectedDay.value === 'tomorrow') {
      return taskDate.getTime() === tomorrow.getTime()
    } else {
      // Mostrar toda la semana
      return true
    }
  })
})

const todayTasksCount = computed(() => {
  return props.tasks.filter(task => {
    const taskDate = new Date(task.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime()
  }).length
})

const tomorrowTasksCount = computed(() => {
  return props.tasks.filter(task => {
    const taskDate = new Date(task.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === tomorrow.getTime()
  }).length
})

const tasksByStatus = computed(() => {
  return {
    toClean: filteredTasks.value.filter(t => t.status === TaskStatus.TO_CLEAN || t.status === TaskStatus.TO_CLEAN_URGENT),
    inProgress: filteredTasks.value.filter(t => t.status === TaskStatus.IN_PROGRESS),
    completed: filteredTasks.value.filter(t => t.status === TaskStatus.COMPLETED),
    verified: filteredTasks.value.filter(t => t.status === TaskStatus.VERIFIED)
  }
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <!-- Tabs de filtro por día -->
    <div class="bg-white shadow-md sticky top-0 z-10">
      <div class="flex overflow-x-auto">
        <button
          @click="selectedDay = 'today'"
          :class="[
            'flex-1 min-w-[120px] py-4 px-4 text-center font-semibold border-b-4 transition-colors',
            selectedDay === 'today'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50'
          ]"
        >
          <div class="text-2xl mb-1">📅</div>
          <div class="text-sm">Hoy</div>
          <div class="text-xs text-gray-500">{{ todayTasksCount }} tareas</div>
        </button>

        <button
          @click="selectedDay = 'tomorrow'"
          :class="[
            'flex-1 min-w-[120px] py-4 px-4 text-center font-semibold border-b-4 transition-colors',
            selectedDay === 'tomorrow'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50'
          ]"
        >
          <div class="text-2xl mb-1">🌅</div>
          <div class="text-sm">Mañana</div>
          <div class="text-xs text-gray-500">{{ tomorrowTasksCount }} tareas</div>
        </button>

        <button
          @click="selectedDay = 'week'"
          :class="[
            'flex-1 min-w-[120px] py-4 px-4 text-center font-semibold border-b-4 transition-colors',
            selectedDay === 'week'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50'
          ]"
        >
          <div class="text-2xl mb-1">📆</div>
          <div class="text-sm">Semana</div>
          <div class="text-xs text-gray-500">{{ props.tasks.length }} tareas</div>
        </button>
      </div>
    </div>

    <!-- Lista de tareas -->
    <div class="px-4 py-4 space-y-4">
      <!-- Pendientes -->
      <div v-if="tasksByStatus.toClean.length > 0">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
          <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
          Pendientes ({{ tasksByStatus.toClean.length }})
        </h3>
        <div class="space-y-3">
          <RoomTaskCard
            v-for="task in tasksByStatus.toClean"
            :key="task.id"
            :task="task"
            @refresh="emit('refresh')"
          />
        </div>
      </div>

      <!-- En Progreso -->
      <div v-if="tasksByStatus.inProgress.length > 0">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          En Progreso ({{ tasksByStatus.inProgress.length }})
        </h3>
        <div class="space-y-3">
          <RoomTaskCard
            v-for="task in tasksByStatus.inProgress"
            :key="task.id"
            :task="task"
            @refresh="emit('refresh')"
          />
        </div>
      </div>

      <!-- Completadas -->
      <div v-if="tasksByStatus.completed.length > 0">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          Completadas ({{ tasksByStatus.completed.length }})
        </h3>
        <div class="space-y-3">
          <RoomTaskCard
            v-for="task in tasksByStatus.completed"
            :key="task.id"
            :task="task"
            @refresh="emit('refresh')"
          />
        </div>
      </div>

      <!-- Verificadas -->
      <div v-if="tasksByStatus.verified.length > 0">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
          <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
          Verificadas ({{ tasksByStatus.verified.length }})
        </h3>
        <div class="space-y-3">
          <RoomTaskCard
            v-for="task in tasksByStatus.verified"
            :key="task.id"
            :task="task"
            @refresh="emit('refresh')"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredTasks.length === 0"
        class="text-center py-12"
      >
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-500 text-lg font-medium">¡Sin tareas!</p>
        <p class="text-gray-400 text-sm mt-1">
          No hay tareas programadas para 
          {{ selectedDay === 'today' ? 'hoy' : selectedDay === 'tomorrow' ? 'mañana' : 'esta semana' }}
        </p>
      </div>
    </div>
  </div>
</template>