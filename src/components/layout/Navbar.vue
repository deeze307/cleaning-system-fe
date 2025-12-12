<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo/Título -->
        <div class="flex items-center">
          <img src="../../assets/img/logo_app_dark.png" alt="logo_dark" width="50">
        </div>

        <!-- Menú usuario -->
        <UserMenu />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import UserMenu from '@/components/layout/UserMenu.vue'
</script>