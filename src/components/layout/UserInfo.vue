<template>
  <div class="hidden md:block">
    <div class="text-sm font-medium text-gray-700">{{ name }}</div>
    <div class="text-xs text-gray-500">{{ roleDisplayName }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
  role?: string
}

const props = defineProps<Props>()

const roleDisplayName = computed(() => {
  const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    cleaner: 'Limpieza'
  }
  return roleNames[props.role as keyof typeof roleNames] || props.role
})
</script>