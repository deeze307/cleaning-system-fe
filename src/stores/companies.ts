import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import type { Company, CreateCompanyData, UpdateCompanyData } from '@/types/company.types'

const toast = useToast()



export const useCompaniesStore = defineStore('companies', () => {
  // Estado
  const companies = ref<Company[]>([])
  const currentCompany = ref<Company | null>(null)
  const isLoading = ref(false)

  // Acciones
  const fetchCompanies = async () => {
    try {
      isLoading.value = true
      const response = await api.get('/companies')
      companies.value = response.data?.companies
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchCompanyById = async (id: string) => {
    try {
      isLoading.value = true
      const response = await api.get(`/companies/${id}`)
      currentCompany.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching company:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createCompany = async (data: CreateCompanyData) => {
    try {
      isLoading.value = true
      const response = await api.post('/companies', data)
      
      companies.value.push(response.data)
      toast.success('Empresa creada exitosamente')
      
      return response.data
    } catch (error) {
      console.error('Error creating company:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateCompany = async (id: string, data: UpdateCompanyData) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/companies/${id}`, data)
      
      // Actualizar en la lista
      const index = companies.value.findIndex(c => c.id === id)
      if (index !== -1) {
        companies.value[index] = response.data
      }
      
      // Actualizar empresa actual si es la misma
      if (currentCompany.value?.id === id) {
        currentCompany.value = response.data
      }
      
      toast.success('Empresa actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error updating company:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      isLoading.value = true
      await api.delete(`/companies/${id}`)
      
      // Remover de la lista
      companies.value = companies.value.filter(c => c.id !== id)
      
      // Limpiar empresa actual si es la misma
      if (currentCompany.value?.id === id) {
        currentCompany.value = null
      }
      
      toast.success('Empresa eliminada exitosamente')
      return true
    } catch (error) {
      console.error('Error deleting company:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getActiveCompanies = () => {
    return companies.value.filter(company => company.isActive)
  }

  const getPlanDisplayName = (plan: string) => {
    const planNames = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Empresarial'
    }
    return planNames[plan as keyof typeof planNames] || plan
  }

  return {
    // Estado
    companies,
    currentCompany,
    isLoading,
    
    // Acciones
    fetchCompanies,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getActiveCompanies,
    getPlanDisplayName
  }
})