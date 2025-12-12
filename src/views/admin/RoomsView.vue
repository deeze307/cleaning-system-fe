<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Habitaciones</h1>
        <p class="text-gray-600">Administrá todas las habitaciones del sistema</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
      >
        <PlusIcon class="h-5 w-5" />
        <span>Nueva Habitación</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Locación</label>
          <select
            v-model="filters.buildingId"
            @change="handleBuildingFilter"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas las locaciones</option>
            <option v-for="building in activeBuildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.isActive"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nombre de habitación..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="roomsStore.isLoading && rooms.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando habitaciones...</p>
    </div>

    <!-- Lista de habitaciones -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="room in filteredRooms" :key="room.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <HomeModernIcon class="h-10 w-10 text-purple-600" />
                </div>
                
                <div class="ml-4 flex-1">
                  <div class="flex items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ room.name }}</h3>
                    <span
                      :class="[
                        room.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                        'ml-3 px-2 py-1 text-xs font-medium rounded-full'
                      ]"
                    >
                      {{ room.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>
                  <p class="text-gray-600 mt-1">
                    {{ getBuildingName(room.buildingId) }}
                  </p>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span class="flex items-center">
                      🛏️ {{ room.bedsSummary }}
                    </span>
                    <span>Total: {{ roomsStore.getTotalBeds(room) }} camas</span>
                    <span>Creada: {{ formatDate(room.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="openEditModal(room)"
                class="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                title="Editar habitación"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(room)"
                class="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                title="Eliminar habitación"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Empty state -->
      <div v-if="filteredRooms.length === 0 && !roomsStore.isLoading" class="text-center py-12">
        <HomeModernIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay habitaciones</h3>
        <p class="mt-1 text-sm text-gray-500">Comenzá creando tu primera habitación.</p>
        <button
          @click="openCreateModal"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Nueva Habitación
        </button>
      </div>
    </div>

    <!-- Modal para crear/editar habitación -->
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
                        {{ isEditMode ? 'Editar Habitación' : 'Nueva Habitación' }}
                      </DialogTitle>
                    </div>
                    
                    <div class="mt-6 space-y-4">
                      <!-- Nombre -->
                      <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                          Nombre/Número de habitación
                        </label>
                        <input
                          id="name"
                          v-model="form.name"
                          type="text"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Ej: 101, Suite Presidencial"
                        />
                      </div>

                      <!-- Edificio (solo en crear) -->
                      <div v-if="!isEditMode">
                        <label for="buildingId" class="block text-sm font-medium text-gray-700">
                          Edificio
                        </label>
                        <select
                          id="buildingId"
                          v-model="form.buildingId"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Seleccionar edificio...</option>
                          <option v-for="building in activeBuildings" :key="building.id" :value="building.id">
                            {{ building.name }}
                          </option>
                        </select>
                      </div>

                      <!-- Configuración de camas -->
                      <div class="border-t pt-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Configuración de Camas</h4>
                        
                        <!-- Camas King -->
                        <div class="mb-3">
                          <label for="kingBeds" class="block text-sm font-medium text-gray-700">
                            Camas King
                          </label>
                          <input
                            id="kingBeds"
                            v-model.number="form.bedConfiguration.kingBeds"
                            type="number"
                            min="0"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>

                        <!-- Camas Individuales -->
                        <div>
                          <label for="individualBeds" class="block text-sm font-medium text-gray-700">
                            Camas Individuales
                          </label>
                          <input
                            id="individualBeds"
                            v-model.number="form.bedConfiguration.individualBeds"
                            type="number"
                            min="0"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>

                        <!-- Resumen -->
                        <div class="mt-3 p-3 bg-blue-50 rounded-md">
                          <p class="text-sm text-blue-900">
                            <strong>Total:</strong> {{ totalBedsPreview }} cama{{ totalBedsPreview !== 1 ? 's' : '' }}
                          </p>
                        </div>
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
                          Habitación activa
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
                      :disabled="roomsStore.isLoading || totalBedsPreview === 0"
                      class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {{ roomsStore.isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
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
import { useRoomsStore } from '@/stores/rooms'
import { useBuildingsStore } from '@/stores/buildings'
import type { Room } from '@/types/room.types'
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
  HomeModernIcon
} from '@heroicons/vue/24/outline'

const roomsStore = useRoomsStore()
const buildingsStore = useBuildingsStore()
const toast = useToast()

// Estado
const showModal = ref(false)
const isEditMode = ref(false)
const editingRoom = ref<Room | null>(null)

const filters = ref({
  buildingId: '',
  isActive: '',
  search: ''
})

const form = ref<{
  name: string
  buildingId: string
  bedConfiguration: {
    kingBeds: number
    individualBeds: number
  }
  isActive?: boolean
}>({
  name: '',
  buildingId: '',
  bedConfiguration: {
    kingBeds: 0,
    individualBeds: 0
  }
})

// Computadas
const rooms = computed(() => roomsStore.rooms)
const activeBuildings = computed(() => buildingsStore.getActiveBuildings())

const totalBedsPreview = computed(() => {
  return form.value.bedConfiguration.kingBeds + form.value.bedConfiguration.individualBeds
})

const filteredRooms = computed(() => {
  let filtered = rooms.value

  if (filters.value.buildingId) {
    filtered = filtered.filter(r => r.buildingId === filters.value.buildingId)
  }

  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true'
    filtered = filtered.filter(r => r.isActive === isActive)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR')
}

const getBuildingName = (buildingId: string) => {
  const building = activeBuildings.value.find(b => b.id === buildingId)
  return building ? building.name : 'Edificio desconocido'
}

const handleBuildingFilter = async () => {
  if (filters.value.buildingId) {
    await roomsStore.fetchRooms(filters.value.buildingId)
  } else {
    await roomsStore.fetchRooms()
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  editingRoom.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (room: Room) => {
  isEditMode.value = true
  editingRoom.value = room
  form.value = {
    name: room.name,
    buildingId: room.buildingId,
    bedConfiguration: { ...room.bedConfiguration },
    isActive: room.isActive
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
    buildingId: '',
    bedConfiguration: {
      kingBeds: 0,
      individualBeds: 0
    },
    isActive: undefined
  }
}

const handleSubmit = async () => {
  if (isEditMode.value && editingRoom.value) {
    const { buildingId, ...updateData } = form.value
    const success = await roomsStore.updateRoom(editingRoom.value.id, updateData)
    if (success) {
      closeModal()
    }
  } else {
    const { isActive, ...createData } = form.value
    const success = await roomsStore.createRoom(createData)
    if (success) {
      closeModal()
    }
  }
}

const confirmDelete = (room: Room) => {
  if (confirm(`¿Estás seguro de que querés eliminar la habitación "${room.name}"? Esta acción no se puede deshacer.`)) {
    roomsStore.deleteRoom(room.id)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    roomsStore.fetchRooms(),
    buildingsStore.fetchBuildings()
  ])
})
</script>