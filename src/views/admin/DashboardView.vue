<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Bienvenido al sistema de gestión de limpieza</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Cards de estadísticas -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingOfficeIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Empresas
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalCompanies }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Usuarios
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalUsers }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <HomeModernIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Habitaciones
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalRooms }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClipboardDocumentListIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Tareas Pendientes
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.pendingTasks }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="mt-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Cargando estadísticas...</p>
    </div>

    <div v-else class="mt-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link
            v-if="authStore.isSuperAdmin"
            to="/admin/companies"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BuildingOfficeIcon class="h-8 w-8 text-blue-600 mb-2" />
            <h4 class="font-medium">Gestionar Empresas</h4>
            <p class="text-sm text-gray-600">Crear y administrar empresas</p>
          </router-link>

          <router-link
            to="/admin/users"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon class="h-8 w-8 text-green-600 mb-2" />
            <h4 class="font-medium">Gestionar Usuarios</h4>
            <p class="text-sm text-gray-600">Administrar usuarios del sistema</p>
          </router-link>

          <router-link
            to="/admin/tasks"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon class="h-8 w-8 text-purple-600 mb-2" />
            <h4 class="font-medium">Ver Tareas</h4>
            <p class="text-sm text-gray-600">Monitorear tareas de limpieza</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCompaniesStore } from '@/stores/companies'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import {
  BuildingOfficeIcon,
  UsersIcon,
  HomeModernIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import { useRoomsStore } from '@/stores/rooms'
import { useTasksStore } from '@/stores/tasks'

const companiesStore = useCompaniesStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const roomsStore = useRoomsStore()
const tasksStore = useTasksStore()

const isLoading = ref(false)
const stats = ref({
  totalCompanies: 0,
  totalUsers: 0,
  totalRooms: 0,
  pendingTasks: 0
})

const loadStats = async () => {
  isLoading.value = true
  try {
    // Cargar empresas activas
    await companiesStore.fetchCompanies()
    await usersStore.fetchUsers()
    await roomsStore.fetchRooms()
    await tasksStore.fetchTasks()
    stats.value.totalCompanies = companiesStore.getActiveCompanies()?.length
    stats.value.totalUsers = usersStore.getActiveUsers()?.length
    stats.value.totalRooms = roomsStore.getActiveRooms()?.length
    stats.value.pendingTasks = tasksStore.getPendingTasks().length
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>