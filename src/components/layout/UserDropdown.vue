<template>
  <transition
    enter-active-class="transition ease-out duration-100"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <MenuItems class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div class="py-1">
        <MenuItem v-slot="{ active }">
          <router-link
            to="/admin/profile"
            :class="[
              active ? 'bg-gray-100' : '',
              'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
            ]"
          >
            Mi Perfil
          </router-link>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            @click="handleLogout"
            :class="[
              active ? 'bg-gray-100' : '',
              'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
            ]"
          >
            Cerrar Sesión
          </button>
        </MenuItem>
      </div>
    </MenuItems>
  </transition>
</template>

<script setup lang="ts">
import { MenuItems, MenuItem } from '@headlessui/vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>