<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useRoomsStore } from '@/stores/rooms'
import { useUsersStore } from '@/stores/users'
import TaskDetailModal from '@/components/tasks/TaskDetailModal.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge.vue'
import { TaskStatus, TASK_STATUS_LABELS } from '@/types/task.types'
import { Role as USER_ROLES } from '@/types/role.types'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task.types'

const tasksStore = useTasksStore()
const roomsStore = useRoomsStore()
const usersStore = useUsersStore()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedTask = ref<Task | null>(null)

const filters = ref({
  roomId: '',
  assignedTo: '',
  status: '',
  scheduledDate: ''
})

onMounted(async () => {
  await Promise.all([
    roomsStore.fetchRooms(),
    usersStore.fetchUsers(),
    applyFilters()
  ])
})

const cleaners = computed(() => 
  usersStore.users.filter(user => user.role === USER_ROLES.CLEANER)
)

const applyFilters = async () => {
  const activeFilters: Record<string, string> = {}
  
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value) {
      activeFilters[key] = value
    }
  })
  
  await tasksStore.fetchTasks(activeFilters)
}

const clearFilters = () => {
  filters.value = {
    roomId: '',
    assignedTo: '',
    status: '',
    scheduledDate: ''
  }
  applyFilters()
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const openDetailModal = (task: Task) => {
  selectedTask.value = task
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTask.value = null
}

const handleCreate = async (data: CreateTaskData | UpdateTaskData) => {
  // Como estamos en modo crear, sabemos que tiene roomId
  const success = await tasksStore.createTask(data as CreateTaskData)
  if (success) {
    closeCreateModal()
    await applyFilters()
  }
}

const handleUpdate = async (taskId: string, data: UpdateTaskData) => {
  const success = await tasksStore.updateTask(taskId, data)
  if (success) {
    await applyFilters()
    // Actualizar la tarea seleccionada
    const updatedTask = tasksStore.tasks.find(t => t.id === taskId)
    if (updatedTask) {
      selectedTask.value = updatedTask
    }
  }
}

const handleDelete = async (taskId: string) => {
  const success = await tasksStore.deleteTask(taskId)
  if (success) {
    closeDetailModal()
    await applyFilters()
  }
}

const handleChangeStatus = async (taskId: string, status: string) => {
  const success = await tasksStore.updateTask(taskId, { status: status as TaskStatus })
  if (success) {
    await applyFilters()
    // Actualizar la tarea seleccionada
    const updatedTask = tasksStore.tasks.find(t => t.id === taskId)
    if (updatedTask) {
      selectedTask.value = updatedTask
    }
  }
}

const getRoomNumber = (roomId: string) => {
  const room = roomsStore.rooms.find(r => r.id === roomId)
  return room?.name || 'N/A'
}

const getCleanerName = (userId: string | undefined) => {
  const user = cleaners.value.find(u => u.id === userId)
  return user?.name || 'N/A'
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Tareas de Limpieza</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        + Nueva Tarea
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Filtro por habitación -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Habitación
          </label>
          <select
            v-model="filters.roomId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas</option>
            <option v-for="room in roomsStore.rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>

        <!-- Filtro por personal -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Personal
          </label>
          <select
            v-model="filters.assignedTo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos</option>
            <option v-for="cleaner in cleaners" :key="cleaner.id" :value="cleaner.id">
              {{ cleaner.name }}
            </option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos</option>
            <option
              v-for="(label, value) in TASK_STATUS_LABELS"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Filtro por fecha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            v-model="filters.scheduledDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <!-- Botones de filtros -->
      <div class="flex gap-2 mt-4">
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Aplicar Filtros
        </button>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="tasksStore.isLoading" class="text-center py-8">
      <p class="text-gray-600">Cargando tareas...</p>
    </div>

    <!-- Tabla de tareas -->
    <div v-else-if="tasksStore.tasks.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Habitación
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asignado a
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="task in tasksStore.tasks"
            :key="task.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="openDetailModal(task)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ getRoomNumber(task.roomId) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ getCleanerName(task.assignedTo) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(task.scheduledDate).toLocaleDateString('es-AR') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <TaskStatusBadge :status="task.status" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                @click.stop="openDetailModal(task)"
                class="text-blue-600 hover:text-blue-900"
              >
                Ver detalle →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600">No hay tareas que coincidan con los filtros</p>
    </div>

    <!-- Modal crear tarea -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeCreateModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Nueva Tarea</h2>
        <TaskForm
          :rooms="roomsStore.rooms"
          :cleaners="cleaners"
          @submit="handleCreate"
          @cancel="closeCreateModal"
        />
      </div>
    </div>

    <!-- Modal detalle tarea -->
    <TaskDetailModal
      :task="selectedTask"
      :rooms="roomsStore.rooms"
      :cleaners="cleaners"
      :show="showDetailModal"
      @close="closeDetailModal"
      @update="handleUpdate"
      @delete="handleDelete"
      @change-status="handleChangeStatus"
    />
  </div>
</template>