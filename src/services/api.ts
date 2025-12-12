import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Configuración base de Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          authStore.logout()
          break
        case 403:
          toast.error('No tenés permisos para realizar esta acción.')
          break
        case 404:
          toast.error('Recurso no encontrado.')
          break
        case 422:
          // Errores de validación
          if (data.message && Array.isArray(data.message)) {
            data.message.forEach((msg: string) => toast.error(msg))
          } else {
            toast.error(data.message || 'Error de validación.')
          }
          break
        case 500:
          toast.error('Error interno del servidor. Intentá nuevamente.')
          break
        default:
          toast.error(data.message || 'Ocurrió un error inesperado.')
      }
    } else if (error.request) {
      toast.error('No se pudo conectar con el servidor. Verificá tu conexión.')
    } else {
      toast.error('Error inesperado.')
    }

    return Promise.reject(error)
  }
)

export default api