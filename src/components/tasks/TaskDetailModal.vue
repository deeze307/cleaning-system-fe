<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskForm from './TaskForm.vue'
import { TaskStatus } from '@/types/task.types'
import type { Task, UpdateTaskData } from '@/types/task.types'
import type { Room } from '@/types/room.types'
import type { User } from '@/types/user.types'

interface Props {
  task: Task | null
  rooms: Room[]
  cleaners: User[]
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'update', taskId: string, data: UpdateTaskData): void
  (e: 'delete', taskId: string): void
  (e: 'changeStatus', taskId: string, status: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditMode = ref(false)

// Computed properties para mostrar info legible
const roomNumber = computed(() => {
  if (!props.task) return ''
  const room = props.rooms.find(r => r.id === props.task!.roomId)
  return room?.name || 'N/A'
})

const assignedUserName = computed(() => {
  if (!props.task) return ''
  const user = props.cleaners.find(u => u.id === props.task!.assignedTo)
  return user?.name || 'N/A'
})

const formattedDate = computed(() => {
  if (!props.task?.scheduledDate) return ''
  const date = new Date(props.task.scheduledDate)
  return date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const canStartTask = computed(() => {
  return props.task?.status === TaskStatus.PENDING
})

const canCompleteTask = computed(() => {
  return props.task?.status === TaskStatus.IN_PROGRESS
})

const canVerifyTask = computed(() => {
  return props.task?.status === TaskStatus.COMPLETED
})

const handleClose = () => {
  isEditMode.value = false
  emit('close')
}

const handleUpdate = (data: UpdateTaskData) => {
  if (props.task) {
    emit('update', props.task.id, data)
    isEditMode.value = false
  }
}

const handleDelete = () => {
  if (props.task && confirm('¿Estás seguro de eliminar esta tarea?')) {
    emit('delete', props.task.id)
  }
}

const handleStartTask = () => {
  if (props.task) {
    emit('changeStatus', props.task.id, TaskStatus.IN_PROGRESS)
  }
}

const handleCompleteTask = () => {
  if (props.task) {
    emit('changeStatus', props.task.id, TaskStatus.COMPLETED)
  }
}

const handleVerifyTask = () => {
  if (props.task) {
    emit('changeStatus', props.task.id, TaskStatus.VERIFIED)
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}
</script>

<template>
  <!-- Overlay -->
  <div
    v-if="show && task"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ roomNumber }}
          </h2>
          <TaskStatusBadge :status="task.status" />
        </div>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Modo vista -->
        <div v-if="!isEditMode" class="space-y-6">
          <!-- Info básica -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Asignado a</p>
              <p class="mt-1 text-base text-gray-900">{{ assignedUserName }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Fecha programada</p>
              <p class="mt-1 text-base text-gray-900">{{ new Date(task.scheduledDate).toLocaleDateString('es-AR') }}</p>
            </div>
          </div>

          <!-- Observaciones -->
          <div>
            <p class="text-sm font-medium text-gray-500">Observaciones</p>
            <p class="mt-1 text-base text-gray-900 whitespace-pre-wrap">
              {{ task.observations || 'Sin observaciones' }}
            </p>
          </div>

          <!-- Fechas del sistema -->
          <div v-if="task.createdAt || task.updatedAt" class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div v-if="task.createdAt">
              <p class="text-sm font-medium text-gray-500">Creada el</p>
              <p class="mt-1 text-sm text-gray-600">
                {{ new Date(task.createdAt).toLocaleDateString('es-AR') }}
              </p>
            </div>
            <div v-if="task.updatedAt">
              <p class="text-sm font-medium text-gray-500">Última actualización</p>
              <p class="mt-1 text-sm text-gray-600">
                {{ new Date(task.updatedAt).toLocaleDateString('es-AR') }}
              </p>
            </div>
          </div>

          <!-- Acciones rápidas de estado -->
          <div class="flex gap-2 pt-4 border-t border-gray-200">
            <button
              v-if="canStartTask"
              @click="handleStartTask"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              🚀 Iniciar tarea
            </button>

            <button
              v-if="canCompleteTask"
              @click="handleCompleteTask"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              ✅ Marcar completada
            </button>

            <button
              v-if="canVerifyTask"
              @click="handleVerifyTask"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              ✓ Verificar tarea
            </button>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-2 pt-2">
            <button
              @click="toggleEditMode"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ✏️ Editar
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>

        <!-- Modo edición -->
        <div v-else>
          <TaskForm
            :rooms="rooms"
            :cleaners="cleaners"
            :editing-task="task"
            :is-edit-mode="true"
            @submit="handleUpdate"
            @cancel="toggleEditMode"
          />
        </div>
      </div>
    </div>
  </div>
</template>