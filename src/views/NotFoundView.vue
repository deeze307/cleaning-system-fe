<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-300">404</h1>
      <h2 class="text-2xl font-bold text-gray-900 mt-4">Página no encontrada</h2>
      <p class="text-gray-600 mt-2">La página que buscás no existe.</p>
      
      <div class="mt-6 space-x-4">
        <router-link
          to="/"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Ir al inicio
        </router-link>
        <button
          @click="$router.go(-1)"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Volver atrás
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Página 404
</script>