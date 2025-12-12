<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { TaskStatus, TASK_STATUS_LABELS } from '@/types/task.types'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task.types'
import type { Room } from '@/types/room.types'
import type { User } from '@/types/user.types'

interface Props {
  rooms: Room[]
  cleaners: User[]
  editingTask?: Task | null
  isEditMode?: boolean
}

interface Emits {
  (e: 'submit', data: CreateTaskData | UpdateTaskData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingTask: null,
  isEditMode: false
})

const emit = defineEmits<Emits>()

const isUrgent = ref(false)  // Control del checkbox

const form = ref({
  roomId: '',
  assignedTo: '',
  scheduledDate: '',
  status: TaskStatus.TO_CLEAN,
  observations: ''
})

// Computed para determinar el status según el checkbox
const taskStatus = computed(() => {
  return isUrgent.value ? TaskStatus.TO_CLEAN_URGENT : TaskStatus.TO_CLEAN
})

const resetForm = () => {
  form.value = {
    roomId: '',
    assignedTo: '',
    scheduledDate: '',
    status: TaskStatus.TO_CLEAN,
    observations: ''
  }
  isUrgent.value = false
}

// Cuando cambia la tarea en edición, actualizar el formulario
watch(() => props.editingTask, (task) => {
  if (task && props.isEditMode) {
    form.value = {
      roomId: task.roomId || '',
      assignedTo: task.assignedTo || '',
      scheduledDate: task.scheduledDate || '',
      status: task.status || TaskStatus.TO_CLEAN,
      observations: task.observations || ''
    }
    // Determinar si es urgente basándose en el status
    isUrgent.value = task.status === TaskStatus.TO_CLEAN_URGENT
  } else {
    resetForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  if (props.isEditMode) {
    const { roomId, ...updateData } = form.value
    emit('submit', updateData)
  } else {
    // En modo creación, usar el status computed
    const { status, ...createData } = form.value
    emit('submit', {
      ...createData,
      status: taskStatus.value  // Usa TO_CLEAN o TO_CLEAN_URGENT
    })
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Habitación -->
    <div>
      <label for="roomId" class="block text-sm font-medium text-gray-700 mb-1">
        Habitación
      </label>
      <select
        id="roomId"
        v-model="form.roomId"
        required
        :disabled="isEditMode"
        class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Seleccionar habitación</option>
        <option v-for="room in rooms" :key="room.id" :value="room.id">
          {{ room.name }}
        </option>
      </select>
    </div>

    <!-- Asignado a -->
    <div>
      <label for="assignedTo" class="block text-sm font-medium text-gray-700 mb-1">
        Asignado a
      </label>
      <select
        id="assignedTo"
        v-model="form.assignedTo"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">Seleccionar personal</option>
        <option v-for="cleaner in cleaners" :key="cleaner.id" :value="cleaner.id">
          {{ cleaner.name }}
        </option>
      </select>
    </div>

    <!-- Fecha programada -->
    <div>
      <label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
        Fecha programada
      </label>
      <input
        id="scheduledDate"
        v-model="form.scheduledDate"
        type="date"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>

    <!-- Checkbox Urgente (solo en modo creación) -->
    <div v-if="!isEditMode" class="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-md">
      <input
        id="isUrgent"
        v-model="isUrgent"
        type="checkbox"
        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
      />
      <label for="isUrgent" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
        <span class="flex items-center gap-2">
          <span>⚠️ Marcar como limpieza urgente</span>
          <span 
            v-if="isUrgent" 
            class="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse"
          >
            URGENTE
          </span>
        </span>
      </label>
    </div>

    <!-- Estado (solo en modo edición) -->
    <div v-if="isEditMode">
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
        Estado
      </label>
      <select
        id="status"
        v-model="form.status"
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option
          v-for="(label, value) in TASK_STATUS_LABELS"
          :key="value"
          :value="value"
        >
          {{ label }}
        </option>
      </select>
    </div>

    <!-- Observaciones -->
    <div>
      <label for="observations" class="block text-sm font-medium text-gray-700 mb-1">
        Observaciones
      </label>
      <textarea
        id="observations"
        v-model="form.observations"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="Detalles adicionales sobre la tarea..."
      />
    </div>

    <!-- Preview del estado que se creará -->
    <div v-if="!isEditMode" class="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <p class="text-sm text-gray-700">
        <strong>Estado inicial:</strong> 
        <span :class="isUrgent ? 'text-red-600 font-bold' : 'text-blue-600'">
          {{ isUrgent ? '⚠️ A LIMPIAR URGENTE' : 'Por limpiar' }}
        </span>
      </p>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-2 pt-4">
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        {{ isEditMode ? 'Actualizar' : 'Crear' }} Tarea
      </button>
    </div>
  </form>
</template>