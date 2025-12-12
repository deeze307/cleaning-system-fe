import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import type { User, CreateUserData, UpdateUserData } from '@/types/user.types'

const toast = useToast()

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  const fetchUsers = async (companyId?: string) => {
    try {
      isLoading.value = true
      const params = companyId ? { companyId } : {}
      const response = await api.get('/users', { params })
      users.value = response.data
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserById = async (id: string) => {
    try {
      isLoading.value = true
      const response = await api.get(`/users/${id}`)
      currentUser.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (data: CreateUserData) => {
    try {
      isLoading.value = true
      const { isActive, ...registerData } = data
      const response = await api.post('/auth/register', registerData)
      
      toast.success('Usuario creado exitosamente')
      
      await fetchUsers()
      
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: string, data: UpdateUserData) => {
    try {
      isLoading.value = true
      const response = await api.patch(`/users/${id}`, data)
      
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      
      toast.success('Usuario actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      isLoading.value = true
      await api.delete(`/users/${id}`)
      
      users.value = users.value.filter(u => u.id !== id)
      
      toast.success('Usuario eliminado exitosamente')
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getActiveUsers = () => {
    return users.value.filter(user => user.isActive)
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: 'Super Admin',
      admin: 'Administrador',
      cleaner: 'Limpieza'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return {
    users,
    currentUser,
    isLoading,
    
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    getActiveUsers,
    getRoleDisplayName
  }
})