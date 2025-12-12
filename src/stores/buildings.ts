import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import type { Building, CreateBuildingData, UpdateBuildingData } from '@/types/building.types'

const toast = useToast()

export const useBuildingsStore = defineStore('buildings', () => {
  // Estado
  const buildings = ref<Building[]>([])
  const currentBuilding = ref<Building | null>(null)
  const isLoading = ref(false)

  // Acciones
  const fetchBuildings = async (companyId?: string) => {
    try {
      isLoading.value = true
      const params = companyId ? { companyId } : {}
      const response = await api.get('/buildings', { params })
      buildings.value = response.data?.buildings
    } catch (error) {
      console.error('Error fetching buildings:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBuildingById = async (id: string) => {
    try {
      isLoading.value = true
      const response = await api.get(`/buildings/${id}`)
      currentBuilding.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching building:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createBuilding = async (data: CreateBuildingData) => {
    try {
      isLoading.value = true
      const response = await api.post('/buildings', data)
      
      buildings.value.push(response.data)
      toast.success('Edificio creado exitosamente')
      
      return response.data
    } catch (error) {
      console.error('Error creating building:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateBuilding = async (id: string, data: UpdateBuildingData) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/buildings/${id}`, data)
      
      // Actualizar en la lista
      const index = buildings.value.findIndex(b => b.id === id)
      if (index !== -1) {
        buildings.value[index] = response.data
      }
      
      // Actualizar building actual si es el mismo
      if (currentBuilding.value?.id === id) {
        currentBuilding.value = response.data
      }
      
      toast.success('Edificio actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error updating building:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteBuilding = async (id: string) => {
    try {
      isLoading.value = true
      await api.delete(`/buildings/${id}`)
      
      // Remover de la lista
      buildings.value = buildings.value.filter(b => b.id !== id)
      
      // Limpiar building actual si es el mismo
      if (currentBuilding.value?.id === id) {
        currentBuilding.value = null
      }
      
      toast.success('Edificio eliminado exitosamente')
      return true
    } catch (error) {
      console.error('Error deleting building:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getActiveBuildings = () => {
    return buildings.value.filter(building => building.isActive)
  }

  const getTypeDisplayName = (type: string) => {
    const typeNames = {
      hotel: 'Hotel',
      apartment: 'Departamento',
      house: 'Casa'
    }
    return typeNames[type as keyof typeof typeNames] || type
  }

  return {
    // Estado
    buildings,
    currentBuilding,
    isLoading,
    
    // Acciones
    fetchBuildings,
    fetchBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    getActiveBuildings,
    getTypeDisplayName
  }
})