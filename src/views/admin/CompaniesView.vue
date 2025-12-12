<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
        <p class="text-gray-600">Administrá todas las empresas del sistema</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
      >
        <PlusIcon class="h-5 w-5" />
        <span>Nueva Empresa</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="companiesStore.isLoading && companies.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando empresas...</p>
    </div>

    <!-- Lista de empresas -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="company in companies" :key="company.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h3 class="text-lg font-medium text-gray-900">{{ company.name }}</h3>
                    <span
                      :class="[
                        company.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                        'ml-3 px-2 py-1 text-xs font-medium rounded-full'
                      ]"
                    >
                      {{ company.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>
                  <p v-if="company.description" class="text-gray-600 mt-1">{{ company.description }}</p>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Plan: {{ companiesStore.getPlanDisplayName(company.plan) }}</span>
                    <span>Máx. edificios: {{ company.maxBuildings }}</span>
                    <span>Creada: {{ formatDate(company.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="openEditModal(company)"
                class="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                title="Editar empresa"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(company)"
                class="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                title="Eliminar empresa"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
              <router-link
                :to="`/admin/companies/${company.id}`"
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
      <div v-if="companies.length === 0 && !companiesStore.isLoading" class="text-center py-12">
        <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
        <p class="mt-1 text-sm text-gray-500">Comenzá creando tu primera empresa.</p>
        <button
          @click="openCreateModal"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Nueva Empresa
        </button>
      </div>
    </div>

    <!-- Modal para crear/editar empresa -->
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
                        {{ isEditMode ? 'Editar Empresa' : 'Nueva Empresa' }}
                      </DialogTitle>
                    </div>
                    
                    <div class="mt-6 space-y-4">
                      <!-- Nombre -->
                      <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                          Nombre de la empresa
                        </label>
                        <input
                          id="name"
                          v-model="form.name"
                          type="text"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Ej: Hotel Plaza"
                        />
                      </div>

                      <!-- Descripción -->
                      <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">
                          Descripción (opcional)
                        </label>
                        <textarea
                          id="description"
                          v-model="form.description"
                          rows="3"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Descripción de la empresa..."
                        />
                      </div>

                      <!-- Plan -->
                      <div>
                        <label for="plan" class="block text-sm font-medium text-gray-700">
                          Plan
                        </label>
                        <select
                          id="plan"
                          v-model="form.plan"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="basic">Básico</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Empresarial</option>
                        </select>
                      </div>

                      <!-- Máximo de edificios -->
                      <div>
                        <label for="maxBuildings" class="block text-sm font-medium text-gray-700">
                          Máximo de edificios
                        </label>
                        <input
                          id="maxBuildings"
                          v-model.number="form.maxBuildings"
                          type="number"
                          min="1"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <!-- Estado activo -->
                      <div class="flex items-center">
                        <input
                          id="isActive"
                          v-model="form.isActive"
                          type="checkbox"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label for="isActive" class="ml-2 block text-sm text-gray-700">
                          Empresa activa
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
                      :disabled="companiesStore.isLoading"
                      class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {{ companiesStore.isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
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
import { useCompaniesStore } from '@/stores/companies'
import type { Company } from '@/types/company.types'
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
  BuildingOfficeIcon
} from '@heroicons/vue/24/outline'

const companiesStore = useCompaniesStore()
const toast = useToast()

// Estado
const showModal = ref(false)
const isEditMode = ref(false)
const editingCompany = ref<Company | null>(null)

const form = ref({
  name: '',
  description: '',
  plan: 'basic' as 'basic' | 'premium' | 'enterprise',
  maxBuildings: 5,
  isActive: true
})

// Computadas
const companies = computed(() => companiesStore.companies)

// Métodos
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR')
}

const openCreateModal = () => {
  isEditMode.value = false
  editingCompany.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (company: Company) => {
  isEditMode.value = true
  editingCompany.value = company
  form.value = {
    name: company.name,
    description: company.description || '',
    plan: company.plan,
    maxBuildings: company.maxBuildings,
    isActive: company.isActive
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
    description: '',
    plan: 'basic',
    maxBuildings: 5,
    isActive: true
  }
}

const handleSubmit = async () => {
  if (isEditMode.value && editingCompany.value) {
    const success = await companiesStore.updateCompany(editingCompany.value.id, form.value)
    if (success) {
      closeModal()
    }
  } else {
    const success = await companiesStore.createCompany(form.value)
    if (success) {
      closeModal()
    }
  }
}

const confirmDelete = (company: Company) => {
  if (confirm(`¿Estás seguro de que querés eliminar la empresa "${company.name}"? Esta acción no se puede deshacer.`)) {
    companiesStore.deleteCompany(company.id)
  }
}

// Lifecycle
onMounted(() => {
  companiesStore.fetchCompanies()
})
</script>