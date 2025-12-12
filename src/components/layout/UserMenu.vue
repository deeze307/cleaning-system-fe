<template>
  <div class="flex items-center">
    <div class="ml-4 relative">
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <div class="flex items-center space-x-3 px-3 py-2">
              <UserAvatar :name="authStore.user?.name" />
              <UserInfo 
                :name="authStore.user?.name" 
                :role="authStore.user?.role" 
              />
              <ChevronDownIcon class="h-5 w-5 text-gray-400" />
            </div>
          </MenuButton>
        </div>

        <UserDropdown />
      </Menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import UserInfo from '@/components/layout/UserInfo.vue'
import UserDropdown from '@/components/layout/UserDropdown.vue'

const authStore = useAuthStore()
</script>