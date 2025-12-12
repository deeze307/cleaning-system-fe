import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import type { Room, CreateRoomData, UpdateRoomData } from '@/types/room.types'

const toast = useToast()

export const useRoomsStore = defineStore('rooms', () => {
  // Estado
  const rooms = ref<Room[]>([])
  const currentRoom = ref<Room | null>(null)
  const isLoading = ref(false)

  // Acciones
  const fetchRooms = async (buildingId?: string) => {
    try {
      isLoading.value = true
      const params = buildingId ? { buildingId } : {}
      const response = await api.get('/rooms', { params })
      rooms.value = response.data?.rooms
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchRoomById = async (id: string) => {
    try {
      isLoading.value = true
      const response = await api.get(`/rooms/${id}`)
      currentRoom.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching room:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createRoom = async (data: CreateRoomData) => {
    try {
      isLoading.value = true
      const response = await api.post('/rooms', data)
      
      rooms.value.push(response.data)
      toast.success('Habitación creada exitosamente')
      
      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateRoom = async (id: string, data: UpdateRoomData) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/rooms/${id}`, data)
      
      // Actualizar en la lista
      const index = rooms.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rooms.value[index] = response.data
      }
      
      // Actualizar room actual si es el mismo
      if (currentRoom.value?.id === id) {
        currentRoom.value = response.data
      }
      
      toast.success('Habitación actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteRoom = async (id: string) => {
    try {
      isLoading.value = true
      await api.delete(`/rooms/${id}`)
      
      // Remover de la lista
      rooms.value = rooms.value.filter(r => r.id !== id)
      
      // Limpiar room actual si es el mismo
      if (currentRoom.value?.id === id) {
        currentRoom.value = null
      }
      
      toast.success('Habitación eliminada exitosamente')
      return true
    } catch (error) {
      console.error('Error deleting room:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getActiveRooms = () => {
    return rooms.value.filter(room => room.isActive)
  }

  const getTotalBeds = (room: Room) => {
    return room.bedConfiguration.kingBeds + room.bedConfiguration.individualBeds
  }

  return {
    // Estado
    rooms,
    currentRoom,
    isLoading,
    
    // Acciones
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getActiveRooms,
    getTotalBeds
  }
})