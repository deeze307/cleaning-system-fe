import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import type { User } from '@/types/user.types'
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth.types'
import { Role } from '@/types/role.types'

const toast = useToast()

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // Estado
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  // Computadas
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === Role.ADMIN || user.value?.role === Role.SUPER_ADMIN)
  const isSuperAdmin = computed(() => user.value?.role === Role.SUPER_ADMIN)
  const isCleaner = computed(() => user.value?.role === Role.CLEANER)

  // Acciones
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      const response = await api.post('/auth/login', credentials)
      
      const { access_token, user: userData } = response.data
      
      token.value = access_token
      user.value = userData
      
      // Guardar en localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      toast.success(`¡Bienvenido/a, ${userData.name}!`)
      
      // Redirigir según el rol
      if (userData.role.includes('admin')) {
        router.push('/admin/dashboard')
      } else {
        router.push('/cleaner/tasks')
      }
      
    } catch (error: any) {
      console.error('Error en login:', error)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    try {
      isLoading.value = true
      await api.post('/auth/register', data)
      
      toast.success('Usuario registrado exitosamente. Podés iniciar sesión.')
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      // Los errores ya se manejan en el interceptor
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    
    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    toast.info('Sesión cerrada correctamente.')
    router.push('/login')
  }

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
      } catch (error) {
        console.error('Error parsing stored user:', error)
        logout()
      }
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/profile')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('Error getting current user:', error)
      logout()
    }
  }

  // Cargar usuario al inicializar
  if (token.value) {
    loadUserFromStorage()
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    
    // Computadas
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCleaner,
    
    // Acciones
    login,
    register,
    logout,
    getCurrentUser,
    loadUserFromStorage
  }
})