<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600">Administrá todos los usuarios del sistema</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
      >
        <PlusIcon class="h-5 w-5" />
        <span>Nuevo Usuario</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="filters.role"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Administrador</option>
            <option value="cleaner">Limpieza</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.isActive"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nombre o email..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="usersStore.isLoading && users.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando usuarios...</p>
    </div>

    <!-- Lista de usuarios -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="user in filteredUsers" :key="user.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <!-- Avatar -->
                <div class="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                
                <div class="ml-4 flex-1">
                  <div class="flex items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ user.name }}</h3>
                    <span
                      :class="[
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                        'ml-3 px-2 py-1 text-xs font-medium rounded-full'
                      ]"
                    >
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <p class="text-gray-600 mt-1">{{ user.email }}</p>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Rol: {{ usersStore.getRoleDisplayName(user.role) }}</span>
                    <span v-if="user.lastLoginAt">Último login: {{ formatDate(user.lastLoginAt) }}</span>
                    <span>Creado: {{ formatDate(user.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="openEditModal(user)"
                class="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                title="Editar usuario"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(user)"
                class="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                title="Eliminar usuario"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Empty state -->
      <div v-if="filteredUsers.length === 0 && !usersStore.isLoading" class="text-center py-12">
        <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p class="mt-1 text-sm text-gray-500">Comenzá creando tu primer usuario.</p>
        <button
          @click="openCreateModal"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <TransitionRoot :show="showModal" as="template">
      <Dialog as="div" class="relative z-10" @close="closeModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form @submit.prevent="handleSubmit">
                  <div>
                    <div class="text-center">
                      <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                        {{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
                      </DialogTitle>
                    </div>
                    
                    <div class="mt-6 space-y-4">
                      <!-- Nombre -->
                      <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                          Nombre completo
                        </label>
                        <input
                          id="name"
                          v-model="form.name"
                          type="text"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Juan Pérez"
                        />
                      </div>

                      <!-- Email (solo en crear) -->
                      <div v-if="!isEditMode">
                        <label for="email" class="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          id="email"
                          v-model="form.email"
                          type="email"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>

                      <!-- Contraseña (solo en crear) -->
                      <div v-if="!isEditMode">
                        <label for="password" class="block text-sm font-medium text-gray-700">
                          Contraseña
                        </label>
                        <input
                          id="password"
                          v-model="form.password"
                          type="password"
                          required
                          minlength="6"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <!-- Rol -->
                      <div>
                        <label for="role" class="block text-sm font-medium text-gray-700">
                          Rol
                        </label>
                        <select
                          id="role"
                          v-model="form.role"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="cleaner">Limpieza</option>
                          <option value="admin">Administrador</option>
                          <option value="super_admin" v-if="authStore.isSuperAdmin">Super Admin</option>
                        </select>
                      </div>

                      <!-- Company (solo si no es super_admin) -->
                      <div v-if="form.role !== 'super_admin'">
                        <label for="companyId" class="block text-sm font-medium text-gray-700">
                          Empresa
                        </label>
                        <select
                          id="companyId"
                          v-model="form.companyId"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Seleccionar empresa...</option>
                          <option v-for="company in activeCompanies" :key="company.id" :value="company.id">
                            {{ company.name }}
                          </option>
                        </select>
                      </div>

                      <!-- Estado activo (solo en editar) -->
                      <div v-if="isEditMode" class="flex items-center">
                        <input
                          id="isActive"
                          v-model="form.isActive"
                          type="checkbox"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label for="isActive" class="ml-2 block text-sm text-gray-700">
                          Usuario activo
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="closeModal"
                      class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      :disabled="usersStore.isLoading"
                      class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {{ usersStore.isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useCompaniesStore } from '@/stores/companies'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user.types'
import { useToast } from 'vue-toastification'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import { Role } from '@/types/role.types'

const usersStore = useUsersStore()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()
const toast = useToast()

// Estado
const showModal = ref(false)
const isEditMode = ref(false)
const editingUser = ref<User | null>(null)

const filters = ref({
  role: '',
  isActive: '',
  search: ''
})

const form = ref<{
  name: string
  email: string
  password: string
  role: Role
  companyId: string
  isActive?: boolean
}>({
  name: '',
  email: '',
  password: '',
  role: Role.CLEANER,
  companyId: ''
})

// Computadas
const users = computed(() => usersStore.users)
const activeCompanies = computed(() => companiesStore.getActiveCompanies())

const filteredUsers = computed(() => {
  let filtered = users.value

  if (filters.value.role) {
    filtered = filtered.filter(u => u.role === filters.value.role)
  }

  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true'
    filtered = filtered.filter(u => u.isActive === isActive)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR')
}

const openCreateModal = () => {
  isEditMode.value = false
  editingUser.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (user: User) => {
  isEditMode.value = true
  editingUser.value = user
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    companyId: user.companyId || '',
    isActive: user.isActive
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    role: Role.CLEANER,
    companyId: '',
    isActive: true
  }
}

const handleSubmit = async () => {
  if (isEditMode.value && editingUser.value) {
    const { email, password, ...updateData } = form.value
    const success = await usersStore.updateUser(editingUser.value.id, updateData)
    if (success) {
      closeModal()
    }
  } else {
    const success = await usersStore.createUser(form.value)
    if (success) {
      closeModal()
    }
  }
}

const confirmDelete = (user: User) => {
  if (confirm(`¿Estás seguro de que querés eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) {
    usersStore.deleteUser(user.id)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    companiesStore.fetchCompanies()
  ])
})
</script>