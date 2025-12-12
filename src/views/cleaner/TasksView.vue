<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useRoomsStore } from '@/stores/rooms'
import { useAuthStore } from '@/stores/auth'
import WeeklyCalendar from '@/components/cleaning/WeeklyCalendar.vue'
import MobileTaskList from '@/components/cleaning/MobileTaskList.vue'

const tasksStore = useTasksStore()
const roomsStore = useRoomsStore()
const authStore = useAuthStore()

const currentWeekStart = ref(new Date())
const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)

onMounted(async () => {
  console.log('cargando...')
  loading.value = true
  
  // Obtener el inicio de la semana actual (lunes)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Si es domingo, retrocede 6 días
  currentWeekStart.value = new Date(today.setDate(today.getDate() + diff))
  currentWeekStart.value.setHours(0, 0, 0, 0)

  // Cargar habitaciones y tareas
  await roomsStore.fetchRooms()
  await loadMyTasks()
  
  console.log('fin de carga.')
  loading.value = false
})

const loadMyTasks = async () => {
  if (authStore.user) {
    await tasksStore.fetchTasks({ assignedTo: authStore.user.id })
  }
}

const goToPreviousWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
  loadMyTasks()
}

const goToNextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
  loadMyTasks()
}

const goToCurrentWeek = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  currentWeekStart.value = new Date(today.setDate(today.getDate() + diff))
  currentWeekStart.value.setHours(0, 0, 0, 0)
  loadMyTasks()
}

const weekRange = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 6)
  
  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = start.toLocaleDateString('es-AR', { month: 'long' })
  const year = start.getFullYear()
  
  return `Semana del ${startDay} al ${endDay} de ${month}, ${year}`
})

const tasksCount = computed(() => {
  return {
    total: tasksStore.tasks.length,
    toClean: tasksStore.tasks.filter(t => t.status === 'to_clean' || t.status === 'to_clean_urgent').length,
    inProgress: tasksStore.tasks.filter(t => t.status === 'in_progress').length,
    completed: tasksStore.tasks.filter(t => t.status === 'completed').length
  }
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Stats bar -->
    <div class="bg-white shadow-md border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-orange-600">{{ tasksCount.total }}</div>
            <div class="text-xs text-gray-600">Total Tareas</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-600">{{ tasksCount.toClean }}</div>
            <div class="text-xs text-gray-600">Pendientes</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ tasksCount.inProgress }}</div>
            <div class="text-xs text-gray-600">En Proceso</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ tasksCount.completed }}</div>
            <div class="text-xs text-gray-600">Completadas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div v-if="!isMobile" class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          @click="goToPreviousWeek"
          class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Semana anterior
        </button>

        <div class="flex items-center gap-3">
          <button
            @click="goToCurrentWeek"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            📅 Hoy
          </button>
          <h2 class="text-xl md:text-2xl font-bold text-gray-600">
            {{ weekRange }}
          </h2>
        </div>

        <button
          @click="goToNextWeek"
          class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Semana siguiente
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-12 text-center">
      <div class="text-gray-600 text-xl">Cargando tareas...</div>
    </div>

    <!-- Vista Mobile -->
    <div v-else-if="isMobile">
      <MobileTaskList
        :tasks="tasksStore.tasks"
        @refresh="loadMyTasks"
      />
    </div>

    <!-- Vista Desktop - Calendar -->
    <div v-else class="max-w-7xl mx-auto p-1">
      <WeeklyCalendar
        :week-start="currentWeekStart"
        :tasks="tasksStore.tasks"
        @refresh="loadMyTasks"
      />
    </div>
  </div>
</template>