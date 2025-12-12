<template>
  <div class="w-64 bg-white shadow-sm min-h-screen">
    <div class="p-4">
      <nav class="space-y-2">
        <SidebarItem 
          v-for="item in navigationItems" 
          :key="item.name"
          :item="item"
        />
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SidebarItem from '@/components/layout/SidebarItem.vue'
import {
  HomeIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  HomeModernIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

interface NavigationItem {
  name: string
  to: string
  icon: any
  label: string
  requiredRole?: string
}

const allNavigationItems: NavigationItem[] = [
  {
    name: 'AdminDashboard',
    to: '/admin/dashboard',
    icon: HomeIcon,
    label: 'Dashboard'
  },
  {
    name: 'AdminCompanies',
    to: '/admin/companies',
    icon: BuildingOfficeIcon,
    label: 'Empresas',
    requiredRole: 'super_admin'
  },
  {
    name: 'AdminUsers',
    to: '/admin/users',
    icon: UsersIcon,
    label: 'Usuarios'
  },
  {
    name: 'AdminBuildings',
    to: '/admin/buildings',
    icon: BuildingStorefrontIcon,
    label: 'Locaciones'
  },
  {
    name: 'AdminRooms',
    to: '/admin/rooms',
    icon: HomeModernIcon,
    label: 'Habitaciones'
  },
  {
    name: 'AdminTasks',
    to: '/admin/tasks',
    icon: ClipboardDocumentListIcon,
    label: 'Tareas'
  }
]

const navigationItems = computed(() => {
  return allNavigationItems.filter(item => {
    if (!item.requiredRole) return true
    return authStore.user?.role === item.requiredRole
  })
})
</script>