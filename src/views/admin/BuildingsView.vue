<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Locaciones</h1>
        <p class="text-gray-600">Administrá todas las locaciones del sistema</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
      >
        <PlusIcon class="h-5 w-5" />
        <span>Nueva Locación</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="filters.type"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="hotel">Habitaciones</option>
            <option value="apartment">Departamento</option>
            <option value="house">Casa</option>
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
            placeholder="Nombre o dirección..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="buildingsStore.isLoading && buildings.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando locaciones...</p>
    </div>

    <!-- Lista de edificios -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="building in filteredBuildings" :key="building.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <BuildingStorefrontIcon class="h-10 w-10 text-blue-600" />
                </div>
                
                <div class="ml-4 flex-1">
                  <div class="flex items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ building.name }}</h3>
                    <span
                      :class="[
                        building.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                        'ml-3 px-2 py-1 text-xs font-medium rounded-full'
                      ]"
                    >
                      {{ building.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <p class="text-gray-600 mt-1">{{ building.address }}</p>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Tipo: {{ buildingsStore.getTypeDisplayName(building.type) }}</span>
                    <span>Creado: {{ formatDate(building.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="openEditModal(building)"
                class="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                title="Editar locación"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(building)"
                class="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                title="Eliminar locación"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
              <router-link
                :to="`/admin/buildings/${building.id}`"
                class="text-gray-600 hover:text-gray-800 p-2 rounded transition-colors"
                title="Ver detalles"
              >
                <EyeIcon class="h-5 w-5" />
              </router-link>
            </div>
          </div>
        </li>
      </ul>

      <!-- Empty state -->
      <div v-if="filteredBuildings.length === 0 && !buildingsStore.isLoading" class="text-center py-12">
        <BuildingStorefrontIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay locaciones</h3>
        <p class="mt-1 text-sm text-gray-500">Comenzá creando tu primer locación.</p>
        <button
          @click="openCreateModal"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Nueva locación
        </button>
      </div>
    </div>

    <!-- Modal para crear/editar edificio -->
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
                        {{ isEditMode ? 'Editar Locación' : 'Nuevo Locación' }}
                      </DialogTitle>
                    </div>
                    
                    <div class="mt-6 space-y-4">
                      <!-- Nombre -->
                      <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                          Nombre
                        </label>
                        <input
                          id="name"
                          v-model="form.name"
                          type="text"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Ej: Torre Central"
                        />
                      </div>

                      <!-- Tipo -->
                      <div>
                        <label for="type" class="block text-sm font-medium text-gray-700">
                          Tipo
                        </label>
                        <select
                          id="type"
                          v-model="form.type"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="hotel">Habitaciones</option>
                          <option value="apartment">Departamento</option>
                          <option value="house">Casa</option>
                        </select>
                      </div>

                      <!-- Dirección -->
                      <div>
                        <label for="address" class="block text-sm font-medium text-gray-700">
                          Dirección
                        </label>
                        <textarea
                          id="address"
                          v-model="form.address"
                          rows="2"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Av. Principal 123, Ciudad"
                        />
                      </div>

                      <!-- Empresa (solo super admin puede elegir, admins usan la suya) -->
                      <div v-if="authStore.isSuperAdmin && !isEditMode">
                        <label for="companyId" class="block text-sm font-medium text-gray-700">
                          Empresa
                        </label>
                        <select
                          id="companyId"
                          v-model="form.companyId"
                          required
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
                          Locación activa
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
                      :disabled="buildingsStore.isLoading"
                      class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {{ buildingsStore.isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
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
import { useBuildingsStore } from '@/stores/buildings'
import { useCompaniesStore } from '@/stores/companies'
import { useAuthStore } from '@/stores/auth'
import type { Building } from '@/types/building.types'
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
  EyeIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'

const buildingsStore = useBuildingsStore()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()
const toast = useToast()

// Estado
const showModal = ref(false)
const isEditMode = ref(false)
const editingBuilding = ref<Building | null>(null)

const filters = ref({
  type: '',
  isActive: '',
  search: ''
})

const form = ref<{
  name: string
  type: 'hotel' | 'apartment' | 'house'
  address: string
  companyId: string
  isActive?: boolean
}>({
  name: '',
  type: 'hotel',
  address: '',
  companyId: ''
})

// Computadas
const buildings = computed(() => buildingsStore.buildings)
const activeCompanies = computed(() => companiesStore.getActiveCompanies())

const filteredBuildings = computed(() => {
  let filtered = buildings.value

  if (filters.value.type) {
    filtered = filtered.filter(b => b.type === filters.value.type)
  }

  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true'
    filtered = filtered.filter(b => b.isActive === isActive)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(search) ||
      b.address.toLowerCase().includes(search)
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
  editingBuilding.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (building: Building) => {
  isEditMode.value = true
  editingBuilding.value = building
  form.value = {
    name: building.name,
    type: building.type,
    address: building.address,
    companyId: building.companyId,
    isActive: building.isActive
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
    type: 'hotel',
    address: '',
    companyId: authStore.user?.companyId || '',
    isActive: undefined
  }
}

const handleSubmit = async () => {
  if (isEditMode.value && editingBuilding.value) {
    const { companyId, ...updateData } = form.value
    const success = await buildingsStore.updateBuilding(editingBuilding.value.id, updateData)
    if (success) {
      closeModal()
    }
  } else {
    const { isActive, ...createData } = form.value
    const success = await buildingsStore.createBuilding(createData)
    if (success) {
      closeModal()
    }
  }
}

const confirmDelete = (building: Building) => {
  if (confirm(`¿Estás seguro de que querés eliminar la locación "${building.name}"? Esta acción no se puede deshacer.`)) {
    buildingsStore.deleteBuilding(building.id)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    buildingsStore.fetchBuildings(),
    companiesStore.fetchCompanies()
  ])
})
</script>