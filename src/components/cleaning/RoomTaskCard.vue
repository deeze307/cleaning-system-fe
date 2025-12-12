<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useRoomsStore } from '@/stores/rooms'
import { TaskStatus } from '@/types/task.types'
import type { Task } from '@/types'

interface Props {
  task: Task
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()
const roomsStore = useRoomsStore()

const showDetails = ref(false)
const isStarting = ref(false)
const isCompleting = ref(false)

const room = computed(() => {
  return roomsStore.rooms.find(r => r.id === props.task.roomId)
})

// Helper para formatear la configuración de camas de forma legible
const bedConfigurationText = computed(() => {
  if (!room.value?.bedConfiguration) return null
  
  try {
    // Si es un objeto JSON, parsearlo
    const config = typeof room.value.bedConfiguration === 'string' 
      ? JSON.parse(room.value.bedConfiguration)
      : room.value.bedConfiguration
    
    const beds = []
    
    if (config.kingBeds && config.kingBeds > 0) {
      beds.push(`${config.kingBeds} cama${config.kingBeds > 1 ? 's' : ''} king`)
    }
    if (config.queenBeds && config.queenBeds > 0) {
      beds.push(`${config.queenBeds} cama${config.queenBeds > 1 ? 's' : ''} queen`)
    }
    if (config.doubleBeds && config.doubleBeds > 0) {
      beds.push(`${config.doubleBeds} cama${config.doubleBeds > 1 ? 's' : ''} doble${config.doubleBeds > 1 ? 's' : ''}`)
    }
    if (config.singleBeds && config.singleBeds > 0) {
      beds.push(`${config.singleBeds} cama${config.singleBeds > 1 ? 's' : ''} simple${config.singleBeds > 1 ? 's' : ''}`)
    }
    if (config.individualBeds && config.individualBeds > 0) {
      beds.push(`${config.individualBeds} cama${config.individualBeds > 1 ? 's' : ''} individual${config.individualBeds > 1 ? 'es' : ''}`)
    }
    
    return beds.length > 0 ? beds.join(', ') : 'Sin especificar'
  } catch (error) {
    // Si no es JSON válido, retornar el texto tal cual
    return room.value.bedConfiguration
  }
})

const statusConfig = computed(() => {
  const configs = {
    [TaskStatus.TO_CLEAN]: {
      bg: 'bg-gray-400',
      text: 'LIMPIAR',
      color: 'text-white'
    },
    [TaskStatus.TO_CLEAN_URGENT]: {
      bg: 'bg-red-400',
      text: 'LIMPIAR URGENTE',
      color: 'text-white'
    },
    [TaskStatus.IN_PROGRESS]: {
      bg: 'bg-sky-400',
      text: 'EN PROCESO',
      color: 'text-white'
    },
    [TaskStatus.COMPLETED]: {
      bg: 'bg-green-500',
      text: 'LIMPIO',
      color: 'text-white'
    },
    [TaskStatus.VERIFIED]: {
      bg: 'bg-purple-500',
      text: 'VERIFICADA',
      color: 'text-white'
    }
  }
  
  return configs[props.task.status]
})

const startTask = async () => {
  isStarting.value = true
  try {
    const success = await tasksStore.startTask(props.task.id)
    if (success) {
      emit('refresh')
    }
  } finally {
    isStarting.value = false
  }
}

const completeTask = async () => {
  isCompleting.value = true
  try {
    const success = await tasksStore.completeTask(props.task.id, props.task.observations)
    if (success) {
      emit('refresh')
    }
  } finally {
    isCompleting.value = false
  }
}
</script>

<template>
  <div class="bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <!-- Status badge -->
    <div
      :class="[statusConfig.bg, statusConfig.color]"
      class="px-3 py-2 rounded-t-lg text-center font-bold text-sm"
    >
      {{ statusConfig.text }}
    </div>

    <!-- Room info -->
    <div class="p-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="font-bold text-gray-800">{{ room?.name || 'N/A' }}</span>
      </div>

      <!-- Observaciones preview -->
      <p
        v-if="task.observations"
        class="text-xs text-gray-600 mb-2 text-center line-clamp-2"
      >
        <!-- {{ task.observations }} -->
          🗒️☑️
      </p>

      <!-- Acciones -->
      <div class="space-y-1">
        <button
          v-if="task.status === TaskStatus.TO_CLEAN || task.status === TaskStatus.TO_CLEAN_URGENT"
          @click="startTask"
          :disabled="isStarting"
          class="w-full py-2 px-3 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="isStarting"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isStarting ? 'Iniciando...' : 'Iniciar' }}</span>
        </button>

        <button
          v-if="task.status === TaskStatus.IN_PROGRESS"
          @click="completeTask"
          :disabled="isCompleting"
          class="w-full py-2 px-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="isCompleting"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isCompleting ? 'Completando...' : 'Marcar Limpio' }}</span>
        </button>

        <button
          @click="showDetails = !showDetails"
          :disabled="isStarting || isCompleting"
          class="w-full py-1 px-3 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ showDetails ? '▲ Ocultar' : '▼ Ver más' }}
        </button>
      </div>

      <!-- Detalles expandibles -->
      <div v-if="showDetails" class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
        <div v-if="task.observations">
          <strong class="text-gray-700">Observaciones:</strong>
          <p class="mt-1">{{ task.observations }}</p>
        </div>
        <div v-if="bedConfigurationText">
          <strong class="text-gray-700">Configuración:</strong>
          <p class="mt-1">{{ bedConfigurationText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>