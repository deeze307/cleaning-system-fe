import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { type Task, type CreateTaskData, type UpdateTaskData, type TaskWithDetails, TaskStatus } from '@/types/task.types'

const toast = useToast()

export const useTasksStore = defineStore('tasks', () => {
  // Estado
  const tasks = ref<TaskWithDetails[]>([])
  const currentTask = ref<TaskWithDetails | null>(null)
  const isLoading = ref(false)

  // Acciones
  const fetchTasks = async (filters?: {
    roomId?: string
    buildingId?: string
    assignedTo?: string
    status?: string
  }) => {
    try {
      isLoading.value = true
      const response = await api.get('/tasks', { params: filters })
      tasks.value = response.data?.tasks
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchTaskById = async (id: string) => {
    try {
      isLoading.value = true
      const response = await api.get(`/tasks/${id}`)
      currentTask.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching task:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (data: CreateTaskData) => {
    try {
      isLoading.value = true
      const response = await api.post('/tasks', data)
      
      tasks.value.push(response.data)
      toast.success('Tarea creada exitosamente')
      
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (id: string, data: UpdateTaskData) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/tasks/${id}`, data)
      
      // Actualizar en la lista
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      
      // Actualizar task actual si es el mismo
      if (currentTask.value?.id === id) {
        currentTask.value = response.data
      }
      
      toast.success('Tarea actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error updating task:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    try {
      isLoading.value = true
      await api.delete(`/tasks/${id}`)
      
      // Remover de la lista
      tasks.value = tasks.value.filter(t => t.id !== id)
      
      // Limpiar task actual si es el mismo
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
      
      toast.success('Tarea eliminada exitosamente')
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const startTask = async (taskId: string) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/tasks/${taskId}/start`)
      return response.status === 200
    } catch (error) {
      console.error('Error starting task:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const completeTask = async (taskId: string, observations?: string, images?: string[]) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/tasks/${taskId}/complete`, {
        observations: observations || '',
        images: images || []
      })
      return response.status === 200
    } catch (error) {
      console.error('Error completing task:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const verifyTask = async (id: string) => {
    return updateTask(id, { status: TaskStatus.VERIFIED })
  }

  const getStatusDisplayName = (status: string) => {
    const statusNames = {
      to_clean: 'A Limpiar',
      to_clean_urgent: 'A Limpiar Urgente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      verified: 'Verificada'
    }
    return statusNames[status as keyof typeof statusNames] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      to_clean: 'bg-yellow-100 text-yellow-800',
      to_clean_urgent: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      verified: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPendingTasks = () => {
    return tasks.value.filter(task => task.status === TaskStatus.TO_CLEAN || task.status === TaskStatus.TO_CLEAN_URGENT)
  }

  const getMyTasks = (userId: string) => {
    return tasks.value.filter(task => task.assignedTo === userId)
  }

  return {
    // Estado
    tasks,
    currentTask,
    isLoading,
    
    // Acciones
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    completeTask,
    verifyTask,
    getStatusDisplayName,
    getStatusColor,
    getPendingTasks,
    getMyTasks
  }
})