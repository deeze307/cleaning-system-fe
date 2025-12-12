<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    
    <div class="flex">
      <Sidebar />
      
      <!-- Contenido principal -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
</script>