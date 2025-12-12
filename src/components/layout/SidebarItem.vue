<template>
  <router-link
    :to="item.to"
    :class="linkClasses"
  >
    <component :is="item.icon" class="mr-3 h-5 w-5" />
    {{ item.label }}
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavigationItem {
  name: string
  to: string
  icon: any
  label: string
  requiredRole?: string
}

interface Props {
  item: NavigationItem
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  // Para Companies, verificar si la ruta incluye "Company"
  if (props.item.name === 'AdminCompanies') {
    return route.name?.toString().includes('Companies')
  }
  
  // Para Buildings, verificar si la ruta incluye "Building"
  if (props.item.name === 'AdminBuildings') {
    return route.name?.toString().includes('Building')
  }
  
  // Para el resto, comparación exacta
  return route.name === props.item.name
})

const linkClasses = computed(() => [
  isActive.value
    ? 'bg-blue-100 text-blue-700 border-blue-700'
    : 'text-gray-600 hover:bg-gray-50 border-transparent',
  'group flex items-center px-3 py-2 text-sm font-medium rounded-md border-l-4 transition-colors'
])
</script>